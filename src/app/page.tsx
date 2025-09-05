'use client'; // This is now a client component to manage state

import { useState } from 'react';
import { AIAsset, AssetStatus, RiskLevel } from '../lib/types';
import RegisterAssetForm from '../components/RegisterAssetForm'; // Using relative path

// Mock data to simulate a database. We'll replace this with a real DB connection.
const initialAssets: AIAsset[] = [
  {
    id: 'MKT-001',
    name: 'Customer Churn Prediction Model',
    owner: 'Marketing Analytics',
    businessPurpose: 'Predicts which customers are likely to cancel their subscriptions.',
    status: AssetStatus.Active,
    riskClassification: RiskLevel.Medium,
    dateRegistered: '2025-09-05',
  },
  {
    id: 'FIN-003',
    name: 'Invoice Anomaly Detection',
    owner: 'Finance Department',
    businessPurpose: 'Identifies potentially fraudulent or incorrect invoices.',
    status: AssetStatus.Active,
    riskClassification: RiskLevel.High,
    dateRegistered: '2025-07-22',
  },
  {
    id: 'HR-002',
    name: 'Recruiting AI Co-pilot (Vendor)',
    owner: 'Human Resources',
    businessPurpose: 'Third-party tool to assist in screening resumes.',
    status: AssetStatus.InReview,
    riskClassification: RiskLevel.High,
    dateRegistered: '2025-09-01',
  },
  {
    id: 'OPS-007',
    name: 'Warehouse Optimization AI',
    owner: 'Operations',
    businessPurpose: 'Optimizes routing and inventory placement in warehouses.',
    status: AssetStatus.Proposed,
    riskClassification: RiskLevel.Low,
    dateRegistered: '2025-09-04',
  },
];

// Helper to get Tailwind CSS colors based on status or risk
const statusColorMap: { [key in AssetStatus]: string } = {
  [AssetStatus.Active]: 'bg-green-100 text-green-800',
  [AssetStatus.InReview]: 'bg-yellow-100 text-yellow-800',
  [AssetStatus.Proposed]: 'bg-blue-100 text-blue-800',
  [AssetStatus.Retired]: 'bg-gray-100 text-gray-800',
};

const riskColorMap: { [key in RiskLevel]: string } = {
  [RiskLevel.Low]: 'bg-gray-100 text-gray-800',
  [RiskLevel.Medium]: 'bg-yellow-100 text-yellow-800',
  [RiskLevel.High]: 'bg-orange-100 text-orange-800',
  [RiskLevel.Severe]: 'bg-red-100 text-red-800',
};


export default function HomePage() {
  const [assets, setAssets] = useState<AIAsset[]>(initialAssets);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveAsset = (newAssetData: Omit<AIAsset, 'id' | 'dateRegistered'>) => {
    const newAsset: AIAsset = {
      ...newAssetData,
      id: `NEW-${Math.floor(Math.random() * 1000)}`, // Create a temporary unique ID
      dateRegistered: new Date().toISOString().split('T')[0], // Set current date
      status: AssetStatus.Proposed, // New assets always start as 'Proposed'
    };
    setAssets(prevAssets => [newAsset, ...prevAssets]);
    setIsModalOpen(false); // Close modal on save
  };

  return (
    <>
      <main className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">AI Asset Inventory</h1>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Register New AI Asset
            </button>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Registered</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                      <div className="text-xs text-gray-500">{asset.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{asset.owner}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[asset.status]}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${riskColorMap[asset.riskClassification]}`}>
                        {asset.riskClassification}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{asset.dateRegistered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Render the modal form component */}
      <RegisterAssetForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAsset}
      />
    </>
  );
}
