"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardPayload, CampaignMetrics } from "@/lib/smartlead/types";
import { Header } from "./Header";
import { CampaignSection } from "./CampaignSection";
import { DeliverabilityPanel } from "./DeliverabilityPanel";
import { PresentationView } from "./PresentationView";
import { ErrorBanner } from "./ErrorBanner";
import {
  Sparkles,
  Calculator,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  FileEdit,
  PlayCircle,
  Eye,
} from "lucide-react";

interface DashboardClientProps {
  initialData: DashboardPayload;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<DashboardPayload>(initialData);
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30d");
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Presentation mode via ?present=1 query parameter or state toggle
  const isPresentParam = searchParams.get("present") === "1";
  const [presentationMode, setPresentationMode] = useState<boolean>(isPresentParam);

  useEffect(() => {
    setPresentationMode(isPresentParam);
  }, [isPresentParam]);

  // Fetch /api/data with query parameters
  const fetchData = useCallback(
    async (refresh = false, seg = selectedSegment, range = selectedDateRange) => {
      setIsRefreshing(true);
      try {
        const url = `/api/data?segment=${seg}&dateRange=${range}${refresh ? "&refresh=1" : ""}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("Dashboard refresh error:", err.message);
      } finally {
        setIsRefreshing(false);
      }
    },
    [selectedSegment, selectedDateRange]
  );

  const handleSelectSegment = (seg: string) => {
    setSelectedSegment(seg);
    setSelectedCampaignId("all"); // reset campaign focus when segment changes
    fetchData(false, seg, selectedDateRange);
  };

  const handleSelectDateRange = (range: string) => {
    setSelectedDateRange(range);
    fetchData(false, selectedSegment, range);
  };

  const handleManualRefresh = () => {
    fetchData(true);
  };

  const togglePresentation = () => {
    const nextState = !presentationMode;
    setPresentationMode(nextState);
    if (nextState) {
      router.push("/?present=1");
    } else {
      router.push("/");
    }
  };

  // Filter campaigns by search and selected segment
  const displayedCampaigns = useMemo(() => {
    return data.campaigns.filter((c) => {
      // Segment filter
      if (selectedSegment !== "all" && c.segmentKey !== selectedSegment) {
        return false;
      }
      // Single campaign filter
      if (selectedCampaignId !== "all" && c.id !== selectedCampaignId) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesTag = c.tags.some((t) => t.toLowerCase().includes(q));
        const matchesSegment = c.segmentLabel.toLowerCase().includes(q);
        return matchesName || matchesTag || matchesSegment;
      }
      return true;
    });
  }, [data.campaigns, selectedSegment, selectedCampaignId, searchQuery]);

  // If in Presentation Mode, render full-screen presentation view
  if (presentationMode) {
    return (
      <PresentationView
        data={data}
        onExit={togglePresentation}
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top sticky executive header */}
      <Header
        lastUpdated={data.lastUpdated}
        selectedSegment={selectedSegment}
        onSelectSegment={handleSelectSegment}
        selectedDateRange={selectedDateRange}
        onSelectDateRange={handleSelectDateRange}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        presentationMode={presentationMode}
        onTogglePresentation={togglePresentation}
      />

      {/* Main dashboard content container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Visible, non-alarming error banner if Smartlead unreachable */}
        <ErrorBanner
          isStale={data.isStaleFallback}
          lastUpdated={data.lastUpdated}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Campaign Navigation & Selector Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Active Outreach Campaigns Directory
              </h2>
              <p className="text-xs text-slate-400">
                Select a specific campaign or view all individual campaign performance sections below.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by campaign name..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Campaign Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={() => setSelectedCampaignId("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                selectedCampaignId === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-950 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <span>All Campaigns ({data.campaigns.length})</span>
            </button>

            {data.campaigns.map((camp) => {
              const isSelected = selectedCampaignId === camp.id;
              const isActive = camp.status === "ACTIVE";

              return (
                <button
                  key={camp.id}
                  onClick={() => setSelectedCampaignId(camp.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-2 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                      : "bg-slate-950 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-800"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                    }`}
                  />
                  <span>{camp.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({camp.sent > 0 ? `${camp.sent} sent` : `${camp.leadsTotal} leads`})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Individual Campaign Sections (NOT aggregated together) */}
        <section aria-label="Individual Campaign Sections" className="space-y-6">
          {displayedCampaigns.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-300">No campaigns match your filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try selecting "All Campaigns" or resetting your search query.
              </p>
              <button
                onClick={() => {
                  setSelectedCampaignId("all");
                  setSelectedSegment("all");
                  setSearchQuery("");
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            displayedCampaigns.map((camp) => (
              <CampaignSection
                key={camp.id}
                campaign={camp}
                defaultExpanded={true}
              />
            ))
          )}
        </section>

        {/* Fleet Deliverability & Account Health */}
        <section aria-label="Fleet Deliverability & Health">
          <DeliverabilityPanel
            mailboxes={data.mailboxes}
            alerts={data.alerts}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smartlead Campaign Analyzer • Isolated Campaign Metrics</span>
          <span>Aistra Outreach Command Center</span>
        </div>
      </footer>
    </div>
  );
}
