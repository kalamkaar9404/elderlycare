'use client';

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';

interface NutritionData {
  name: string;
  value: number;
  color: string;
}

interface NutritionDonutProps {
  carbs: number;
  protein: number;
  fats: number;
  fiber: number;
}

export function NutritionDonut({ carbs, protein, fats, fiber }: NutritionDonutProps) {
  const data: NutritionData[] = [
    { name: 'Carbohydrates', value: carbs, color: '#00A896' },
    { name: 'Protein', value: protein, color: '#9CAF88' },
    { name: 'Healthy Fats', value: fats, color: '#F7B733' },
    { name: 'Fiber', value: fiber, color: '#D1345B' },
  ];

  const total = carbs + protein + fats + fiber;

  return (
    <Card className="p-6 bg-gradient-to-br from-white via-nutricare-neutral-50 to-blue-50 border border-white/30 shadow-lg rounded-2xl overflow-hidden relative">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-100/20 to-green-100/20 rounded-full -mr-24 -mt-24 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-6">
          <h3 className="font-bold text-lg text-foreground">Daily Nutrition Profile</h3>
          <p className="text-sm text-muted-foreground mt-1">Macronutrient distribution for optimal health</p>
        </div>

        <div className="space-y-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value}g`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0, 168, 150, 0.2)',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => `${value}: ${(entry.payload as unknown as NutritionData)?.value ?? 0}g`}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-3 p-3 bg-white/40 backdrop-blur rounded-lg hover:bg-white/60 transition-colors">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                  <p className="font-semibold text-sm text-foreground">{item.value}g</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gradient-to-r from-cyan-50 to-green-50 rounded-lg border border-cyan-200/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Daily Intake</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent">
              {total}g
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
