'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AIAsset, AssetStatus, RiskLevel, AssetStatusEnum, RiskLevelEnum } from '../../lib/types';
import RegisterAssetForm from '../../components/RegisterAssetForm';

const statusColorMap: { [key in AssetStatus]: string } = { Active: 'bg-green-100 text-green-800', InReview: 'bg-yellow-100 text-yellow-800', Proposed: 'bg-blue-100 text-blue-800', Retired: 'bg-gray-100 text-gray-800' };
const riskColorMap: { [key in RiskLevel]: string } = { Low: 'bg-gray-100 text-gray-800', Medium: 'bg-yellow-100 text-yellow-800', High: 'bg-orange-100 text-orange-800', Severe: 'bg-red-100 text-red-800' };

export default function HomePage() {
  const [assets, setAssets] = useState<AIAsset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // --- NEW: State for search and filtering ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'All'>('All');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'All'>('All');
  // -------------------------------------------

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/assets');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data: AIAsset[] = await response.json();
        setAssets(data);
      } catch {
        setError('Could not fetch AI assets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssets();
  }, []);

  // --- NEW: Filtering logic ---
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = searchTerm === '' || 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.businessPurpose.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
      const matchesRisk = riskFilter === 'All' || asset.riskClassification === riskFilter;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [assets, searchTerm, statusFilter, riskFilter]);
  // ----------------------------

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
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save the asset');
      const newAsset: AIAsset = await response.json();
      setAssets(prevAssets => [newAsset, ...prevAssets]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving asset:', err);
    }
  };
  
  const handleSync = async () => {
    // ... (handleSync function remains the same)
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const response = await fetch('/api/assets/sync', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Sync failed');
      
      setSyncMessage(result.message);
      // Refetch assets after a successful sync
      const assetResponse = await fetch('/api/assets');
      const data: AIAsset[] = await assetResponse.json();
      setAssets(data);

    } catch (err: unknown) {
      setSyncMessage(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  return (
    <>
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">AI Asset Inventory</h1>
            <div className="flex space-x-2">
               <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition disabled:bg-gray-400"
              >
                {isSyncing ? 'Syncing...' : 'Sync with Cloud'}
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Register New AI Asset
              </button>
            </div>
          </div>

          {syncMessage && <div className="text-center text-sm text-gray-600 mb-4 h-5"><span>{syncMessage}</span></div>}
          
          {/* --- NEW: Search and filter UI --- */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Search by name or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                {Object.values(AssetStatusEnum).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-1">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Risk Levels</option>
                {Object.values(RiskLevelEnum).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {/* --------------------------------- */}

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Registered</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* --- UPDATE: Render the filtered assets --- */}
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/assets/${asset.id}`} className="hover:underline">
                          <div className="text-sm font-medium text-blue-600 hover:text-blue-800">{asset.name}</div>
                          <div className="text-xs text-gray-500">{asset.id}</div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{asset.owner}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                       {asset.vendor?.name ? asset.vendor.name : 'Internal'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[asset.status]}`}>{asset.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${riskColorMap[asset.riskClassification]}`}>{asset.riskClassification}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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