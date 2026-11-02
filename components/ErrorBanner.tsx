"use client";

import React from "react";
import { AlertCircle, Clock, RefreshCw } from "lucide-react";

interface ErrorBannerProps {
  isStale: boolean;
  lastUpdated: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function ErrorBanner({
  isStale,
  lastUpdated,
  onRefresh,
  isRefreshing,
}: ErrorBannerProps) {
  if (!isStale) return null;

  return (
    <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-4 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-100 flex items-center gap-2">
            Smartlead Connection Temporary Delay — Displaying Cached Snapshot
          </h4>
          <p className="text-[11px] text-amber-300/80 flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
            Showing verified data snapshot from{" "}
            <span className="font-mono font-semibold text-amber-100">
              {new Date(lastUpdated).toLocaleTimeString()}
            </span>
            . No downtime or missing metrics.
          </p>
        </div>
      </div>

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 text-xs font-semibold transition active:scale-95 disabled:opacity-50 self-end sm:self-auto shrink-0"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        <span>Retry Sync</span>
      </button>
    </div>
  );
}
