# Aistra Outreach Executive Dashboard (Smartlead Analytics)

An executive-ready, read-only analytics dashboard for monitoring cold email outreach campaigns on Smartlead across two primary market segments:
- **Creative Agencies**
- **Accounting Agencies**

Designed for non-technical leadership to answer in 10 seconds:
> *"How many emails went out, how many people replied, which campaigns and which segment are performing, and is anything broken?"*

---

## 1. Key Features

- **Executive KPI Cards**: Real-time metrics for **Emails Sent**, **Replies** & **Reply Rate** (headline metric), **Bounce Rate**, **Unsubscribes**, and **Total Leads** in pipeline.
- **Open Rate Disclaimer**: Clarified with tooltips noting that Apple Mail Privacy & ESP image blocking make open rates approximate, prioritizing Reply Rate for decision making.
- **Creative vs. Accounting Scoreboard**: Side-by-side comparison of outreach velocity, lead volume, and response rates.
- **Daily Performance Trend Chart**: Interactive timeline mapping daily outbound volume against reply spikes (with toggles for Sent/Replies vs. Opens/Clicks).
- **Interactive Campaign Directory**: Searchable, sortable list with status indicators (Active, Drafted, Paused). Clicking any campaign row opens a detailed slide-over drawer with:
  - Sequence step performance funnel (Step 1, Step 2, etc.)
  - Lead lifecycle distribution (In Progress, Completed, Blocked, Not Started)
  - Attached sending mailboxes and warmup reputation
- **Fleet Deliverability & Health Monitor**:
  - Live sending mailbox status and warmup inbox vs. spam placement (7-day history)
  - Automated DNS verification monitor (SPF, DKIM, DMARC)
  - Proactive anomaly alerts (Bounce rate > 3%, connection errors, low inbox placement)
- **Executive Presentation Mode (`?present=1`)**: High-contrast, big-screen view with enlarged KPIs and a 60-second auto-refresh countdown, ideal for boardroom TVs and team monitors.
- **Print & PDF Export**: Specialized print stylesheet (`@media print`) rendering clean white documents for executive board decks and PDF downloads.
- **Segment Diagnostic Inspector (`/setup`)**: Diagnostic tool behind the password gate listing discovered campaigns, IDs, tags, client IDs, and assigned segment engines.

---

## 2. Hard Security & Reliability Architecture

1. **Read-Only Enforcement**:
   - The Smartlead client implements an explicit **GET allowlist** matching verified analytical routes only. Any non-allowlisted path is rejected immediately before transmission.
2. **Zero Client Secret Exposure**:
   - The Smartlead `api_key` is strictly confined to server-side Node execution via environment variables. It is never included in client bundles, headers, or client-side responses.
3. **Smartlead Rate-Limit Queue & Throttling**:
   - Enforces a conservative 5 requests/second throttle (200ms spacing) to stay well within Smartlead's limits.
   - Retries 429 and 5xx errors with exponential backoff (starting at 2s up to 3 retries).
   - In-flight identical queries are de-duplicated using a canonical URL cache.
4. **Stale-While-Revalidate Fallback**:
   - If Smartlead is temporarily unreachable, the dashboard displays the last cached snapshot along with a non-alarming indicator showing the snapshot timestamp.
5. **Password Gate**:
   - Protected by `DASHBOARD_PASSWORD` via signed HMAC session cookies (`sl_session`) using Web Crypto.

---

## 3. Two-Segment Account Model (`segments.config.ts`)

The dashboard seamlessly handles segmentation ambiguity through configuration:
- **Mode A (Client ID)**: Groups campaigns by `client_id` when defined in Smartlead.
- **Mode B (Separate API Keys)**: Calls distinct keys (`SMARTLEAD_API_KEY` vs `SMARTLEAD_API_KEY_ACCOUNTING`).
- **Fallback (Name / Tag Keywords)**: Matches keywords such as `"creative"`, `"accounting"`, `"cpa"`. Any unassigned campaign is surfaced in an "Unassigned" bucket to ensure zero data is hidden.

---

## 4. Quick Start

### Prerequisites
- Node.js 18+ (tested on Node 24)
- npm 10+

### Installation & Run

1. Clone or open the repository:
   ```bash
   cd d:/Aistra
   ```

2. Verify environment configuration:
   Ensure `.env.local` exists (see `.env.example`):
   ```env
   SMARTLEAD_API_KEY=81167240-dd68-4052-9dc3-529d24c577cf_eiujn3x
   DASHBOARD_PASSWORD=aistra2026
   SESSION_SECRET=aistra-smartlead-dashboard-session-secret-key-32chars
   ```

3. Run in Production or Development:
   ```bash
   # Development server
   npm run dev

   # Or production build & start
   npm run build
   npm run start
   ```

4. Open [http://localhost:3000](http://localhost:3000)
   - **Password**: `aistra2026` (or value set in `DASHBOARD_PASSWORD`)
   - **Presentation Mode**: [http://localhost:3000/?present=1](http://localhost:3000/?present=1)
   - **Setup & Diagnostics**: [http://localhost:3000/setup](http://localhost:3000/setup)

---

## 5. Discovery Findings Summary

During Step 0 probing (`scripts/discover.mjs`), live samples were retrieved from the Smartlead API and sanitized in `docs/samples/`:
- `GET /campaigns/?include_tags=true`: Discovered 4 campaigns (1 ACTIVE: "UK campaign 1 Creative", 3 DRAFTED: "australia-accounting", "UK creative First Campaign", "Creative - UK (Batch 1)").
- `GET /campaigns/{id}/analytics`: Confirmed numeric values arrive as strings (e.g. `sent_count: "164"`, `reply_count: "5"`). Normalized tolerantly into numbers with zero-division protection.
- `GET /campaigns/{id}/statistics`: Detailed email events containing exact send and reply timestamps, sequence numbers, and lead categories.
- `GET /email-accounts/`: 2 mailboxes detected (`Jayveer Samant` and `Lokesh Agarwal` on Outlook), SPF/DKIM/DMARC verified, 99-100% warmup reputation.
- `GET /analytics/overview`: Returned 404; aggregated programmatically across individual campaign analytics to guarantee absolute data consistency.
