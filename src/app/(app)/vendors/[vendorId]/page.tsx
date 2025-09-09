'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AIAsset } from '../../../../lib/types';

interface VendorDetails {
  id: string;
  name: string;
  website: string;
  status: string;
  aiAssets: AIAsset[];
}

const statusColorMap: { [key: string]: string } = { 
  Active: 'bg-green-100 text-green-800', 
  InReview: 'bg-yellow-100 text-yellow-800', 
  Terminated: 'bg-red-100 text-red-800' 
};

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;

    const fetchVendorDetails = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/vendors/${vendorId}`);
        if (!res.ok) throw new Error('Failed to fetch vendor data.');
        const data = await res.json();
        setVendor(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendorDetails();
  }, [vendorId]);

  if (isLoading) {
    return <div className="p-8">Loading vendor details...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!vendor) {
    return <div className="p-8">Vendor not found.</div>;
  }

  return (
    <main className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/vendors" className="text-blue-600 hover:underline">&larr; Back to All Vendors</Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{vendor.name}</h1>
                <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">{vendor.website}</a>
              </div>
              <span className={`px-3 py-1 text-sm leading-5 font-semibold rounded-full ${statusColorMap[vendor.status] || 'bg-gray-100 text-gray-800'}`}>
                {vendor.status}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Associated AI Assets</h2>
            {vendor.aiAssets.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {vendor.aiAssets.map(asset => (
                  <li key={asset.id} className="py-3">
                    <Link href={`/assets/${asset.id}`} className="text-blue-600 hover:underline font-medium">
                      {asset.name}
                    </Link>
                    <p className="text-sm text-gray-500">{asset.businessPurpose}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No AI assets are currently associated with this vendor.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}