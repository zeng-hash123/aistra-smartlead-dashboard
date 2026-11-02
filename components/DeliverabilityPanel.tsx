"use client";

import React from "react";
import { MailboxHealth, HealthAlert } from "@/lib/smartlead/types";
import { formatNumber, formatPercent } from "@/lib/smartlead/normalize";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Globe,
  MailCheck,
  Server,
  Activity,
  AlertCircle,
} from "lucide-react";

interface DeliverabilityPanelProps {
  mailboxes: MailboxHealth[];
  alerts: HealthAlert[];
}

export function DeliverabilityPanel({ mailboxes, alerts }: DeliverabilityPanelProps) {
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");
  const infoAlerts = alerts.filter((a) => a.severity === "info");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Sending Mailboxes & Warmup Health (2 columns) */}
      <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Mailbox Fleet Deliverability & Warmup Placement
            </h2>
            <p className="text-xs text-slate-400">
              Live inbox vs. spam reputation and sending mailbox authentication
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {mailboxes.length} Active Mailbox{mailboxes.length !== 1 ? "es" : ""}
          </span>
        </div>

        <div className="space-y-3">
          {mailboxes.map((mb) => {
            const inboxRate = mb.inboxPlacementRate !== null ? formatPercent(mb.inboxPlacementRate, 0) : "100%";
            const isPlacementGood = (mb.inboxPlacementRate ?? 1) >= 0.90;

            return (
              <div
                key={mb.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <MailCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-100">
                          {mb.fromName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {mb.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono block">
                        {mb.fromEmail}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Warmup Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>{mb.warmupReputation} Warmup</span>
                    </div>

                    {/* Daily Sent Volume */}
                    <div className="text-right text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Sent Today
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {mb.dailySentCount} <span className="text-slate-500 font-normal">/ {mb.messagePerDay}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warmup 7-day placement bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-slate-400" />
                      7-Day Inbox Placement
                    </span>
                    <span className="font-mono text-slate-200">
                      <span className="text-emerald-400 font-semibold">{inboxRate}</span> inbox ({mb.warmupInbox7d} sent / {mb.warmupSpam7d} spam)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${isPlacementGood ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: inboxRate }}
                    />
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${Math.max(0, 100 - parseInt(inboxRate, 10))}%` }}
                    />
                  </div>
                </div>

                {/* Authentication & DNS validation badges */}
                <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Domain: <span className="text-slate-300 font-mono">{mb.domain}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        mb.spfVerified
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      SPF {mb.spfVerified ? "✓" : "!"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        mb.dkimVerified
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      DKIM {mb.dkimVerified ? "✓" : "!"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        mb.dmarcVerified
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      DMARC {mb.dmarcVerified ? "✓" : "!"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Health & Deliverability Alerts (1 column) */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              Health & Deliverability Guard
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                criticalAlerts.length > 0
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  : warningAlerts.length > 0
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {alerts.length === 0 ? "Healthy" : `${alerts.length} Advisory`}
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Automated threshold monitor for bounce rates, low replies, and DNS anomalies.
          </p>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-2 my-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-semibold text-emerald-300">All Metrics Within Thresholds</h4>
                <p className="text-[11px] text-slate-400">
                  Bounce rates are under 3%, warmup placement is above 90%, and all sending accounts are connected.
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    alert.severity === "critical"
                      ? "bg-rose-950/30 border-rose-800/50 text-rose-200"
                      : alert.severity === "warning"
                      ? "bg-amber-950/20 border-amber-800/40 text-amber-200"
                      : "bg-slate-950/50 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                    {alert.severity === "critical" ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5 leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Configurable Thresholds Footer */}
        <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 space-y-1">
          <div className="font-semibold text-slate-400">Guarding Thresholds:</div>
          <div className="flex justify-between">
            <span>Critical Bounce Rate: &gt; 5.0%</span>
            <span>Warning Bounce: &gt; 3.0%</span>
          </div>
          <div className="flex justify-between">
            <span>Min Warmup Placement: 90%</span>
            <span>Low Reply Trigger: &lt; 1.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
