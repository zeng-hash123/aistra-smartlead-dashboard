"use client";

import React, { useEffect, useState } from "react";
import { DashboardPayload, CampaignMetrics } from "@/lib/smartlead/types";
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
  HelpCircle,
  Eye,
  Mail,
  Flame,
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
              Individual Campaign Performance Tracker ({data.campaigns.length} campaigns)
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

      {/* Campaign Cards Grid (Separate data for each campaign, NOT aggregated) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 my-8 flex-1">
        {data.campaigns.map((camp) => {
          const isActive = camp.status === "ACTIVE";
          const isCreative = camp.segmentKey === "creative";
          const isAccounting = camp.segmentKey === "accounting";

          return (
            <div
              key={camp.id}
              className={`bg-slate-900/80 border rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl transition-all ${
                isActive
                  ? "border-indigo-500/40 shadow-indigo-950/30"
                  : "border-slate-800"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                      {camp.status}
                    </span>

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
                      {camp.segmentLabel}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-500">
                    ID #{camp.id}
                  </span>
                </div>

                <h3 className="text-2xl font-bold tracking-tight text-white mb-5">
                  {camp.name}
                </h3>

                {/* Individual Campaign KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 font-mono">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-sans">
                      Emails Sent
                    </span>
                    <span className="text-3xl font-black text-white">
                      {formatNumber(camp.sent)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {formatNumber(camp.uniqueSent)} unique
                    </span>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-sans">
                      Replies
                    </span>
                    <span className="text-3xl font-black text-emerald-400">
                      {formatNumber(camp.replied)}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                      {formatPercent(camp.rates.replyRate, 1)} rate
                    </span>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-sans">
                      Opens (approx)
                    </span>
                    <span className="text-3xl font-black text-sky-400">
                      {formatNumber(camp.opened)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {formatPercent(camp.rates.openRate, 1)}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-sans">
                      Target Leads
                    </span>
                    <span className="text-3xl font-black text-purple-400">
                      {formatNumber(camp.leadsTotal)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {formatNumber(camp.leadsByStatus.completed)} done
                    </span>
                  </div>
                </div>

                {/* Individual Campaign Daily Trend (if available) */}
                {camp.trend.length > 0 && (
                  <div className="h-28 w-full mb-3 pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={camp.trend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#334155",
                            borderRadius: "8px",
                            fontSize: "10px",
                          }}
                        />
                        <Bar dataKey="sent" name="Sent" fill="#6366f1" radius={[3, 3, 0, 0]} />
                        <Line type="monotone" dataKey="replied" name="Replies" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {camp.leadsByStatus.inProgress} in progress • {camp.leadsByStatus.started} pending
                  </span>
                </span>
                <span className="font-mono text-slate-300">
                  {camp.emailAccounts.length} mailbox{camp.emailAccounts.length !== 1 ? "es" : ""} assigned
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer */}
      <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          Smartlead API Connected • Live Isolated Campaign Analytics
        </span>
        <span>Aistra Executive Outreach</span>
      </div>
    </div>
  );
}
