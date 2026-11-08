export interface SegmentConfig {
  key: string;
  label: string;
  apiKeyEnv: string;
  clientId: number | null;
  /**
   * Keyword patterns used in fallback matching against campaign name or tags (case-insensitive)
   */
  keywords: string[];
}

export const SEGMENTS: SegmentConfig[] = [
  {
    key: "creative",
    label: "Creative Agencies",
    apiKeyEnv: "SMARTLEAD_API_KEY",
    clientId: null,
    keywords: ["creative", "creatives", "design", "agency", "brand"],
  },
  {
    key: "accounting",
    label: "Accounting Agencies",
    apiKeyEnv: "SMARTLEAD_API_KEY_ACCOUNTING", // falls back to SMARTLEAD_API_KEY if not set
    clientId: null,
    keywords: ["accounting", "accountant", "accountants", "cpa", "finance", "audit"],
  },
];

export const UNASSIGNED_SEGMENT = {
  key: "unassigned",
  label: "Unassigned",
};

/**
 * Resolves which segment a campaign belongs to based on:
 * 1. Mode B: Origin API key environment if distinct
 * 2. Mode A: client_id match
 * 3. Fallback: tag or campaign name keyword matching
 * 4. Otherwise: 'unassigned'
 */
export function resolveCampaignSegment(campaign: {
  name: string;
  client_id?: number | null;
  tags?: Array<string | { name: string }> | null;
  originKeyEnv?: string;
}): { key: string; label: string } {
  // 1. Mode B: Distinct API key provided (only if secondary key is explicitly set in env)
  const hasDistinctKeys = !!process.env.SMARTLEAD_API_KEY_ACCOUNTING;
  if (hasDistinctKeys && campaign.originKeyEnv) {
    const matchByKey = SEGMENTS.find((s) => s.apiKeyEnv === campaign.originKeyEnv);
    if (matchByKey) {
      return { key: matchByKey.key, label: matchByKey.label };
    }
  }

  // 2. Mode A: client_id matches configured clientId
  if (campaign.client_id !== null && campaign.client_id !== undefined) {
    const matchByClientId = SEGMENTS.find((s) => s.clientId === campaign.client_id);
    if (matchByClientId) {
      return { key: matchByClientId.key, label: matchByClientId.label };
    }
  }

  // 3. Fallback: Tag matching
  const tagsList: string[] = [];
  if (Array.isArray(campaign.tags)) {
    for (const tag of campaign.tags) {
      if (typeof tag === "string") tagsList.push(tag.toLowerCase());
      else if (tag && typeof tag === "object" && "name" in tag) tagsList.push(String(tag.name).toLowerCase());
    }
  }

  for (const segment of SEGMENTS) {
    for (const kw of segment.keywords) {
      if (tagsList.some((t) => t.includes(kw))) {
        return { key: segment.key, label: segment.label };
      }
    }
  }

  // 4. Fallback: Campaign name matching
  const lowerName = (campaign.name || "").toLowerCase();
  for (const segment of SEGMENTS) {
    for (const kw of segment.keywords) {
      if (lowerName.includes(kw)) {
        return { key: segment.key, label: segment.label };
      }
    }
  }

  return UNASSIGNED_SEGMENT;
}
