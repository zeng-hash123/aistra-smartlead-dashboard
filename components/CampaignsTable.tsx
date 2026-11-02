"use client";

import React, { useState, useMemo } from "react";
import { CampaignMetrics } from "@/lib/smartlead/types";
import { formatNumber, formatPercent } from "@/lib/smartlead/normalize";
import {
  Search,
  ArrowUpDown,
  ChevronRight,
  Sparkles,
  Calculator,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  FileEdit,
  Archive,
} from "lucide-react";

interface CampaignsTableProps {
  campaigns: CampaignMetrics[];
  onSelectCampaign: (campaignId: number) => void;
}

type SortField = "name" | "status" | "leadsTotal" | "sent" | "replied" | "replyRate" | "bounceRate" | "completionRate";
type SortDirection = "asc" | "desc";

export function CampaignsTable({ campaigns, onSelectCampaign }: CampaignsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("sent");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredAndSortedCampaigns = useMemo(() => {
    return campaigns
      .filter((camp) => {
        // Search filter
        const query = searchTerm.toLowerCase();
        const matchesName = camp.name.toLowerCase().includes(query);
        const matchesTag = camp.tags.some((t) => t.toLowerCase().includes(query));
        const matchesSegment = camp.segmentLabel.toLowerCase().includes(query);
        const matchesSearch = !searchTerm || matchesName || matchesTag || matchesSegment;

        // Status filter
        const matchesStatus =
          statusFilter === "ALL" || camp.status.toUpperCase() === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA: any = 0;
        let valB: any = 0;

        switch (sortField) {
          case "name":
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case "status":
            valA = a.status;
            valB = b.status;
            break;
          case "leadsTotal":
            valA = a.leadsTotal;
            valB = b.leadsTotal;
            break;
          case "sent":
            valA = a.sent;
            valB = b.sent;
            break;
          case "replied":
            valA = a.replied;
            valB = b.replied;
            break;
          case "replyRate":
            valA = a.rates.replyRate ?? -1;
            valB = b.rates.replyRate ?? -1;
            break;
          case "bounceRate":
            valA = a.rates.bounceRate ?? -1;
            valB = b.rates.bounceRate ?? -1;
            break;
          case "completionRate":
            valA = a.rates.completionRate ?? -1;
            valB = b.rates.completionRate ?? -1;
            break;
        }

        if (typeof valA === "string") {
          return sortDirection === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortDirection === "asc" ? valA - valB : valB - valA;
      });
  }, [campaigns, searchTerm, statusFilter, sortField, sortDirection]);

  const renderStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <PauseCircle className="w-3 h-3" />
            Paused
          </span>
        );
      case "DRAFTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <FileEdit className="w-3 h-3" />
            Drafted
          </span>
        );
      case "STOPPED":
      case "ARCHIVED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Archive className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  const renderSegmentBadge = (key: string, label: string) => {
    if (key === "creative") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
          <Sparkles className="w-3 h-3" />
          {label}
        </span>
      );
    }
    if (key === "accounting") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
          <Calculator className="w-3 h-3" />
          {label}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
        <HelpCircle className="w-3 h-3" />
        {label}
      </span>
    );
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Table controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white">Campaign Directory</h2>
          <p className="text-xs text-slate-400">
            Click any row to open in-depth sequence analysis, email accounts, and lead progress
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter campaigns or tags..."
              className="pl-8 pr-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Status filter tabs */}
          <div className="inline-flex p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            {["ALL", "ACTIVE", "DRAFTED", "PAUSED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  statusFilter === st
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 select-none">
            <tr>
              <th
                onClick={() => handleSort("name")}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Campaign</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3.5 px-3">Segment</th>
              <th
                onClick={() => handleSort("status")}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("leadsTotal")}
                className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Leads</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("sent")}
                className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Sent</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("replied")}
                className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Replies</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("replyRate")}
                className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Reply Rate</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("bounceRate")}
                className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Bounce %</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("completionRate")}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Lead Pipeline</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3.5 px-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredAndSortedCampaigns.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-500 font-sans">
                  No campaigns match the selected filters.
                </td>
              </tr>
            ) : (
              filteredAndSortedCampaigns.map((camp) => {
                const replyRateFormatted = formatPercent(camp.rates.replyRate, 1);
                const bounceRateFormatted = formatPercent(camp.rates.bounceRate, 1);
                const isBounceWarning = (camp.rates.bounceRate ?? 0) >= 0.03;
                const completionRateFormatted = formatPercent(camp.rates.completionRate, 1);
                const completionPct = Math.min(100, (camp.rates.completionRate ?? 0) * 100);

                return (
                  <tr
                    key={camp.id}
                    onClick={() => onSelectCampaign(camp.id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition group"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {camp.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>ID: {camp.id}</span>
                        {camp.maxLeadsPerDay > 0 && (
                          <span>• Limit: {camp.maxLeadsPerDay}/day</span>
                        )}
                      </div>
                    </td>

                    {/* Segment */}
                    <td className="py-3.5 px-3 font-sans">
                      {renderSegmentBadge(camp.segmentKey, camp.segmentLabel)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 font-sans">
                      {renderStatusBadge(camp.status)}
                    </td>

                    {/* Leads Total */}
                    <td className="py-3.5 px-3 text-right font-medium text-slate-200">
                      {formatNumber(camp.leadsTotal)}
                    </td>

                    {/* Sent */}
                    <td className="py-3.5 px-3 text-right font-medium text-slate-200">
                      {formatNumber(camp.sent)}
                    </td>

                    {/* Replies */}
                    <td className="py-3.5 px-3 text-right font-bold text-white">
                      {formatNumber(camp.replied)}
                    </td>

                    {/* Reply % */}
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-400">
                      {replyRateFormatted}
                    </td>

                    {/* Bounce % */}
                    <td
                      className={`py-3.5 px-3 text-right font-medium ${
                        isBounceWarning ? "text-rose-400 font-bold" : "text-slate-300"
                      }`}
                    >
                      {bounceRateFormatted}
                    </td>

                    {/* Completion Progress Bar */}
                    <td className="py-3.5 px-4 min-w-[140px] font-sans">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                        <span>{camp.leadsByStatus.completed} completed</span>
                        <span className="font-semibold text-slate-200">{completionRateFormatted}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${completionPct}%` }}
                        />
                      </div>
                    </td>

                    {/* Action Arrow */}
                    <td className="py-3.5 px-3 text-right text-slate-500 group-hover:text-indigo-400 transition-colors">
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
