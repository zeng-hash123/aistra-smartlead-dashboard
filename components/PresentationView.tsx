"use client";

import React, { useEffect, useState } from "react";
import { DashboardPayload } from "@/lib/smartlead/types";
import { formatNumber, formatPercent } from "@/lib/smartlead/normalize";
import {
  Send,
  MessageSquare,
  TrendingUp,
  AlertOctagon,
  Users,
  ShieldCheck,
  X,
  RefreshCw,
  Sparkles,
  Calculator,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface PresentationViewProps {
  data: DashboardPayload;
  onExit: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function PresentationView({
  data,
  onExit,
  onRefresh,
  isRefreshing,
}: PresentationViewProps) {
  const [countdown, setCountdown] = useState(60);

  // Auto-refresh every 60 seconds in presentation mode
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefresh();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefresh]);

  const creative = data.segments.find((s) => s.key === "creative");
  const accounting = data.segments.find((s) => s.key === "accounting");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans flex flex-col justify-between selection:bg-indigo-500/30">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Aistra Logo"
            className="w-12 h-12 rounded-2xl object-contain shadow-xl shadow-indigo-600/30"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-white">
                Aistra Outreach Scoreboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Executive Screen
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Smartlead Performance: Creative Agencies & Accounting Agencies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-mono">
            Auto-refresh in <span className="text-white font-bold">{countdown}s</span>
          </span>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition active:scale-95"
            title="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <X className="w-4 h-4" />
            <span>Exit Presenter</span>
          </button>
        </div>
      </div>

      {/* Main KPI Row (Oversized for Meeting Screens) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 my-8">
        {/* Emails Sent */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          <span className="text-xs uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-400" />
            Total Outbound Sent
          </span>
          <div className="my-3">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
              {formatNumber(data.aggregates.sent)}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Across {data.aggregates.campaignsCount} campaigns ({data.aggregates.uniqueSent} unique leads)
          </span>
        </div>

        {/* Replies & Reply Rate */}
        <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900/90 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-indigo-950/40">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Total Replies Generated
          </span>
          <div className="my-3 flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
              {formatNumber(data.aggregates.replied)}
            </span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {formatPercent(data.aggregates.rates.replyRate, 1)}
            </span>
          </div>
          <span className="text-xs text-emerald-300/80 font-medium">
            Headline conversion metric
          </span>
        </div>

        {/* Bounce Rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          <span className="text-xs uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            Fleet Bounce Rate
          </span>
          <div className="my-3">
            <span
              className={`text-5xl sm:text-6xl font-black tracking-tight font-mono ${
                (data.aggregates.rates.bounceRate ?? 0) >= 0.03
                  ? "text-rose-400"
                  : "text-white"
              }`}
            >
              {formatPercent(data.aggregates.rates.bounceRate, 1)}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {data.aggregates.bounced} total bounces (Healthy under 3%)
          </span>
        </div>

        {/* Total Leads */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          <span className="text-xs uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Total Target Audience
          </span>
          <div className="my-3">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
              {formatNumber(data.aggregates.leadsTotal)}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {formatNumber(data.aggregates.leadsByStatus.completed)} leads reached end of sequence
          </span>
        </div>
      </div>

      {/* Mid Section: Segments Comparison & Velocity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-2 flex-1">
        {/* Creative vs Accounting Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl">
          <h3 className="text-sm uppercase font-bold tracking-wider text-slate-400 mb-4">
            Segment Breakdown
          </h3>

          <div className="space-y-4">
            {/* Creative */}
            {creative && (
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{creative.label}</h4>
                    <span className="text-xs text-slate-400">
                      {creative.metrics.sent} Sent • {creative.metrics.leadsTotal} Leads
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-purple-300 font-mono">
                    {formatPercent(creative.metrics.rates.replyRate, 1)}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {creative.metrics.replied} replies
                  </span>
                </div>
              </div>
            )}

            {/* Accounting */}
            {accounting && (
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{accounting.label}</h4>
                    <span className="text-xs text-slate-400">
                      {accounting.metrics.sent} Sent • {accounting.metrics.leadsTotal} Leads
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-300 font-mono">
                    {formatPercent(accounting.metrics.rates.replyRate, 1)}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {accounting.metrics.replied} replies
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              All sending mailboxes healthy (99% warmup reputation)
            </span>
            <span>Aistra Talent</span>
          </div>
        </div>

        {/* Outreach Velocity Trend */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl">
          <h3 className="text-sm uppercase font-bold tracking-wider text-slate-400 mb-2">
            Outreach Velocity Trend
          </h3>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.trend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="sent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="replied"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Bar: Daily Sent</span>
            <span className="text-emerald-400 font-medium">Line: Daily Replies</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span>Smartlead API Sync Engine • Live Read-Only Proxy</span>
        <span>Aistra Executive Outreach</span>
      </div>
    </div>
  );
}
