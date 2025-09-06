'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RiskLevel } from '@prisma/client';

interface RiskBarChartProps {
  data: {
    riskCounts: Record<RiskLevel, number>;
  };
}

// Map risk levels to specific colors for the chart
const RISK_COLORS: Record<RiskLevel, string> = {
  [RiskLevel.Low]: '#8884d8',    // A calm purple
  [RiskLevel.Medium]: '#82ca9d', // A neutral green
  [RiskLevel.High]: '#ffc658',   // A cautionary yellow/orange
  [RiskLevel.Severe]: '#ff8042',  // A strong orange/red
};

export default function RiskBarChart({ data }: RiskBarChartProps) {
  // Transform the riskCounts object into an array that Recharts can use
  const chartData = Object.entries(data.riskCounts).map(([name, value]) => ({
    name,
    count: value,
    fill: RISK_COLORS[name as RiskLevel],
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow h-full flex flex-col">
      <h2 className="font-semibold text-gray-800 mb-4">Assets by Risk Classification</h2>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical" // Use a horizontal bar chart for better label readability
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={80} />
            <Tooltip
              cursor={{ fill: '#f5f5f5' }}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}
            />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
