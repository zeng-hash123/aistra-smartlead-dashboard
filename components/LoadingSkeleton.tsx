import React from "react";

export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="w-20 h-3 bg-slate-800 rounded mb-4" />
            <div className="w-16 h-7 bg-slate-800 rounded mb-2" />
            <div className="w-24 h-2.5 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Segment comparison skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-44 bg-slate-900/60 border border-slate-800 rounded-2xl p-5" />
        <div className="h-44 bg-slate-900/60 border border-slate-800 rounded-2xl p-5" />
      </div>

      {/* Chart skeleton */}
      <div className="h-80 bg-slate-900/60 border border-slate-800 rounded-2xl p-6" />

      {/* Table skeleton */}
      <div className="h-64 bg-slate-900/60 border border-slate-800 rounded-2xl p-6" />
    </div>
  );
}
