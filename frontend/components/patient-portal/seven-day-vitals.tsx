'use client';

/**
 * 7-Day Vitals Snapshot
 * Shows actual vitals data for the past 7 days with mini charts
 */

import { Activity, Droplet } from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

// Generate 7 days of mock data
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const GLUCOSE_7_DAYS = DAYS.map((day) => ({
  day,
  value: parseFloat((4.5 + Math.random() * 1.5).toFixed(1)),
}));

const SPO2_7_DAYS = DAYS.map((day) => ({
  day,
  value: Math.round(96 + Math.random() * 3),
}));

export function SevenDayVitals() {
  return (
    <div className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-lg p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-[#6B8E6F]" strokeWidth={2.5} />
        <h3 className="text-lg font-bold text-slate-800">7-Day Vitals Snapshot</h3>
      </div>

      {/* Blood Glucose */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-[#20B2AA]" />
            <span className="text-sm font-semibold text-slate-700">Blood Glucose (mmol/L)</span>
          </div>
          <span className="text-2xl font-bold text-[#20B2AA]">
            {GLUCOSE_7_DAYS[GLUCOSE_7_DAYS.length - 1].value}
          </span>
        </div>

        {/* Mini chart */}
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={GLUCOSE_7_DAYS}>
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[3, 7]} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#20B2AA" 
              strokeWidth={2.5}
              dot={{ fill: '#20B2AA', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SpO2 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#6B8E6F]" />
            <span className="text-sm font-semibold text-slate-700">SpO₂ (%)</span>
          </div>
          <span className="text-2xl font-bold text-[#6B8E6F]">
            {SPO2_7_DAYS[SPO2_7_DAYS.length - 1].value}
          </span>
        </div>

        {/* Mini chart */}
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={SPO2_7_DAYS}>
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[94, 100]} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#6B8E6F" 
              strokeWidth={2.5}
              dot={{ fill: '#6B8E6F', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer note */}
      <p className="text-xs text-slate-400 text-center pt-2 border-t border-slate-200">
        Weekly averages · Updated daily at 6 AM
      </p>
    </div>
  );
}
