'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { Card } from '@/components/ui/card';

export interface VitalsDataPoint {
  day: number;
  glucose: number;
  systolic: number;
  diastolic: number;
}

interface MedicalGraphsProps {
  data: VitalsDataPoint[];
}

export function MedicalGraphs({ data }: MedicalGraphsProps) {
  return (
    <div className="space-y-6">
      {/* Blood Glucose Chart */}
      <Card className="p-6 bg-gradient-to-br from-white via-slate-50 to-green-50 border border-white/20 shadow-lg rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#6B8E6F]/5 rounded-full -mr-20 -mt-20" />
        <div className="relative z-10">
          <h3 className="font-semibold mb-4 text-foreground uppercase tracking-wider">
            Blood Glucose Trend
          </h3>
          <p className="text-xs text-muted-foreground mb-4">30-day analysis with safe reference ranges</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B8E6F" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6B8E6F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
            <YAxis
              stroke="var(--muted-foreground)"
              style={{ fontSize: '12px' }}
              label={{ value: 'mmol/L', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <ReferenceLine y={4} stroke="#20B2AA" strokeDasharray="5 5" label="Safe Min" />
            <ReferenceLine y={7} stroke="#20B2AA" strokeDasharray="5 5" label="Safe Max" />
            <ReferenceLine y={9} stroke="#F59E0B" strokeDasharray="5 5" label="Attention" />
            <ReferenceLine y={11} stroke="#DC2626" strokeDasharray="5 5" label="Critical" />
            <Area
              type="monotone"
              dataKey="glucose"
              stroke="#6B8E6F"
              strokeWidth={3}
              fill="url(#glucoseGradient)"
              dot={{ r: 4 }}
              name="Blood Glucose"
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </Card>

      {/* Blood Pressure Chart */}
      <Card className="p-6 bg-gradient-to-br from-white via-slate-50 to-blue-50 border border-white/20 shadow-lg rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-40 h-40 bg-[#20B2AA]/5 rounded-full -ml-20 -mt-20" />
        <div className="relative z-10">
          <h3 className="font-semibold mb-4 text-foreground uppercase tracking-wider">
            Blood Pressure Trend
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Systolic and diastolic pressure over time</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
            <YAxis
              stroke="var(--muted-foreground)"
              style={{ fontSize: '12px' }}
              label={{ value: 'mmHg', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <ReferenceLine y={120} stroke="#20B2AA" strokeDasharray="5 5" label="Normal" />
            <ReferenceLine y={140} stroke="#F59E0B" strokeDasharray="5 5" label="High" />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="#6B8E6F"
              strokeWidth={3}
              dot={{ r: 3 }}
              name="Systolic"
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="#20B2AA"
              strokeWidth={3}
              dot={{ r: 3 }}
              name="Diastolic"
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
