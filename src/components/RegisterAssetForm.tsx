'use client';

import { useState, useEffect } from 'react';
import { RiskLevel, RiskLevelEnum } from '../lib/types';

// Simple type for the form's vendor state
interface Vendor {
  id: string;
  name: string;
}

// The onSave function now includes an optional vendorId
interface RegisterAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    owner: string;
    businessPurpose: string;
    riskClassification: RiskLevel;
    vendorId?: string; // vendorId is optional
  }) => void;
}

export default function RegisterAssetForm({ isOpen, onClose, onSave }: RegisterAssetFormProps) {
  // --- NEW: State for vendors ---
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  // -----------------------------

  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [businessPurpose, setBusinessPurpose] = useState('');
  const [riskClassification, setRiskClassification] = useState<RiskLevel>(RiskLevelEnum.Low);
  
  // --- NEW: Fetch vendors when the modal opens ---
  useEffect(() => {
    if (isOpen) {
      const fetchVendors = async () => {
        try {
          const response = await fetch('/api/vendors');
          const data: Vendor[] = await response.json();
          setVendors(data);
        } catch (error) {
          console.error("Failed to fetch vendors for form", error);
        }
      };
      fetchVendors();
    }
  }, [isOpen]);
  // ---------------------------------------------

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      name, 
      owner, 
      businessPurpose, 
      riskClassification,
      // Pass the selected vendorId, or undefined if "None" is chosen
      vendorId: selectedVendor || undefined,
    });
    
    // Reset form fields
    setName('');
    setOwner('');
    setBusinessPurpose('');
    setRiskClassification(RiskLevelEnum.Low);
    setSelectedVendor('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg z-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Register New AI Asset</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* ... other form fields (name, owner, etc.) remain the same ... */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Asset Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label htmlFor="owner" className="block text-sm font-medium text-gray-700">Owner (Team/Department)</label>
              <input type="text" id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
             <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Business Purpose</label>
              <textarea id="purpose" value={businessPurpose} onChange={(e) => setBusinessPurpose(e.target.value)} required rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
             <div>
              <label htmlFor="risk" className="block text-sm font-medium text-gray-700">Initial Risk Classification</label>
              <select id="risk" value={riskClassification} onChange={(e) => setRiskClassification(e.target.value as RiskLevel)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                {Object.values(RiskLevelEnum).map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            {/* --- NEW VENDOR DROPDOWN --- */}
            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">Third-Party Vendor (Optional)</label>
              <select 
                id="vendor" 
                value={selectedVendor} 
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">None (Internal Asset)</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                ))}
              </select>
            </div>
            {/* ------------------------- */}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition">
              Save Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

