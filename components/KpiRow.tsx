"use client";

import React from "react";
import {
  Send,
  MessageSquare,
  Eye,
  AlertOctagon,
  UserX,
  Users,
  Info,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { AggregateMetrics } from "@/lib/smartlead/types";
import { formatNumber, formatPercent } from "@/lib/smartlead/normalize";

interface KpiRowProps {
  metrics: AggregateMetrics;
}

export function KpiRow({ metrics }: KpiRowProps) {
  const replyRateFormatted = formatPercent(metrics.rates.replyRate, 1);
  const openRateFormatted = formatPercent(metrics.rates.openRate, 1);
  const bounceRateFormatted = formatPercent(metrics.rates.bounceRate, 1);
  const unsubRateFormatted = formatPercent(metrics.rates.unsubscribeRate, 1);
  const completionRateFormatted = formatPercent(metrics.rates.completionRate, 1);

  const bounceRateVal = metrics.rates.bounceRate ?? 0;
  const isBounceElevated = bounceRateVal >= 0.03;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
      {/* 1. Emails Sent */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Emails Sent</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {formatNumber(metrics.sent)}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Unique leads</span>
          <span className="font-semibold text-slate-200 font-mono">
            {formatNumber(metrics.uniqueSent)}
          </span>
        </div>
      </div>

      {/* 2. Replies (Headline Metric) */}
      <div className="bg-slate-900/70 border border-indigo-900/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-indigo-700/50 transition-all duration-200 shadow-lg shadow-indigo-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between text-indigo-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              Replies
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {formatNumber(metrics.replied)}
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {replyRateFormatted}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Reply Rate</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold font-mono">
            <TrendingUp className="w-3 h-3" />
            {replyRateFormatted}
          </span>
        </div>
      </div>

      {/* 3. Opens (approx.) */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Opens</span>
              <span className="text-[10px] text-slate-500 font-normal">(approx.)</span>
              <div
                className="group relative cursor-help inline-flex text-slate-500 hover:text-slate-300"
                title="Apple Mail Privacy & ESP image blocking make open rates approximate. Focus on Reply Rate as headline."
              >
                <Info className="w-3 h-3" />
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {formatNumber(metrics.opened)}
            </span>
            <span className="text-xs font-medium text-slate-400 font-mono">
              {openRateFormatted}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Unique opens</span>
          <span className="font-semibold text-slate-200 font-mono">
            {formatNumber(metrics.uniqueOpened)}
          </span>
        </div>
      </div>

      {/* 4. Bounce Rate */}
      <div
        className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 border ${
          isBounceElevated
            ? "bg-rose-950/20 border-rose-800/40"
            : "bg-slate-900/70 border-slate-800/80"
        }`}
      >
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Bounce Rate</span>
            <div
              className={`p-1.5 rounded-lg border ${
                isBounceElevated
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono ${
                isBounceElevated ? "text-rose-400" : "text-white"
              }`}
            >
              {bounceRateFormatted}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Total bounces</span>
          <span className="font-semibold text-slate-200 font-mono">
            {formatNumber(metrics.bounced)}
          </span>
        </div>
      </div>

      {/* 5. Unsubscribes */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Unsubscribes</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <UserX className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {formatNumber(metrics.unsubscribed)}
            </span>
            <span className="text-xs font-medium text-slate-400 font-mono">
              {unsubRateFormatted}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Unsub Rate</span>
          <span className="font-semibold text-slate-200 font-mono">
            {unsubRateFormatted}
          </span>
        </div>
      </div>

      {/* 6. Total Leads & Pipeline */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Leads</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {formatNumber(metrics.leadsTotal)}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Completed leads</span>
          <span className="font-semibold text-slate-200 font-mono">
            {formatNumber(metrics.leadsByStatus.completed)} ({completionRateFormatted})
          </span>
        </div>
      </div>
    </div>
  );
}
