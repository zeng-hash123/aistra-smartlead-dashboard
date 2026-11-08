// Raw Smartlead API Types (Tolerant: strings, numbers, or nulls)
export interface RawSmartleadCampaign {
  id: number | string;
  user_id?: number | string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "STOPPED" | "ARCHIVED" | "DRAFTED" | string;
  created_at?: string;
  updated_at?: string;
  client_id?: number | string | null;
  tags?: any[] | null;
  max_leads_per_day?: number | string;
  scheduler_cron_value?: any;
}

export interface RawSmartleadLeadStats {
  total?: number | string;
  inprogress?: number | string;
  completed?: number | string;
  blocked?: number | string;
  notStarted?: number | string;
  paused?: number | string;
  stopped?: number | string;
  interested?: number | string;
  revenue?: number | string;
}

export interface RawSmartleadCampaignAnalytics {
  id: number | string;
  name?: string;
  status?: string;
  sent_count?: number | string;
  open_count?: number | string;
  click_count?: number | string;
  reply_count?: number | string;
  bounce_count?: number | string;
  unsubscribed_count?: number | string;
  unique_sent_count?: number | string;
  unique_open_count?: number | string;
  unique_click_count?: number | string;
  total_count?: number | string;
  campaign_lead_stats?: RawSmartleadLeadStats;
  client_id?: number | string | null;
  client_name?: string | null;
  sender_bounce_count?: number | string;
}

export interface RawSmartleadDateAnalytics {
  id?: number | string;
  name?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  sent_count?: number | string;
  unique_sent_count?: number | string;
  open_count?: number | string;
  unique_open_count?: number | string;
  click_count?: number | string;
  unique_click_count?: number | string;
  reply_count?: number | string;
  total_reply_count?: number | string;
  non_ooo_reply_count?: number | string;
  bounce_count?: number | string;
  unsubscribed_count?: number | string;
  block_count?: number | string;
}

export interface RawSmartleadEmailAccount {
  id: number | string;
  from_name?: string;
  from_email?: string;
  username?: string;
  type?: string;
  daily_sent_count?: number | string;
  message_per_day?: number | string;
  is_smtp_success?: boolean;
  is_imap_success?: boolean;
  smtp_failure_error?: string | null;
  imap_failure_error?: string | null;
  warmup_details?: {
    status?: string;
    total_sent_count?: number | string;
    total_spam_count?: number | string;
    warmup_reputation?: string | number;
    reply_rate?: number | string;
  };
  dns_validation_status?: {
    isSPFVerified?: boolean;
    isDKIMVerified?: boolean;
    isDMARCVerified?: boolean;
    lastVerifiedTime?: string;
  };
}

export interface RawSmartleadWarmupStats {
  id: number | string;
  sent_count?: number | string;
  spam_count?: number | string;
  inbox_count?: number | string;
  warmup_email_received_count?: number | string;
  stats_by_date?: Array<{
    id?: number | string;
    date: string;
    sent_count?: number;
    reply_count?: number;
    save_from_spam_count?: number;
  }>;
}

export interface RawSmartleadStatisticItem {
  lead_name?: string;
  lead_email?: string;
  lead_category?: string | null;
  sequence_number?: number | string;
  stats_id?: string;
  email_subject?: string;
  sent_time?: string | null;
  open_time?: string | null;
  click_time?: string | null;
  reply_time?: string | null;
  open_count?: number;
  click_count?: number;
  is_unsubscribed?: boolean;
  is_bounced?: boolean;
  sender_bounce?: boolean;
}

// ----------------------------------------------------
// Clean Internal Data Model (Executive-Ready & Strict)
// ----------------------------------------------------

export interface LeadsByStatus {
  started: number;
  inProgress: number;
  completed: number;
  blocked: number;
}

export interface ComputedRates {
  replyRate: number | null; // e.g. 0.0305 for 3.05%
  openRate: number | null;
  clickRate: number | null;
  bounceRate: number | null;
  unsubscribeRate: number | null;
  completionRate: number | null;
}

export interface CampaignSchedule {
  timezone?: string;
  days?: number[];
  startHour?: string;
  endHour?: string;
}

export interface CampaignMetrics {
  id: number;
  name: string;
  segmentKey: string;
  segmentLabel: string;
  status: "ACTIVE" | "PAUSED" | "STOPPED" | "ARCHIVED" | "DRAFTED" | string;
  createdAt: string;
  clientId: number | null;
  tags: string[];
  maxLeadsPerDay: number;
  schedule?: CampaignSchedule;
  leadsTotal: number;
  leadsByStatus: LeadsByStatus;
  sent: number;
  uniqueSent: number;
  opened: number;
  uniqueOpened: number;
  clicked: number;
  uniqueClicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  interestedReplies: number | null;
  rates: ComputedRates;
  sequenceStats: SequenceStepStat[];
  emailAccounts: MailboxHealth[];
  trend: DailyTrendPoint[];
}

export interface AggregateMetrics {
  campaignsCount: number;
  activeCampaignsCount: number;
  leadsTotal: number;
  leadsByStatus: LeadsByStatus;
  sent: number;
  uniqueSent: number;
  opened: number;
  uniqueOpened: number;
  clicked: number;
  uniqueClicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  rates: ComputedRates;
}

export interface SegmentSummary {
  key: string;
  label: string;
  metrics: AggregateMetrics;
}

export interface DailyTrendPoint {
  date: string; // YYYY-MM-DD
  sent: number;
  replied: number;
  opened: number;
  clicked: number;
  bounced: number;
}

export interface MailboxHealth {
  id: number;
  fromName: string;
  fromEmail: string;
  domain: string;
  type: string;
  dailySentCount: number;
  messagePerDay: number;
  warmupReputation: string;
  warmupSent7d: number;
  warmupInbox7d: number;
  warmupSpam7d: number;
  inboxPlacementRate: number | null;
  isSmtpSuccess: boolean;
  isImapSuccess: boolean;
  spfVerified: boolean;
  dkimVerified: boolean;
  dmarcVerified: boolean;
  campaignsAssignedCount?: number;
}

export interface SequenceStepStat {
  sequenceNumber: number;
  subject: string;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  replyRate: number | null;
  openRate: number | null;
  clickRate: number | null;
}

export type HealthAlertSeverity = "critical" | "warning" | "info";

export interface HealthAlert {
  id: string;
  severity: HealthAlertSeverity;
  title: string;
  message: string;
  targetType: "campaign" | "mailbox" | "dns";
  targetName: string;
}

export interface DashboardPayload {
  lastUpdated: string;
  isStaleFallback: boolean;
  selectedSegment: string;
  selectedDateRange: string;
  aggregates: AggregateMetrics;
  segments: SegmentSummary[];
  campaigns: CampaignMetrics[];
  trend: DailyTrendPoint[];
  mailboxes: MailboxHealth[];
  alerts: HealthAlert[];
}
