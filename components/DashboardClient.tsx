"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardPayload } from "@/lib/smartlead/types";
import { Header } from "./Header";
import { KpiRow } from "./KpiRow";
import { SegmentComparison } from "./SegmentComparison";
import { PerformanceTrendChart } from "./PerformanceTrendChart";
import { DeliverabilityPanel } from "./DeliverabilityPanel";
import { CampaignsTable } from "./CampaignsTable";
import { CampaignDrawer } from "./CampaignDrawer";
import { PresentationView } from "./PresentationView";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface DashboardClientProps {
  initialData: DashboardPayload;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<DashboardPayload>(initialData);
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCampaignDrawerId, setActiveCampaignDrawerId] = useState<number | null>(null);

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

        {/* 1. Headline KPI Cards Row */}
        <section aria-label="Executive KPIs">
          <KpiRow metrics={data.aggregates} />
        </section>

        {/* 2. Segment Scoreboard (Creative vs Accounting) */}
        <section aria-label="Segment Comparison">
          <SegmentComparison
            segments={data.segments}
            onSelectSegment={handleSelectSegment}
          />
        </section>

        {/* 3. Outreach Velocity Trend Chart */}
        <section aria-label="Performance Velocity">
          <PerformanceTrendChart
            data={data.trend}
            selectedDateRange={selectedDateRange}
          />
        </section>

        {/* 4. Campaigns Directory & Interactive Drawer Trigger */}
        <section aria-label="Campaign Directory">
          <CampaignsTable
            campaigns={data.campaigns}
            onSelectCampaign={(id) => setActiveCampaignDrawerId(id)}
          />
        </section>

        {/* 5. Fleet Deliverability & Account Health */}
        <section aria-label="Deliverability & Health">
          <DeliverabilityPanel
            mailboxes={data.mailboxes}
            alerts={data.alerts}
          />
        </section>
      </main>

      {/* Campaign Detail Drawer (opens on campaign click) */}
      <CampaignDrawer
        campaignId={activeCampaignDrawerId}
        onClose={() => setActiveCampaignDrawerId(null)}
      />

      {/* Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smartlead Read-Only Aggregator • Secure Server-Side Proxy</span>
          <span>Aistra Outreach Command Center</span>
        </div>
      </footer>
    </div>
  );
}
