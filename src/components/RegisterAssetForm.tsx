// src/components/RegisterAssetForm.tsx

'use client';

import { useState } from 'react';
import { AIAsset, AssetStatus, RiskLevel } from '../lib/types';

// Define the properties the component will accept
interface RegisterAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newAsset: Omit<AIAsset, 'id' | 'dateRegistered'>) => void;
}

export default function RegisterAssetForm({ isOpen, onClose, onSave }: RegisterAssetFormProps) {
  // State for each form field
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [businessPurpose, setBusinessPurpose] = useState('');
  const [status, setStatus] = useState(AssetStatus.Proposed);
  const [riskClassification, setRiskClassification] = useState(RiskLevel.Low);
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, owner, businessPurpose, status, riskClassification });
    // Optionally reset form fields here before closing
    setName('');
    setOwner('');
    setBusinessPurpose('');
    onClose();
  };

  return (
    // Modal Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg z-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Register New AI Asset</h2>
        <form onSubmit={handleSubmit}>
          {/* Form Fields */}
          <div className="space-y-4">
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
                {Object.values(RiskLevel).map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
          </div>
          {/* Action Buttons */}
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