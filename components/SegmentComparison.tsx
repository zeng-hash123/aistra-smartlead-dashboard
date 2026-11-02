"use client";

import React from "react";
import { SegmentSummary } from "@/lib/smartlead/types";
import { formatNumber, formatPercent } from "@/lib/smartlead/normalize";
import {
  Sparkles,
  Calculator,
  HelpCircle,
  TrendingUp,
  Send,
  Users,
  AlertOctagon,
  CheckCircle2,
} from "lucide-react";

interface SegmentComparisonProps {
  segments: SegmentSummary[];
  onSelectSegment: (key: string) => void;
}

export function SegmentComparison({ segments, onSelectSegment }: SegmentComparisonProps) {
  const creative = segments.find((s) => s.key === "creative");
  const accounting = segments.find((s) => s.key === "accounting");
  const unassigned = segments.find((s) => s.key === "unassigned");

  const renderSegmentCard = (
    seg: SegmentSummary | undefined,
    theme: "creative" | "accounting" | "unassigned"
  ) => {
    if (!seg) return null;

    const isCreative = theme === "creative";
    const isAccounting = theme === "accounting";

    const badgeBg = isCreative
      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
      : isAccounting
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : "bg-slate-700/50 text-slate-300 border-slate-600";

    const accentBorder = isCreative
      ? "hover:border-purple-500/40"
      : isAccounting
      ? "hover:border-blue-500/40"
      : "hover:border-slate-600";

    const replyRate = formatPercent(seg.metrics.rates.replyRate, 1);
    const bounceRate = formatPercent(seg.metrics.rates.bounceRate, 1);
    const completionRate = formatPercent(seg.metrics.rates.completionRate, 1);

    const Icon = isCreative ? Sparkles : isAccounting ? Calculator : HelpCircle;

    return (
      <div
        onClick={() => onSelectSegment(seg.key)}
        className={`bg-slate-900/70 border border-slate-800/80 ${accentBorder} rounded-2xl p-5 sm:p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-sm`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl border ${badgeBg} group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {seg.label}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {seg.metrics.campaignsCount} campaign{seg.metrics.campaignsCount !== 1 ? "s" : ""} (
                  {seg.metrics.activeCampaignsCount} active)
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeBg}`}
            >
              Filter Segment
            </span>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Emails Sent
              </span>
              <span className="text-lg font-bold text-white font-mono">
                {formatNumber(seg.metrics.sent)}
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Reply Rate
              </span>
              <span className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-1">
                {replyRate}
                <span className="text-xs text-slate-400 font-normal">
                  ({seg.metrics.replied})
                </span>
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Bounce Rate
              </span>
              <span
                className={`text-lg font-bold font-mono ${
                  (seg.metrics.rates.bounceRate ?? 0) >= 0.03
                    ? "text-rose-400"
                    : "text-slate-200"
                }`}
              >
                {bounceRate}
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Total Leads
              </span>
              <span className="text-lg font-bold text-white font-mono">
                {formatNumber(seg.metrics.leadsTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Lead Progress Bar */}
        <div className="pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-indigo-400" />
              Completed Pipeline
            </span>
            <span className="font-mono text-slate-200 text-xs font-semibold">
              {completionRate}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCreative ? "bg-purple-500" : isAccounting ? "bg-blue-500" : "bg-slate-500"
              }`}
              style={{
                width: `${Math.min(100, (seg.metrics.rates.completionRate ?? 0) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Segment Scoreboard: Creative vs. Accounting Outreach
        </h2>
        <span className="text-[11px] text-slate-500">
          Click any card to isolate that segment
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSegmentCard(creative, "creative")}
        {renderSegmentCard(accounting, "accounting")}
      </div>

      {unassigned && unassigned.metrics.campaignsCount > 0 && (
        <div className="mt-3">
          {renderSegmentCard(unassigned, "unassigned")}
        </div>
      )}
    </div>
  );
}
