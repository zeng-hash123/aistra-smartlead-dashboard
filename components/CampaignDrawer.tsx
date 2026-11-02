"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Send,
  MessageSquare,
  Eye,
  AlertOctagon,
  Users,
  Flame,
  Mail,
  Layers,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
} from "lucide-react";
import { CampaignMetrics, MailboxHealth, SequenceStepStat } from "@/lib/smartlead/types";
import { formatNumber, formatPercent } from "@/lib/smartlead/normalize";

interface CampaignDrawerProps {
  campaignId: number | null;
  onClose: () => void;
}

interface CampaignDetailState {
  campaign: CampaignMetrics;
  emailAccounts: MailboxHealth[];
  sequenceStats: SequenceStepStat[];
}

export function CampaignDrawer({ campaignId, onClose }: CampaignDrawerProps) {
  const [data, setData] = useState<CampaignDetailState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/campaigns/${campaignId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load campaign details");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [campaignId]);

  if (!campaignId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  ID: #{campaignId}
                </span>
                {data?.campaign && (
                  <span className="text-[11px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                    {data.campaign.segmentLabel}
                  </span>
                )}
                {data?.campaign && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      data.campaign.status === "ACTIVE"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {data.campaign.status}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white">
                {data?.campaign.name || "Loading Campaign Details..."}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 flex-1">
            {loading && (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Fetching campaign sequences and mailbox metrics...</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {data && (
              <>
                {/* 1. Quick KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1 font-sans">
                      Emails Sent
                    </span>
                    <span className="text-xl font-bold text-white">
                      {formatNumber(data.campaign.sent)}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1 font-sans">
                      Replies
                    </span>
                    <span className="text-xl font-bold text-emerald-400">
                      {formatNumber(data.campaign.replied)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {formatPercent(data.campaign.rates.replyRate, 1)} rate
                    </span>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1 font-sans">
                      Opens (approx)
                    </span>
                    <span className="text-xl font-bold text-sky-400">
                      {formatNumber(data.campaign.opened)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {formatPercent(data.campaign.rates.openRate, 1)} rate
                    </span>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1 font-sans">
                      Bounce Rate
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        (data.campaign.rates.bounceRate ?? 0) >= 0.03
                          ? "text-rose-400"
                          : "text-slate-200"
                      }`}
                    >
                      {formatPercent(data.campaign.rates.bounceRate, 1)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {data.campaign.bounced} bounces
                    </span>
                  </div>
                </div>

                {/* 2. Lead Status Breakdown */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Lead Lifecycle Distribution ({data.campaign.leadsTotal} total)
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-center">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">In Progress</span>
                      <span className="text-base font-bold text-indigo-400">
                        {data.campaign.leadsByStatus.inProgress}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">Completed</span>
                      <span className="text-base font-bold text-emerald-400">
                        {data.campaign.leadsByStatus.completed}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">Blocked</span>
                      <span className="text-base font-bold text-rose-400">
                        {data.campaign.leadsByStatus.blocked}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">Not Started</span>
                      <span className="text-base font-bold text-slate-300">
                        {data.campaign.leadsByStatus.started}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Sequence Step Performance */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Email Sequence Funnel Performance
                    </h3>
                  </div>

                  {data.sequenceStats.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3">
                      No sent sequence statistics available yet for this campaign.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800 font-mono">
                          <tr>
                            <th className="py-2 px-2">Step</th>
                            <th className="py-2 px-2">Subject</th>
                            <th className="py-2 px-2 text-right">Sent</th>
                            <th className="py-2 px-2 text-right">Opens</th>
                            <th className="py-2 px-2 text-right">Replies</th>
                            <th className="py-2 px-2 text-right">Reply %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {data.sequenceStats.map((step) => (
                            <tr key={step.sequenceNumber} className="hover:bg-slate-900/50">
                              <td className="py-2.5 px-2 text-indigo-400 font-bold">
                                #{step.sequenceNumber}
                              </td>
                              <td className="py-2.5 px-2 font-sans text-slate-200 max-w-xs truncate" title={step.subject}>
                                {step.subject || "No subject set"}
                              </td>
                              <td className="py-2.5 px-2 text-right text-slate-300">
                                {step.sent}
                              </td>
                              <td className="py-2.5 px-2 text-right text-sky-400">
                                {step.opened} ({formatPercent(step.openRate, 0)})
                              </td>
                              <td className="py-2.5 px-2 text-right font-bold text-white">
                                {step.replied}
                              </td>
                              <td className="py-2.5 px-2 text-right font-bold text-emerald-400">
                                {formatPercent(step.replyRate, 1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 4. Attached Mailboxes */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    Sending Mailboxes Attached ({data.emailAccounts.length})
                  </h3>

                  {data.emailAccounts.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">
                      No mailboxes currently linked to this campaign.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {data.emailAccounts.map((mb) => (
                        <div
                          key={mb.id}
                          className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-200 block">
                              {mb.fromName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {mb.fromEmail}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[11px] font-semibold flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              {mb.warmupReputation}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {mb.dailySentCount} sent today
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
            <span>Smartlead Campaign Diagnostic</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
