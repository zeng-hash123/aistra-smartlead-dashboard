"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Tv,
  Printer,
  Settings,
  LogOut,
  Mail,
  Calendar,
  Layers,
} from "lucide-react";

interface HeaderProps {
  lastUpdated: string;
  selectedSegment: string;
  onSelectSegment: (seg: string) => void;
  selectedDateRange: string;
  onSelectDateRange: (range: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  presentationMode: boolean;
  onTogglePresentation: () => void;
}

export function Header({
  lastUpdated,
  selectedSegment,
  onSelectSegment,
  selectedDateRange,
  onSelectDateRange,
  onRefresh,
  isRefreshing,
  presentationMode,
  onTogglePresentation,
}: HeaderProps) {
  const [relativeTime, setRelativeTime] = useState<string>("just now");

  useEffect(() => {
    function updateRelTime() {
      if (!lastUpdated) return;
      const diffMs = Date.now() - new Date(lastUpdated).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 15) {
        setRelativeTime("just now");
      } else if (diffSec < 60) {
        setRelativeTime(`${diffSec}s ago`);
      } else {
        const diffMin = Math.floor(diffSec / 60);
        setRelativeTime(`${diffMin}m ago`);
      }
    }

    updateRelTime();
    const interval = setInterval(updateRelTime, 15000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="no-print border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Brand & Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Aistra Logo"
                className="w-10 h-10 rounded-xl object-contain shadow-md shadow-indigo-500/20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                    Aistra Outreach
                  </h1>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-400">Smartlead Cold Email Performance</p>
              </div>
            </div>

            {/* Mobile buttons */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Segment Filter & Date Range Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Segment Selector */}
            <div className="inline-flex p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
              {[
                { id: "all", label: "All Campaigns" },
                { id: "creative", label: "Creative Agencies" },
                { id: "accounting", label: "Accounting Agencies" },
              ].map((tab) => {
                const isActive = selectedSegment === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectSegment(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Date Range Selector */}
            <div className="hidden sm:inline-flex p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
              {[
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "all", label: "All Time" },
              ].map((range) => {
                const isActive = selectedDateRange === range.id;
                return (
                  <button
                    key={range.id}
                    onClick={() => onSelectDateRange(range.id)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                      isActive
                        ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700/60"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="text-right mr-1">
              <span className="block text-[11px] text-slate-400">
                Updated <span className="text-slate-200 font-medium">{relativeTime}</span>
              </span>
            </div>

            {/* Manual Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition shadow-sm active:scale-95 disabled:opacity-50"
              title="Refresh smartlead data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
              <span>Refresh</span>
            </button>

            {/* Presentation Mode */}
            <button
              onClick={onTogglePresentation}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition shadow-sm active:scale-95 ${
                presentationMode
                  ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
              }`}
              title="Toggle Executive Presentation Screen"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Present</span>
            </button>

            {/* Export / Print */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Print or Export to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Setup / Diagnostic */}
            <Link
              href="/setup"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Segment Diagnostics (/setup)"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 text-slate-400 hover:text-rose-300 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
