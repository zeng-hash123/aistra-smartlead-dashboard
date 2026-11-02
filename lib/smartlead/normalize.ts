import {
  RawSmartleadCampaign,
  RawSmartleadCampaignAnalytics,
  RawSmartleadEmailAccount,
  RawSmartleadWarmupStats,
  CampaignMetrics,
  AggregateMetrics,
  SegmentSummary,
  ComputedRates,
  MailboxHealth,
  LeadsByStatus,
} from "./types";
import { resolveCampaignSegment, SEGMENTS, UNASSIGNED_SEGMENT } from "../../segments.config";

/**
 * Safely parses any value (number, string, null, undefined) into a finite number. Defaults to 0.
 */
export function safeNumber(val: any, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "number") return Number.isFinite(val) ? val : fallback;
  if (typeof val === "string") {
    const cleaned = val.replace(/,/g, "").trim();
    if (!cleaned) return fallback;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

/**
 * Computes rates guarding against divide-by-zero. Returns null when denominator is 0.
 */
export function computeRates(
  sent: number,
  replied: number,
  opened: number,
  clicked: number,
  bounced: number,
  unsubscribed: number,
  leadsTotal: number,
  leadsCompleted: number
): ComputedRates {
  return {
    replyRate: sent > 0 ? replied / sent : null,
    openRate: sent > 0 ? opened / sent : null,
    clickRate: sent > 0 ? clicked / sent : null,
    bounceRate: sent > 0 ? bounced / sent : null,
    unsubscribeRate: sent > 0 ? unsubscribed / sent : null,
    completionRate: leadsTotal > 0 ? leadsCompleted / leadsTotal : null,
  };
}

/**
 * Normalizes a raw campaign + analytics response into stable CampaignMetrics
 */
export function normalizeCampaign(
  raw: RawSmartleadCampaign,
  analytics?: RawSmartleadCampaignAnalytics,
  originKeyEnv?: string
): CampaignMetrics {
  const segment = resolveCampaignSegment({
    name: raw.name || "",
    client_id: raw.client_id !== null && raw.client_id !== undefined ? Number(raw.client_id) : null,
    tags: raw.tags,
    originKeyEnv,
  });

  const sent = safeNumber(analytics?.sent_count);
  const uniqueSent = safeNumber(analytics?.unique_sent_count, sent);
  const opened = safeNumber(analytics?.open_count);
  const uniqueOpened = safeNumber(analytics?.unique_open_count, opened);
  const clicked = safeNumber(analytics?.click_count);
  const uniqueClicked = safeNumber(analytics?.unique_click_count, clicked);
  const replied = safeNumber(analytics?.reply_count);
  const bounced = safeNumber(analytics?.bounce_count);
  const unsubscribed = safeNumber(analytics?.unsubscribed_count);

  const rawLeadStats = analytics?.campaign_lead_stats;
  const leadsInProgress = safeNumber(rawLeadStats?.inprogress);
  const leadsCompleted = safeNumber(rawLeadStats?.completed);
  const leadsBlocked = safeNumber(rawLeadStats?.blocked);
  const leadsStarted = safeNumber(rawLeadStats?.notStarted);
  const leadsTotal = safeNumber(rawLeadStats?.total, leadsInProgress + leadsCompleted + leadsBlocked + leadsStarted);

  const leadsByStatus: LeadsByStatus = {
    started: leadsStarted,
    inProgress: leadsInProgress,
    completed: leadsCompleted,
    blocked: leadsBlocked,
  };

  const rates = computeRates(
    sent,
    replied,
    opened,
    clicked,
    bounced,
    unsubscribed,
    leadsTotal,
    leadsCompleted
  );

  const interestedVal = safeNumber(rawLeadStats?.interested);

  return {
    id: safeNumber(raw.id),
    name: raw.name || `Campaign #${raw.id}`,
    segmentKey: segment.key,
    segmentLabel: segment.label,
    status: (raw.status || "UNKNOWN").toUpperCase(),
    createdAt: raw.created_at || new Date().toISOString(),
    clientId: raw.client_id !== null && raw.client_id !== undefined ? safeNumber(raw.client_id) : null,
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((t) => (typeof t === "string" ? t : t?.name || ""))
      : [],
    maxLeadsPerDay: safeNumber(raw.max_leads_per_day, 50),
    leadsTotal,
    leadsByStatus,
    sent,
    uniqueSent,
    opened,
    uniqueOpened,
    clicked,
    uniqueClicked,
    replied,
    bounced,
    unsubscribed,
    interestedReplies: interestedVal > 0 ? interestedVal : null,
    rates,
  };
}

/**
 * Aggregates multiple CampaignMetrics into a single AggregateMetrics.
 * IMPORTANT: Rates are computed strictly from summed totals (weighted rates), never averaged percentages!
 */
export function aggregateCampaignMetrics(campaigns: CampaignMetrics[]): AggregateMetrics {
  let sent = 0;
  let uniqueSent = 0;
  let opened = 0;
  let uniqueOpened = 0;
  let clicked = 0;
  let uniqueClicked = 0;
  let replied = 0;
  let bounced = 0;
  let unsubscribed = 0;
  let leadsTotal = 0;
  const leadsByStatus: LeadsByStatus = {
    started: 0,
    inProgress: 0,
    completed: 0,
    blocked: 0,
  };

  let activeCampaignsCount = 0;

  for (const c of campaigns) {
    sent += c.sent;
    uniqueSent += c.uniqueSent;
    opened += c.opened;
    uniqueOpened += c.uniqueOpened;
    clicked += c.clicked;
    uniqueClicked += c.uniqueClicked;
    replied += c.replied;
    bounced += c.bounced;
    unsubscribed += c.unsubscribed;
    leadsTotal += c.leadsTotal;

    leadsByStatus.started += c.leadsByStatus.started;
    leadsByStatus.inProgress += c.leadsByStatus.inProgress;
    leadsByStatus.completed += c.leadsByStatus.completed;
    leadsByStatus.blocked += c.leadsByStatus.blocked;

    if (c.status === "ACTIVE") {
      activeCampaignsCount++;
    }
  }

  const rates = computeRates(
    sent,
    replied,
    opened,
    clicked,
    bounced,
    unsubscribed,
    leadsTotal,
    leadsByStatus.completed
  );

  return {
    campaignsCount: campaigns.length,
    activeCampaignsCount,
    leadsTotal,
    leadsByStatus,
    sent,
    uniqueSent,
    opened,
    uniqueOpened,
    clicked,
    uniqueClicked,
    replied,
    bounced,
    unsubscribed,
    rates,
  };
}

/**
 * Groups campaigns by segment and computes summaries for Creative, Accounting, and any Unassigned
 */
export function buildSegmentSummaries(campaigns: CampaignMetrics[]): SegmentSummary[] {
  const summaries: SegmentSummary[] = [];

  for (const seg of SEGMENTS) {
    const segCampaigns = campaigns.filter((c) => c.segmentKey === seg.key);
    summaries.push({
      key: seg.key,
      label: seg.label,
      metrics: aggregateCampaignMetrics(segCampaigns),
    });
  }

  const unassigned = campaigns.filter((c) => c.segmentKey === UNASSIGNED_SEGMENT.key);
  if (unassigned.length > 0) {
    summaries.push({
      key: UNASSIGNED_SEGMENT.key,
      label: UNASSIGNED_SEGMENT.label,
      metrics: aggregateCampaignMetrics(unassigned),
    });
  }

  return summaries;
}

/**
 * Normalizes email accounts and warmup stats
 */
export function normalizeMailbox(
  raw: RawSmartleadEmailAccount,
  warmup?: RawSmartleadWarmupStats
): MailboxHealth {
  const email = raw.from_email || raw.username || "unknown@domain.com";
  const domain = email.includes("@") ? email.split("@")[1].toLowerCase() : "unknown";

  const warmupSent7d = safeNumber(warmup?.sent_count);
  const warmupInbox7d = safeNumber(warmup?.inbox_count);
  const warmupSpam7d = safeNumber(warmup?.spam_count);

  const totalDelivered = warmupInbox7d + warmupSpam7d;
  const inboxPlacementRate = totalDelivered > 0 ? warmupInbox7d / totalDelivered : null;

  let rep = "100%";
  if (raw.warmup_details?.warmup_reputation) {
    rep = String(raw.warmup_details.warmup_reputation);
    if (!rep.endsWith("%") && Number.isFinite(Number(rep))) {
      rep = `${rep}%`;
    }
  }

  return {
    id: safeNumber(raw.id),
    fromName: raw.from_name || "Sender",
    fromEmail: email,
    domain,
    type: raw.type || "SMTP",
    dailySentCount: safeNumber(raw.daily_sent_count),
    messagePerDay: safeNumber(raw.message_per_day, 35),
    warmupReputation: rep,
    warmupSent7d,
    warmupInbox7d,
    warmupSpam7d,
    inboxPlacementRate,
    isSmtpSuccess: raw.is_smtp_success ?? true,
    isImapSuccess: raw.is_imap_success ?? true,
    spfVerified: raw.dns_validation_status?.isSPFVerified ?? true,
    dkimVerified: raw.dns_validation_status?.isDKIMVerified ?? true,
    dmarcVerified: raw.dns_validation_status?.isDMARCVerified ?? true,
  };
}

/**
 * Formatting utilities for the UI
 */
export function formatPercent(rate: number | null | undefined, decimals = 1): string {
  if (rate === null || rate === undefined || !Number.isFinite(rate)) {
    return "–";
  }
  return `${(rate * 100).toFixed(decimals)}%`;
}

export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return "0";
  }
  return new Intl.NumberFormat("en-US").format(val);
}
