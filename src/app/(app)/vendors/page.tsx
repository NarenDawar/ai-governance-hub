'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// A simple type definition for the frontend
interface Vendor {
  id: string;
  name: string;
  website: string;
  status: string;
}

const statusColorMap: { [key: string]: string } = { 
  Active: 'bg-green-100 text-green-800', 
  InReview: 'bg-yellow-100 text-yellow-800', 
  Terminated: 'bg-red-100 text-red-800' 
};

// --- NEW: Empty State Component ---
const EmptyState = () => (
  <div className="text-center bg-white p-12 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-gray-800">No Vendors Found</h3>
    <p className="mt-2 text-gray-500">
      You haven&apos;t added any third-party vendors yet. Add a vendor to start tracking the AI tools your organization uses from external companies.
    </p>
  </div>
);


export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the "Add New Vendor" form
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorWebsite, setNewVendorWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all vendors when the component mounts
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors');
        if (!response.ok) throw new Error('Failed to fetch vendors.');
        const data: Vendor[] = await response.json();
        setVendors(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendors();
  }, []);

  // Handle the form submission to create a new vendor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newVendorName, website: newVendorWebsite }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create vendor.');
      }
      const newVendor: Vendor = await response.json();
      setVendors(prev => [...prev, newVendor].sort((a, b) => a.name.localeCompare(b.name)));
      setNewVendorName('');
      setNewVendorWebsite('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create vendor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vendor List Column */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Vendor Management</h1>
          {/* --- MODIFIED: Conditional Rendering for Table or Empty State --- */}
          {isLoading ? (
            <p className="p-4 text-center text-gray-500">Loading vendors...</p>
          ) : error ? (
            <p className="p-4 text-center text-red-500">{error}</p>
          ) : vendors.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link href={`/vendors/${vendor.id}`} className="text-blue-600 hover:underline">
                          {vendor.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {vendor.website}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[vendor.status] || 'bg-gray-100 text-gray-800'}`}>
                          {vendor.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Add New Vendor Form Column */}
        <div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Vendor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700">Vendor Name</label>
                <input
                  type="text"
                  id="vendorName"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="vendorWebsite" className="block text-sm font-medium text-gray-700">Website URL</label>
                <input
                  type="url"
                  id="vendorWebsite"
                  value={newVendorWebsite}
                  onChange={(e) => setNewVendorWebsite(e.target.value)}
                  required
                  placeholder="https://example.com"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Adding...' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}