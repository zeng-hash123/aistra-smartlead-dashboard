import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read .env.local manually if not in process.env
function loadEnv() {
  const envPath = path.join(rootDir, '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const API_KEY = process.env.SMARTLEAD_API_KEY;
if (!API_KEY) {
  console.error('ERROR: SMARTLEAD_API_KEY is not defined in environment or .env.local');
  process.exit(1);
}

const BASE_URL = 'https://server.smartlead.ai/api/v1';

// Sanitizer utility: strips email addresses, real names, phone numbers, and API keys
function sanitize(data) {
  if (!data) return data;
  if (typeof data === 'string') {
    // Replace api key
    let s = data.replaceAll(API_KEY, '[REDACTED_API_KEY]');
    // Mask emails
    s = s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'sanitized_lead@example.com');
    return s;
  }
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  if (typeof data === 'object') {
    const copy = {};
    for (const [k, v] of Object.entries(data)) {
      if (/api_?key/i.test(k)) {
        copy[k] = '[REDACTED_API_KEY]';
      } else if (/^(first_name|last_name|full_name)$/i.test(k)) {
        copy[k] = 'SanitizedName';
      } else if (/^email$/i.test(k)) {
        copy[k] = 'lead@example.com';
      } else if (/phone|mobile/i.test(k)) {
        copy[k] = '+15550000000';
      } else if (/company_url|website/i.test(k) && typeof v === 'string') {
        copy[k] = 'https://example.com';
      } else {
        copy[k] = sanitize(v);
      }
    }
    return copy;
  }
  return data;
}

const samplesDir = path.join(rootDir, 'docs', 'samples');
fs.mkdirSync(samplesDir, { recursive: true });

async function apiGet(endpoint) {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}`;
  console.log(`Fetching: GET ${endpoint}`);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const status = res.status;
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = { _rawText: text };
    }
    return { ok: res.ok, status, data: json };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  }
}

async function run() {
  console.log('--- STARTING SMARTLEAD DISCOVERY ---');
  const report = {};

  // 1. GET /campaigns/?include_tags=true
  const campaignsRes = await apiGet('/campaigns/?include_tags=true');
  report['campaigns'] = { status: campaignsRes.status, count: Array.isArray(campaignsRes.data) ? campaignsRes.data.length : 'non-array' };
  fs.writeFileSync(
    path.join(samplesDir, 'campaigns.json'),
    JSON.stringify(sanitize(campaignsRes.data), null, 2)
  );

  let sampleCampaignId = null;
  if (Array.isArray(campaignsRes.data) && campaignsRes.data.length > 0) {
    const active = campaignsRes.data.find(c => c.status === 'ACTIVE') || campaignsRes.data[0];
    sampleCampaignId = active.id;
    console.log(`Selected campaign for detail probing: ID=${sampleCampaignId}, Name="${active.name}", Status="${active.status}"`);
  }

  // 2. Probing campaign endpoints if sampleCampaignId exists
  if (sampleCampaignId) {
    // 2a. /campaigns/{id}
    const campDetailRes = await apiGet(`/campaigns/${sampleCampaignId}`);
    report['campaign_detail'] = { status: campDetailRes.status };
    fs.writeFileSync(
      path.join(samplesDir, 'campaign-detail.json'),
      JSON.stringify(sanitize(campDetailRes.data), null, 2)
    );

    // 2b. /campaigns/{id}/analytics
    const analyticsRes = await apiGet(`/campaigns/${sampleCampaignId}/analytics`);
    report['campaign_analytics'] = { status: analyticsRes.status };
    fs.writeFileSync(
      path.join(samplesDir, 'campaign-analytics.json'),
      JSON.stringify(sanitize(analyticsRes.data), null, 2)
    );

    // 2c. /campaigns/{id}/analytics-by-date (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const start_date = sevenDaysAgo.toISOString().slice(0, 10);
    const end_date = today.toISOString().slice(0, 10);
    const dateAnalyticsRes = await apiGet(`/campaigns/${sampleCampaignId}/analytics-by-date?start_date=${start_date}&end_date=${end_date}`);
    report['campaign_analytics_by_date'] = { status: dateAnalyticsRes.status };
    fs.writeFileSync(
      path.join(samplesDir, 'campaign-analytics-by-date.json'),
      JSON.stringify(sanitize(dateAnalyticsRes.data), null, 2)
    );

    // 2d. /campaigns/{id}/statistics?limit=5
    const statsRes = await apiGet(`/campaigns/${sampleCampaignId}/statistics?limit=5`);
    report['campaign_statistics'] = { status: statsRes.status };
    fs.writeFileSync(
      path.join(samplesDir, 'campaign-statistics.json'),
      JSON.stringify(sanitize(statsRes.data), null, 2)
    );

    // 2e. /campaigns/{id}/leads?limit=5
    const leadsRes = await apiGet(`/campaigns/${sampleCampaignId}/leads?limit=5`);
    report['campaign_leads'] = { status: leadsRes.status };
    fs.writeFileSync(
      path.join(samplesDir, 'campaign-leads.json'),
      JSON.stringify(sanitize(leadsRes.data), null, 2)
    );

    // 2f. /campaigns/{id}/email-accounts
    const campMailboxesRes = await apiGet(`/campaigns/${sampleCampaignId}/email-accounts`);
    report['campaign_email_accounts'] = { status: campMailboxesRes.status };
    fs.writeFileSync(
      path.join(samplesDir, 'campaign-email-accounts.json'),
      JSON.stringify(sanitize(campMailboxesRes.data), null, 2)
    );
  }

  // 3. Global /analytics/overview
  const overviewRes = await apiGet('/analytics/overview');
  report['analytics_overview'] = { status: overviewRes.status };
  fs.writeFileSync(
    path.join(samplesDir, 'analytics-overview.json'),
    JSON.stringify(sanitize(overviewRes.data), null, 2)
  );

  // 4. Global /email-accounts/?limit=5
  const emailAccountsRes = await apiGet('/email-accounts/?limit=5');
  report['email_accounts'] = { status: emailAccountsRes.status };
  fs.writeFileSync(
    path.join(samplesDir, 'email-accounts.json'),
    JSON.stringify(sanitize(emailAccountsRes.data), null, 2)
  );

  // 5. Warmup stats for one email account if available
  let sampleEmailAccountId = null;
  if (Array.isArray(emailAccountsRes.data) && emailAccountsRes.data.length > 0) {
    sampleEmailAccountId = emailAccountsRes.data[0].id;
  }
  if (sampleEmailAccountId) {
    const warmupRes = await apiGet(`/email-accounts/${sampleEmailAccountId}/warmup-stats`);
    report['email_account_warmup_stats'] = { status: warmupRes.status };
    fs.writeFileSync(
      path.join(samplesDir, 'warmup-stats.json'),
      JSON.stringify(sanitize(warmupRes.data), null, 2)
    );
  }

  // 6. Lead categories: /leads/fetch-categories
  const categoriesRes = await apiGet('/leads/fetch-categories');
  report['lead_categories'] = { status: categoriesRes.status };
  fs.writeFileSync(
    path.join(samplesDir, 'lead-categories.json'),
    JSON.stringify(sanitize(categoriesRes.data), null, 2)
  );

  console.log('\n--- DISCOVERY COMPLETED ---');
  console.log(JSON.stringify(report, null, 2));
}

run().catch(err => {
  console.error('Fatal error during discovery:', err);
  process.exit(1);
});
