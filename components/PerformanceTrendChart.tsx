"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { DailyTrendPoint } from "@/lib/smartlead/types";
import { TrendingUp, BarChart2, Calendar } from "lucide-react";

interface PerformanceTrendChartProps {
  data: DailyTrendPoint[];
  selectedDateRange: string;
}

export function PerformanceTrendChart({
  data,
  selectedDateRange,
}: PerformanceTrendChartProps) {
  const [viewMode, setViewMode] = useState<"replies" | "engagement">("replies");

  // Format dates for display on X-axis (e.g., '2026-10-27' -> 'Oct 27')
  const chartData = data.map((d) => {
    let formattedDate = d.date;
    try {
      const parts = d.date.split("-");
      if (parts.length === 3) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const m = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        formattedDate = `${monthNames[m]} ${day}`;
      }
    } catch {
      formattedDate = d.date;
    }

    return {
      ...d,
      displayDate: formattedDate,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as DailyTrendPoint & { displayDate: string };
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
            <span>{point.displayDate}</span>
            <span className="text-[10px] text-slate-500 font-mono">{point.date}</span>
          </div>
          <div className="space-y-1 pt-1 font-mono">
            <div className="flex items-center justify-between gap-4 text-indigo-300">
              <span className="font-sans">Emails Sent:</span>
              <span className="font-bold text-white">{point.sent}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-emerald-400">
              <span className="font-sans">Replies Received:</span>
              <span className="font-bold">{point.replied}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sky-400">
              <span className="font-sans">Opens (approx):</span>
              <span>{point.opened}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-purple-400">
              <span className="font-sans">Clicks:</span>
              <span>{point.clicked}</span>
            </div>
            {point.bounced > 0 && (
              <div className="flex items-center justify-between gap-4 text-rose-400">
                <span className="font-sans">Bounces:</span>
                <span>{point.bounced}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Outreach Velocity & Response Trajectory
          </h2>
          <p className="text-xs text-slate-400">
            Daily sent volume mapped against reply generation over {selectedDateRange.toUpperCase()}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex p-1 bg-slate-950/80 border border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode("replies")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              viewMode === "replies"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sent vs. Replies
          </button>
          <button
            onClick={() => setViewMode("engagement")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              viewMode === "engagement"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Opens & Clicks
          </button>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              yAxisId="left"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              iconType="circle"
            />

            {viewMode === "replies" ? (
              <>
                <Bar
                  yAxisId="left"
                  dataKey="sent"
                  name="Emails Sent"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="replied"
                  name="Replies"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 1, stroke: "#047857" }}
                  activeDot={{ r: 6, fill: "#34d399" }}
                />
              </>
            ) : (
              <>
                <Bar
                  yAxisId="left"
                  dataKey="opened"
                  name="Opens (approx)"
                  fill="#38bdf8"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="clicked"
                  name="Clicks"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#a855f7" }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
