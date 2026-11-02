import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, Layers, Settings, Shield } from "lucide-react";
import { getDashboardData } from "@/lib/smartlead/service";
import { SEGMENTS } from "@/segments.config";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const data = await getDashboardData(false);

  const envStatuses = SEGMENTS.map((seg) => {
    const val = process.env[seg.apiKeyEnv];
    return {
      segment: seg.label,
      envKey: seg.apiKeyEnv,
      isSet: !!val,
      configuredClientId: seg.clientId,
      keywords: seg.keywords.join(", "),
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/logo.png"
                alt="Aistra Logo"
                className="w-8 h-8 rounded-lg object-contain shadow-md shadow-indigo-500/20"
              />
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Executive Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-indigo-400" />
              Segment Configuration & Diagnostic Inspector
            </h1>
            <p className="text-xs text-slate-400">
              Diagnostic overview of campaign mappings, segment classification, and API environment resolution.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Password Protected
            </span>
          </div>
        </div>

        {/* Section 1: Configured Segments */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Configured Segment Engines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {envStatuses.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100 text-sm">{item.segment}</span>
                  {item.isSet ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px]">
                      <CheckCircle2 className="w-3 h-3" /> Key Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full text-[11px]">
                      <AlertTriangle className="w-3 h-3" /> Key Not Provided (Using Master)
                    </span>
                  )}
                </div>
                <div className="text-slate-400 space-y-1">
                  <div>
                    <span className="text-slate-500 font-mono">Env Variable:</span>{" "}
                    <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded">{item.envKey}</code>
                  </div>
                  <div>
                    <span className="text-slate-500">Configured Client ID:</span>{" "}
                    <span className="text-slate-300 font-mono">
                      {item.configuredClientId ?? "None (Null)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Fallback Keywords:</span>{" "}
                    <span className="text-indigo-300 font-mono">{item.keywords}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Discovered Campaigns Table */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Discovered Campaigns ({data.campaigns.length})
            </h2>
            <span className="text-xs text-slate-500">
              Fetched via <code className="text-slate-400 bg-slate-950 px-1 py-0.5 rounded">GET /campaigns/?include_tags=true</code>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Campaign ID</th>
                  <th className="py-3 px-3">Campaign Name</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Client ID</th>
                  <th className="py-3 px-3">Tags</th>
                  <th className="py-3 px-3">Assigned Segment</th>
                  <th className="py-3 px-3">Leads Total</th>
                  <th className="py-3 px-3">Sent Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data.campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 text-indigo-400 font-bold">{camp.id}</td>
                    <td className="py-3 px-3 font-sans font-medium text-slate-100">{camp.name}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          camp.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : camp.status === "PAUSED"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {camp.clientId !== null ? camp.clientId : <span className="text-slate-600">null</span>}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {camp.tags.length > 0 ? (
                        camp.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-slate-800 px-1.5 py-0.5 rounded mr-1 text-[10px]"
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600">[]</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          camp.segmentKey === "creative"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : camp.segmentKey === "accounting"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-slate-700/50 text-slate-300 border border-slate-600"
                        }`}
                      >
                        {camp.segmentLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-200">{camp.leadsTotal}</td>
                    <td className="py-3 px-3 text-slate-200">{camp.sent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resolution Guide */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
          <h3 className="font-semibold text-slate-300">How to modify segment classification:</h3>
          <p>
            Segment classification is controlled in <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">segments.config.ts</code>:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong>Mode A (Client ID):</strong> If campaigns are assigned a <code className="text-slate-300">client_id</code> in Smartlead, set <code className="text-slate-300">clientId: 123</code> in the config.</li>
            <li><strong>Mode B (Separate API Keys):</strong> If each segment has its own API key, provide <code className="text-slate-300">SMARTLEAD_API_KEY_ACCOUNTING</code> in your environment.</li>
            <li><strong>Fallback (Tags & Keywords):</strong> If neither applies, campaigns are classified by name or tag keyword matching (e.g. &quot;creative&quot; vs &quot;accounting&quot;). Any unclassified campaign is safely routed to the &quot;Unassigned&quot; bucket.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
