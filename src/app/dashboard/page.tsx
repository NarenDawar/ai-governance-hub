'use client';

import { useState, useEffect } from 'react';
import { RiskLevel, AssetStatus, AssessmentStatus } from '@prisma/client';

// Define the shape of our stats data
type DashboardStats = {
  totalAssets: number;
  totalAssessments: number;
  riskCounts: Record<RiskLevel, number>;
  assetStatusCounts: Record<AssetStatus, number>;
  assessmentStatusCounts: Record<AssessmentStatus, number>;
};

// A reusable component for our statistic cards
const StatCard = ({ title, value, description }: { title: string; value: string | number; description: string }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
    <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics.');
        }
        const data: DashboardStats = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (error || !stats) {
    return <div className="p-8 text-center text-red-500">{error || 'Could not load dashboard data.'}</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">GRC Dashboard</h1>

        {/* Top-level stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total AI Assets" value={stats.totalAssets} description="Registered models and systems" />
          <StatCard title="Assessments" value={stats.totalAssessments} description="Total assessments conducted" />
          <StatCard title="High Risk Assets" value={stats.riskCounts.High + stats.riskCounts.Severe} description="Assets classified as High or Severe Risk" />
        </div>

        {/* More detailed breakdowns */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Assets by Risk */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="font-semibold text-gray-800">Assets by Risk Classification</h2>
                <ul className="mt-4 space-y-2">
                    {Object.entries(stats.riskCounts).map(([risk, count]) => (
                        <li key={risk} className="flex justify-between text-sm">
                            <span className="text-gray-600">{risk}</span>
                            <span className="font-medium text-gray-800">{count}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Assessments by Status */}
             <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="font-semibold text-gray-800">Assessments by Status</h2>
                <ul className="mt-4 space-y-2">
                     {Object.entries(stats.assessmentStatusCounts).map(([status, count]) => (
                        <li key={status} className="flex justify-between text-sm">
                            <span className="text-gray-600">{status}</span>
                            <span className="font-medium text-gray-800">{count}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Assets by Status */}
             <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="font-semibold text-gray-800">Assets by Status</h2>
                <ul className="mt-4 space-y-2">
                     {Object.entries(stats.assetStatusCounts).map(([status, count]) => (
                        <li key={status} className="flex justify-between text-sm">
                            <span className="text-gray-600">{status}</span>
                            <span className="font-medium text-gray-800">{count}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
