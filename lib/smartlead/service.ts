import { smartleadGet, smartleadGetPaginated } from "./client";
import {
  RawSmartleadCampaign,
  RawSmartleadCampaignAnalytics,
  RawSmartleadEmailAccount,
  RawSmartleadWarmupStats,
  RawSmartleadStatisticItem,
  CampaignMetrics,
  DashboardPayload,
  DailyTrendPoint,
  MailboxHealth,
  HealthAlert,
} from "./types";
import {
  normalizeCampaign,
  aggregateCampaignMetrics,
  buildSegmentSummaries,
  normalizeMailbox,
} from "./normalize";
import { SEGMENTS } from "../../segments.config";

// Cache state for stale-while-revalidate and fallback recovery
interface CachedData {
  timestamp: string;
  payload: DashboardPayload;
}

let memorySnapshot: CachedData | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Configurable deliverability thresholds
export const THRESHOLDS = {
  BOUNCE_RATE_CRITICAL: 0.05, // 5%
  BOUNCE_RATE_WARNING: 0.03, // 3%
  REPLY_RATE_LOW_WARNING: 0.015, // 1.5% with > 50 sent
  WARMUP_INBOX_MIN: 0.90, // 90%
};

/**
 * Generates health and deliverability alerts based on campaign & mailbox health
 */
function generateHealthAlerts(
  campaigns: CampaignMetrics[],
  mailboxes: MailboxHealth[]
): HealthAlert[] {
  const alerts: HealthAlert[] = [];

  // 1. Mailbox SMTP / IMAP failures
  for (const mb of mailboxes) {
    if (!mb.isSmtpSuccess || !mb.isImapSuccess) {
      alerts.push({
        id: `mb-conn-${mb.id}`,
        severity: "critical",
        title: `Mailbox Connection Error: ${mb.fromEmail}`,
        message: `SMTP or IMAP connection failed. Emails cannot be sent or replies tracked on this account.`,
        targetType: "mailbox",
        targetName: mb.fromEmail,
      });
    }

    if (!mb.spfVerified || !mb.dkimVerified || !mb.dmarcVerified) {
      const missing = [];
      if (!mb.spfVerified) missing.push("SPF");
      if (!mb.dkimVerified) missing.push("DKIM");
      if (!mb.dmarcVerified) missing.push("DMARC");
      alerts.push({
        id: `mb-dns-${mb.id}`,
        severity: "warning",
        title: `DNS Records Incomplete: ${mb.domain}`,
        message: `${missing.join(", ")} verification missing or pending on ${mb.domain}. May degrade inbox placement.`,
        targetType: "dns",
        targetName: mb.domain,
      });
    }

    if (mb.inboxPlacementRate !== null && mb.inboxPlacementRate < THRESHOLDS.WARMUP_INBOX_MIN) {
      alerts.push({
        id: `mb-warmup-${mb.id}`,
        severity: "warning",
        title: `Low Inbox Placement: ${mb.fromEmail}`,
        message: `Warmup inbox placement is ${(mb.inboxPlacementRate * 100).toFixed(0)}% (threshold is ${(THRESHOLDS.WARMUP_INBOX_MIN * 100).toFixed(0)}%). Check spam triggers.`,
        targetType: "mailbox",
        targetName: mb.fromEmail,
      });
    }
  }

  // 2. Campaign bounce and reply alerts
  for (const camp of campaigns) {
    if (camp.sent >= 30) {
      const bounce = camp.rates.bounceRate ?? 0;
      if (bounce >= THRESHOLDS.BOUNCE_RATE_CRITICAL) {
        alerts.push({
          id: `camp-bounce-crit-${camp.id}`,
          severity: "critical",
          title: `Critical Bounce Rate: ${camp.name}`,
          message: `Bounce rate is ${(bounce * 100).toFixed(1)}% (exceeds critical threshold of ${(THRESHOLDS.BOUNCE_RATE_CRITICAL * 100).toFixed(0)}%). Consider cleaning your lead list immediately.`,
          targetType: "campaign",
          targetName: camp.name,
        });
      } else if (bounce >= THRESHOLDS.BOUNCE_RATE_WARNING) {
        alerts.push({
          id: `camp-bounce-warn-${camp.id}`,
          severity: "warning",
          title: `Elevated Bounce Rate: ${camp.name}`,
          message: `Bounce rate is ${(bounce * 100).toFixed(1)}% (warning threshold is ${(THRESHOLDS.BOUNCE_RATE_WARNING * 100).toFixed(0)}%).`,
          targetType: "campaign",
          targetName: camp.name,
        });
      }

      const reply = camp.rates.replyRate ?? 0;
      if (camp.status === "ACTIVE" && camp.sent >= 50 && reply < THRESHOLDS.REPLY_RATE_LOW_WARNING) {
        alerts.push({
          id: `camp-reply-low-${camp.id}`,
          severity: "info",
          title: `Subdued Reply Rate: ${camp.name}`,
          message: `Reply rate is ${(reply * 100).toFixed(1)}% across ${camp.sent} sent emails. Sequence copy or targeting review advised.`,
          targetType: "campaign",
          targetName: camp.name,
        });
      }
    }
  }

  return alerts;
}

/**
 * Fetches and normalizes raw Smartlead campaigns and analytics across all configured keys
 */
async function fetchAllRawCampaigns(): Promise<Array<{ raw: RawSmartleadCampaign; originKeyEnv: string }>> {
  const distinctKeys = new Map<string, string>();

  // Add primary key
  const primaryKey = process.env.SMARTLEAD_API_KEY;
  if (primaryKey) {
    distinctKeys.set("SMARTLEAD_API_KEY", primaryKey);
  }

  // Check Mode B: segments with distinct keys
  for (const seg of SEGMENTS) {
    const customKey = process.env[seg.apiKeyEnv];
    if (customKey && !distinctKeys.has(seg.apiKeyEnv)) {
      distinctKeys.set(seg.apiKeyEnv, customKey);
    }
  }

  const allRaw: Array<{ raw: RawSmartleadCampaign; originKeyEnv: string }> = [];

  for (const [keyEnv, apiKey] of distinctKeys.entries()) {
    try {
      const campaignsList = await smartleadGet<RawSmartleadCampaign[]>("/campaigns/", {
        include_tags: "true",
      }, { apiKey });

      if (Array.isArray(campaignsList)) {
        for (const c of campaignsList) {
          allRaw.push({ raw: c, originKeyEnv: keyEnv });
        }
      }
    } catch (err: any) {
      console.error(`Failed to fetch campaigns for keyEnv=${keyEnv}:`, err.message);
    }
  }

  return allRaw;
}

/**
 * Builds daily trend points by querying statistics or warmup dates
 */
async function buildTrendData(campaigns: CampaignMetrics[]): Promise<DailyTrendPoint[]> {
  const dailyMap: Record<string, DailyTrendPoint> = {};

  // For campaigns with sent emails, fetch recent statistics (up to 200 items) to map real dates
  const activeOrSentCampaigns = campaigns.filter((c) => c.sent > 0);

  for (const camp of activeOrSentCampaigns) {
    try {
      const statsRes = await smartleadGet<{ total_stats: string; data: RawSmartleadStatisticItem[] }>(
        `/campaigns/${camp.id}/statistics`,
        { limit: 200, offset: 0 }
      );

      if (statsRes && Array.isArray(statsRes.data)) {
        for (const item of statsRes.data) {
          if (!item.sent_time) continue;
          const dateStr = item.sent_time.slice(0, 10);
          if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = {
              date: dateStr,
              sent: 0,
              replied: 0,
              opened: 0,
              clicked: 0,
              bounced: 0,
            };
          }

          dailyMap[dateStr].sent++;
          if (item.open_time || (item.open_count && item.open_count > 0)) {
            dailyMap[dateStr].opened++;
          }
          if (item.click_time || (item.click_count && item.click_count > 0)) {
            dailyMap[dateStr].clicked++;
          }
          if (item.reply_time) {
            dailyMap[dateStr].replied++;
          }
          if (item.is_bounced || item.sender_bounce) {
            dailyMap[dateStr].bounced++;
          }
        }
      }
    } catch (err: any) {
      console.warn(`Could not fetch statistics for trend on campaign ${camp.id}:`, err.message);
    }
  }

  // Sort chronologically
  const trendPoints = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  // If no email statistics yet, supply clean 7-day placeholder range with 0s
  if (trendPoints.length === 0) {
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      trendPoints.push({
        date: ds,
        sent: 0,
        replied: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
      });
    }
  }

  return trendPoints;
}

/**
 * Main service fetcher: queries campaigns, analytics, mailboxes, and compiles dashboard payload
 */
export async function getDashboardData(forceRefresh = false): Promise<DashboardPayload> {
  const now = Date.now();

  // Return cached snapshot if fresh
  if (!forceRefresh && memorySnapshot && now - lastFetchTime < CACHE_TTL_MS) {
    return memorySnapshot.payload;
  }

  try {
    // 1. Fetch campaigns
    const rawCampaignsWithEnv = await fetchAllRawCampaigns();

    // 2. Fetch analytics for each campaign
    const normalizedCampaigns: CampaignMetrics[] = [];
    for (const item of rawCampaignsWithEnv) {
      try {
        const analytics = await smartleadGet<RawSmartleadCampaignAnalytics>(
          `/campaigns/${item.raw.id}/analytics`
        );
        normalizedCampaigns.push(normalizeCampaign(item.raw, analytics, item.originKeyEnv));
      } catch (err: any) {
        console.warn(`Failed to fetch analytics for campaign ${item.raw.id}:`, err.message);
        // Normalize even if analytics failed (defaults to 0, never crash)
        normalizedCampaigns.push(normalizeCampaign(item.raw, undefined, item.originKeyEnv));
      }
    }

    // 3. Fetch mailboxes and warmup stats
    const rawMailboxes = await smartleadGet<RawSmartleadEmailAccount[]>("/email-accounts/", {
      limit: 100,
    }).catch(() => []);

    const mailboxes: MailboxHealth[] = [];
    if (Array.isArray(rawMailboxes)) {
      for (const mb of rawMailboxes) {
        let warmup: RawSmartleadWarmupStats | undefined;
        try {
          warmup = await smartleadGet<RawSmartleadWarmupStats>(
            `/email-accounts/${mb.id}/warmup-stats`
          );
        } catch {
          // Warmup stats optional
        }
        mailboxes.push(normalizeMailbox(mb, warmup));
      }
    }

    // 4. Compute overall aggregates & segment summaries
    const aggregates = aggregateCampaignMetrics(normalizedCampaigns);
    const segments = buildSegmentSummaries(normalizedCampaigns);

    // 5. Build daily performance trend
    const trend = await buildTrendData(normalizedCampaigns);

    // 6. Generate health alerts
    const alerts = generateHealthAlerts(normalizedCampaigns, mailboxes);

    const payload: DashboardPayload = {
      lastUpdated: new Date().toISOString(),
      isStaleFallback: false,
      selectedSegment: "all",
      selectedDateRange: "30d",
      aggregates,
      segments,
      campaigns: normalizedCampaigns,
      trend,
      mailboxes,
      alerts,
    };

    // Update memory cache
    memorySnapshot = {
      timestamp: payload.lastUpdated,
      payload,
    };
    lastFetchTime = Date.now();

    return payload;
  } catch (err: any) {
    console.error("[getDashboardData] Error fetching live Smartlead data:", err.message);

    // Hard constraint: If Smartlead is unreachable, serve last cached data with its timestamp
    if (memorySnapshot) {
      console.warn("[getDashboardData] Serving stale cached snapshot as fallback banner");
      return {
        ...memorySnapshot.payload,
        isStaleFallback: true,
      };
    }

    throw err;
  }
}

/**
 * Campaign details fetcher for row click drawer
 */
export async function getCampaignDetails(campaignId: number) {
  const [campaign, analytics, emailAccounts, statsRes] = await Promise.all([
    smartleadGet<RawSmartleadCampaign>(`/campaigns/${campaignId}`),
    smartleadGet<RawSmartleadCampaignAnalytics>(`/campaigns/${campaignId}/analytics`).catch(() => undefined),
    smartleadGet<RawSmartleadEmailAccount[]>(`/campaigns/${campaignId}/email-accounts`).catch(() => []),
    smartleadGet<{ total_stats: string; data: RawSmartleadStatisticItem[] }>(
      `/campaigns/${campaignId}/statistics`,
      { limit: 200 }
    ).catch(() => ({ total_stats: "0", data: [] })),
  ]);

  const normalized = normalizeCampaign(campaign, analytics);

  // Per-sequence breakdown
  const sequenceMap: Record<number, {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    bounced: number;
    subject: string;
  }> = {};

  if (statsRes && Array.isArray(statsRes.data)) {
    for (const item of statsRes.data) {
      const seqNum = Number(item.sequence_number) || 1;
      if (!sequenceMap[seqNum]) {
        sequenceMap[seqNum] = {
          sent: 0,
          opened: 0,
          clicked: 0,
          replied: 0,
          bounced: 0,
          subject: item.email_subject || `Step ${seqNum}`,
        };
      }
      sequenceMap[seqNum].sent++;
      if (item.open_time || (item.open_count && item.open_count > 0)) sequenceMap[seqNum].opened++;
      if (item.click_time || (item.click_count && item.click_count > 0)) sequenceMap[seqNum].clicked++;
      if (item.reply_time) sequenceMap[seqNum].replied++;
      if (item.is_bounced || item.sender_bounce) sequenceMap[seqNum].bounced++;
    }
  }

  const sequenceStats = Object.entries(sequenceMap).map(([seqStr, stat]) => ({
    sequenceNumber: Number(seqStr),
    subject: stat.subject,
    sent: stat.sent,
    opened: stat.opened,
    clicked: stat.clicked,
    replied: stat.replied,
    bounced: stat.bounced,
    replyRate: stat.sent > 0 ? stat.replied / stat.sent : null,
    openRate: stat.sent > 0 ? stat.opened / stat.sent : null,
    clickRate: stat.sent > 0 ? stat.clicked / stat.sent : null,
  })).sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  return {
    campaign: normalized,
    emailAccounts: Array.isArray(emailAccounts) ? emailAccounts.map((a) => normalizeMailbox(a)) : [],
    sequenceStats,
  };
}
