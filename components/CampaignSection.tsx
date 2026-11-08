"use client";

import React, { useState } from "react";
import { CampaignMetrics } from "@/lib/smartlead/types";
import { formatNumber, formatPercent } from "@/lib/smartlead/normalize";
import {
  Send,
  MessageSquare,
  Eye,
  AlertOctagon,
  Users,
  Flame,
  Mail,
  Layers,
  CheckCircle2,
  Calendar,
  Sparkles,
  Calculator,
  HelpCircle,
  Clock,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface CampaignSectionProps {
  campaign: CampaignMetrics;
  defaultExpanded?: boolean;
}

export function CampaignSection({
  campaign,
  defaultExpanded = true,
}: CampaignSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const replyRateFormatted = formatPercent(campaign.rates.replyRate, 1);
  const openRateFormatted = formatPercent(campaign.rates.openRate, 1);
  const bounceRateFormatted = formatPercent(campaign.rates.bounceRate, 1);
  const unsubRateFormatted = formatPercent(campaign.rates.unsubscribeRate, 1);
  const completionRateFormatted = formatPercent(campaign.rates.completionRate, 1);

  const isBounceElevated = (campaign.rates.bounceRate ?? 0) >= 0.03;
  const isCreative = campaign.segmentKey === "creative";
  const isAccounting = campaign.segmentKey === "accounting";

  const renderStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Sending
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Paused
          </span>
        );
      case "DRAFTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Drafted (Ready to Launch)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  // Format schedule text if present
  const formatSchedule = () => {
    if (!campaign.schedule) return null;
    const { days, startHour, endHour, timezone } = campaign.schedule;
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayNames = days?.map((d) => dayMap[d] || d).join(", ");
    if (!dayNames && !startHour) return null;
    return `${dayNames ? dayNames + " • " : ""}${startHour || ""}${endHour ? " - " + endHour : ""}${timezone ? " (" + timezone + ")" : ""}`;
  };

  const scheduleText = formatSchedule();

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-200">
      {/* 1. Campaign Section Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
            {renderStatusBadge(campaign.status)}

            {/* Segment */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isCreative
                  ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                  : isAccounting
                  ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              {isCreative ? <Sparkles className="w-3 h-3" /> : isAccounting ? <Calculator className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
              {campaign.segmentLabel}
            </span>

            {/* Campaign ID */}
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              ID #{campaign.id}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {campaign.name}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-sans pt-0.5">
            {campaign.maxLeadsPerDay > 0 && (
              <span className="flex items-center gap-1 font-mono">
                <span className="text-slate-500">Daily limit:</span>
                <span className="text-slate-200 font-semibold">{campaign.maxLeadsPerDay} leads/day</span>
              </span>
            )}
            {scheduleText && (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{scheduleText}</span>
              </span>
            )}
            {campaign.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {campaign.tags.map((t, idx) => (
                  <span key={idx} className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-800">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 self-end lg:self-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
          >
            <span>{isExpanded ? "Collapse Section" : "Expand Section"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* 2. Individual Campaign KPI Cards (NOT aggregated with any other campaign) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Emails Sent */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Emails Sent</span>
                  <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Send className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight text-white font-mono">
                  {formatNumber(campaign.sent)}
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Unique leads</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {formatNumber(campaign.uniqueSent)}
                </span>
              </div>
            </div>

            {/* Replies */}
            <div className="bg-slate-950/70 border border-indigo-900/30 rounded-xl p-4 flex flex-col justify-between shadow-md shadow-indigo-950/20">
              <div>
                <div className="flex items-center justify-between text-indigo-300 mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Replies</span>
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <MessageSquare className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-white font-mono">
                    {formatNumber(campaign.replied)}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {replyRateFormatted}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Reply rate</span>
                <span className="font-semibold text-emerald-400 font-mono flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {replyRateFormatted}
                </span>
              </div>
            </div>

            {/* Opens (approx) */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Opens</span>
                    <span className="text-[9px] text-slate-500">(approx.)</span>
                    <div
                      className="group relative cursor-help inline-flex text-slate-500 hover:text-slate-300"
                      title="Apple Mail Privacy & ESP image blocking make open rates approximate. Reply Rate is headline metric."
                    >
                      <Info className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="p-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Eye className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-white font-mono">
                    {formatNumber(campaign.opened)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {openRateFormatted}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Unique opens</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {formatNumber(campaign.uniqueOpened)}
                </span>
              </div>
            </div>

            {/* Bounce Rate */}
            <div
              className={`rounded-xl p-4 flex flex-col justify-between border ${
                isBounceElevated
                  ? "bg-rose-950/20 border-rose-800/40"
                  : "bg-slate-950/70 border-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Bounce Rate</span>
                  <div
                    className={`p-1 rounded border ${
                      isBounceElevated
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    <AlertOctagon className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight font-mono">
                  <span className={isBounceElevated ? "text-rose-400" : "text-white"}>
                    {bounceRateFormatted}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Total bounces</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {formatNumber(campaign.bounced)}
                </span>
              </div>
            </div>

            {/* Unsubscribes */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Unsubscribes</span>
                  <span className="text-[10px] font-mono text-slate-500">{unsubRateFormatted}</span>
                </div>
                <div className="text-2xl font-bold tracking-tight text-white font-mono">
                  {formatNumber(campaign.unsubscribed)}
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Unsub rate</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {unsubRateFormatted}
                </span>
              </div>
            </div>

            {/* Total Leads */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Total Leads</span>
                  <div className="p-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Users className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight text-white font-mono">
                  {formatNumber(campaign.leadsTotal)}
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Completed</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {formatNumber(campaign.leadsByStatus.completed)} ({completionRateFormatted})
                </span>
              </div>
            </div>
          </div>

          {/* 3. Lead Lifecycle Pipeline Breakdown */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Lead Status Distribution ({formatNumber(campaign.leadsTotal)} leads in this campaign)
              </span>
              <span className="text-slate-400 font-mono">
                Pipeline progress: <span className="text-slate-200 font-bold">{completionRateFormatted}</span>
              </span>
            </div>

            {/* Segmented bar */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
              {campaign.leadsTotal > 0 ? (
                <>
                  <div
                    title={`Completed: ${campaign.leadsByStatus.completed}`}
                    style={{ width: `${(campaign.leadsByStatus.completed / campaign.leadsTotal) * 100}%` }}
                    className="h-full bg-emerald-500 transition-all duration-300"
                  />
                  <div
                    title={`In Progress: ${campaign.leadsByStatus.inProgress}`}
                    style={{ width: `${(campaign.leadsByStatus.inProgress / campaign.leadsTotal) * 100}%` }}
                    className="h-full bg-indigo-500 transition-all duration-300"
                  />
                  <div
                    title={`Blocked: ${campaign.leadsByStatus.blocked}`}
                    style={{ width: `${(campaign.leadsByStatus.blocked / campaign.leadsTotal) * 100}%` }}
                    className="h-full bg-rose-500 transition-all duration-300"
                  />
                  <div
                    title={`Not Started: ${campaign.leadsByStatus.started}`}
                    style={{ width: `${(campaign.leadsByStatus.started / campaign.leadsTotal) * 100}%` }}
                    className="h-full bg-slate-700 transition-all duration-300"
                  />
                </>
              ) : (
                <div className="w-full h-full bg-slate-800" />
              )}
            </div>

            {/* Counts grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-sans block">In Progress</span>
                <span className="text-sm font-bold text-indigo-400">
                  {formatNumber(campaign.leadsByStatus.inProgress)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-sans block">Completed</span>
                <span className="text-sm font-bold text-emerald-400">
                  {formatNumber(campaign.leadsByStatus.completed)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-sans block">Blocked</span>
                <span className="text-sm font-bold text-rose-400">
                  {formatNumber(campaign.leadsByStatus.blocked)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-sans block">Not Started</span>
                <span className="text-sm font-bold text-slate-300">
                  {formatNumber(campaign.leadsByStatus.started)}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Sequence Funnel & Mailboxes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sequence Performance (2 cols) */}
            <div className="lg:col-span-2 bg-slate-950/50 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Sequence Step Performance Funnel
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {campaign.sequenceStats.length} Step{campaign.sequenceStats.length !== 1 ? "s" : ""}
                </span>
              </div>

              {campaign.sequenceStats.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-slate-800/80">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[10px] uppercase text-slate-400 bg-slate-900/80 border-b border-slate-800 font-mono">
                      <tr>
                        <th className="py-2.5 px-3">Step</th>
                        <th className="py-2.5 px-3">Subject Line</th>
                        <th className="py-2.5 px-2 text-right">Sent</th>
                        <th className="py-2.5 px-2 text-right">Opens (approx)</th>
                        <th className="py-2.5 px-2 text-right">Replies</th>
                        <th className="py-2.5 px-3 text-right">Reply %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {campaign.sequenceStats.map((step) => (
                        <tr key={step.sequenceNumber} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 text-indigo-400 font-bold">
                            #{step.sequenceNumber}
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-200 max-w-xs truncate" title={step.subject}>
                            {step.subject || "No subject set"}
                          </td>
                          <td className="py-2.5 px-2 text-right text-slate-300">
                            {formatNumber(step.sent)}
                          </td>
                          <td className="py-2.5 px-2 text-right text-sky-400">
                            {formatNumber(step.opened)} <span className="text-[10px] text-slate-500">({formatPercent(step.openRate, 0)})</span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-bold text-white">
                            {formatNumber(step.replied)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                            {formatPercent(step.replyRate, 1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-5 rounded-lg bg-slate-900/40 border border-slate-800/60 text-center space-y-1.5 my-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    No Email Dispatches Yet on This Campaign
                  </span>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    {campaign.status === "DRAFTED"
                      ? `This campaign is currently drafted. ${formatNumber(campaign.leadsTotal)} target leads are imported and ready for dispatch once activated.`
                      : "No emails have been logged for this campaign yet."}
                  </p>
                </div>
              )}
            </div>

            {/* Attached Mailboxes (1 col) */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    Assigned Mailboxes
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {campaign.emailAccounts.length}
                  </span>
                </div>

                {campaign.emailAccounts.length > 0 ? (
                  <div className="space-y-2">
                    {campaign.emailAccounts.map((mb) => (
                      <div
                        key={mb.id}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">
                            {mb.fromName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-semibold flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" />
                            {mb.warmupReputation}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono truncate">
                          {mb.fromEmail}
                        </span>
                        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>{mb.type}</span>
                          <span>{mb.dailySentCount} / {mb.messagePerDay} sent today</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-900/40 text-center text-xs text-slate-500">
                    No specific mailboxes attached to this campaign.
                  </div>
                )}
              </div>

              {/* Campaign ID Footer info */}
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                <span>Segment: {campaign.segmentKey}</span>
              </div>
            </div>
          </div>

          {/* 5. Campaign Velocity Trend Chart (Strictly for this campaign if it has sent emails) */}
          {campaign.trend.length > 0 && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  Outreach Velocity & Replies for {campaign.name}
                </h3>
                <span className="text-[11px] text-slate-500">Daily trajectory</span>
              </div>

              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={campaign.trend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "10px",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="sent" name="Sent" fill="#6366f1" radius={[3, 3, 0, 0]} barSize={20} />
                    <Line
                      type="monotone"
                      dataKey="replied"
                      name="Replies"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#10b981" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded bg-indigo-500" />
                  Emails Sent
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Replies
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
