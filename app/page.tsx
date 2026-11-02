import React, { Suspense } from "react";
import { getDashboardData } from "@/lib/smartlead/service";
import { DashboardClient } from "@/components/DashboardClient";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialData = await getDashboardData(false);

  return (
    <Suspense fallback={<div className="p-8"><LoadingSkeleton /></div>}>
      <DashboardClient initialData={initialData} />
    </Suspense>
  );
}
