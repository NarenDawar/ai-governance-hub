'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AssessmentStatus } from '@prisma/client';

interface AssessmentPieChartProps {
  data: {
    assessmentStatusCounts: Record<AssessmentStatus, number>;
  };
}

// Map assessment statuses to specific colors for the chart
const STATUS_COLORS: Record<AssessmentStatus, string> = {
  [AssessmentStatus.NotStarted]: '#a0aec0', // Gray
  [AssessmentStatus.InProgress]: '#f6e05e', // Yellow
  [AssessmentStatus.Completed]: '#68d391', // Green
  [AssessmentStatus.Archived]: '#7f9cf5',  // Indigo
};

export default function AssessmentStatusPieChart({ data }: AssessmentPieChartProps) {
  // Transform the statusCounts object into an array that Recharts can use
  // We filter out any statuses that have a count of 0 to keep the chart clean
  const chartData = Object.entries(data.assessmentStatusCounts)
    .map(([name, value]) => ({ name, value }))
    .filter(entry => entry.value > 0);

  if (chartData.length === 0) {
    return (
       <div className="bg-white p-6 rounded-lg shadow h-full flex flex-col items-center justify-center">
        <h2 className="font-semibold text-gray-800 mb-4">Assessments by Status</h2>
        <p className="text-gray-500">No assessment data available.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow h-full flex flex-col">
      <h2 className="font-semibold text-gray-800 mb-4">Assessments by Status</h2>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as AssessmentStatus]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
