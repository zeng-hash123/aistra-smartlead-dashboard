import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/lib/smartlead/service";
import { aggregateCampaignMetrics } from "@/lib/smartlead/normalize";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const segment = searchParams.get("segment") || "all";
    const dateRange = searchParams.get("dateRange") || "30d";
    const forceRefresh = searchParams.get("refresh") === "1";

    const baseData = await getDashboardData(forceRefresh);

    // Filter campaigns by segment if not 'all'
    let filteredCampaigns = baseData.campaigns;
    if (segment !== "all") {
      filteredCampaigns = baseData.campaigns.filter((c) => c.segmentKey === segment);
    }

    // Recompute current active aggregates for the selected filter
    const activeAggregates =
      segment === "all"
        ? baseData.aggregates
        : aggregateCampaignMetrics(filteredCampaigns);

    const payload = {
      ...baseData,
      selectedSegment: segment,
      selectedDateRange: dateRange,
      aggregates: activeAggregates,
      campaigns: filteredCampaigns,
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("API /api/data error:", err.message);
    return NextResponse.json(
      {
        error: "Failed to fetch Smartlead dashboard data",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
