import { NextRequest, NextResponse } from "next/server";
import { getCampaignDetails } from "@/lib/smartlead/service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = Number(params.id);
    if (!campaignId || !Number.isFinite(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });
    }

    const details = await getCampaignDetails(campaignId);
    return NextResponse.json(details);
  } catch (err: any) {
    console.error(`API /api/campaigns/${params.id} error:`, err.message);
    return NextResponse.json(
      { error: "Failed to fetch campaign details", details: err.message },
      { status: 500 }
    );
  }
}
