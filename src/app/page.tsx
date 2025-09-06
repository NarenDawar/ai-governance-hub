'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AIAsset, AssetStatus, RiskLevel } from '../lib/types';
import RegisterAssetForm from '../components/RegisterAssetForm';

// Helper color maps for styling
const statusColorMap: { [key in AssetStatus]: string } = {
  Active: 'bg-green-100 text-green-800',
  InReview: 'bg-yellow-100 text-yellow-800',
  Proposed: 'bg-blue-100 text-blue-800',
  Retired: 'bg-gray-100 text-gray-800',
};

const riskColorMap: { [key in RiskLevel]: string } = {
  Low: 'bg-gray-100 text-gray-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Severe: 'bg-red-100 text-red-800',
};

export default function HomePage() {
  const [assets, setAssets] = useState<AIAsset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all assets when the page loads
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('/api/assets');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data: AIAsset[] = await response.json();
        setAssets(data);
      } catch (err) {
        setError('Could not fetch AI assets. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Handle saving a new asset, now including the optional vendorId
  const handleSaveAsset = async (data: { 
    name: string; 
    owner: string; 
    businessPurpose: string; 
    riskClassification: RiskLevel;
    vendorId?: string;
  }) => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // The data object now includes vendorId if selected
      });

      if (!response.ok) {
        throw new Error('Failed to save the asset');
      }

      const newAsset: AIAsset = await response.json();
      // Add the new asset to the top of the list for immediate UI feedback
      setAssets(prevAssets => [newAsset, ...prevAssets]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving asset:', err);
    }
  };

  return (
    <>
      <main className="p-8">
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
            {isLoading ? (
              <p className="text-center p-8 text-gray-500">Loading assets...</p>
            ) : error ? (
              <p className="text-center p-8 text-red-500">{error}</p>
            ) : (
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
                    <tr key={asset.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/assets/${asset.id}`} className="hover:underline">
                          <div className="text-sm font-medium text-blue-600 hover:text-blue-800">{asset.name}</div>
                          <div className="text-xs text-gray-500">{asset.id}</div>
                        </Link>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(asset.dateRegistered).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <RegisterAssetForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAsset}
      />
    </>
  );
}

