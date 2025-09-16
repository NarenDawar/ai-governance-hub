'use client';

import { useState, useEffect, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import {
  AIAsset,
  Assessment,
  AuditLog,
  AssetStatus,
  RiskLevel,
  AssetStatusEnum,
  RiskLevelEnum,
  AssessmentStatus as AssessmentStatusType
} from '../../../../lib/types';

interface AssessmentTemplate {
  id: string;
  name: string;
}

const statusColorMap: { [key in AssetStatus]: string } = { Active: 'bg-green-100 text-green-800', InReview: 'bg-yellow-100 text-yellow-800', Proposed: 'bg-blue-100 text-blue-800', Retired: 'bg-gray-100 text-gray-800' };
const riskColorMap: { [key in RiskLevel]: string } = { Low: 'bg-gray-100 text-gray-800', Medium: 'bg-yellow-100 text-yellow-800', High: 'bg-orange-100 text-orange-800', Severe: 'bg-red-100 text-red-800' };
const assessmentStatusColorMap: { [key in AssessmentStatusType]: string } = { NotStarted: 'bg-gray-100 text-gray-800', InProgress: 'bg-yellow-100 text-yellow-800', Completed: 'bg-green-100 text-green-800', Archived: 'bg-indigo-100 text-indigo-800' };

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value}</dd>
  </div>
);

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params.assetId as string;
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === Role.ADMIN;

  const [asset, setAsset] = useState<AIAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState<AssetStatus | undefined>();
  const [editedRisk, setEditedRisk] = useState<RiskLevel | undefined>();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(true);
  
  const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
  const [isLoadingLog, setIsLoadingLog] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    if (!assetId) return;

    const fetchPageData = async () => {
      setIsLoading(true);
      setIsLoadingAssessments(true);
      setIsLoadingLog(true);
      try {
        const assetRes = await fetch(`/api/assets/${assetId}`);
        if (!assetRes.ok) throw new Error('Failed to fetch asset data.');
        const assetData: AIAsset = await assetRes.json();
        setAsset(assetData);
        setEditedStatus(assetData.status);
        setEditedRisk(assetData.riskClassification);

        const assessmentsRes = await fetch(`/api/assets/${assetId}/assessments`);
        if (!assessmentsRes.ok) throw new Error('Failed to fetch assessments.');
        const assessmentsData: Assessment[] = await assessmentsRes.json();
        setAssessments(assessmentsData);

        const logRes = await fetch(`/api/assets/${assetId}/auditlog`);
        if (!logRes.ok) throw new Error('Failed to fetch audit log.');
        const logData: AuditLog[] = await logRes.json();
        setAuditLog(logData);

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
        setIsLoadingAssessments(false);
        setIsLoadingLog(false);
      }
    };
    fetchPageData();
  }, [assetId]);

  const handleSave = async () => {
    if (!asset) return;
    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editedStatus, riskClassification: editedRisk }),
      });
      if (!response.ok) throw new Error('Failed to update the asset');
      const updatedAsset: AIAsset = await response.json();
      setAsset(updatedAsset);
      
      const logRes = await fetch(`/api/assets/${assetId}/auditlog`);
      const logData: AuditLog[] = await logRes.json();
      setAuditLog(logData);

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving asset:', err);
    }
  };

  const handleDeleteAsset = async () => {
    if (window.confirm('Are you sure you want to permanently delete this asset? This action cannot be undone.')) {
      const response = await fetch(`/api/assets/${assetId}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/inventory');
      } else {
        const data = await response.json();
        alert(`Failed to delete asset: ${data.error}`);
      }
    }
  };
  
  const handleCancel = () => {
    if (asset) {
      setEditedStatus(asset.status);
      setEditedRisk(asset.riskClassification);
    }
    setIsEditing(false);
  };

  const handleStartAssessment = async (templateId: string) => {
    if (!templateId) return;
    try {
      const response = await fetch(`/api/assets/${assetId}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });
      if (!response.ok) throw new Error('Failed to start assessment.');
      const newAssessment: Assessment = await response.json();
      setAssessments(prev => [newAssessment, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openAssessmentModal = async () => {
    try {
        const res = await fetch('/api/assessment-templates');
        if (!res.ok) throw new Error('Failed to fetch templates');
        const data = await res.json();
        setTemplates(data);
        if (data.length > 0) {
            setSelectedTemplate(data[0].id);
        }
        setIsModalOpen(true);
    } catch (error) {
        console.error(error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading page...</p></div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;
  }
  if (!asset) {
    return <div className="flex justify-center items-center h-screen"><p>No asset data available.</p></div>;
  }

  return (
    <Fragment>
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/inventory" className="text-blue-600 hover:underline">&larr; Back to Inventory</Link>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
             <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{asset.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{asset.id}</p>
              </div>
              {isAdmin && (
                <div className="flex space-x-2">
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition">
                      Edit
                    </button>
                  )}
                  <button onClick={handleDeleteAsset} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition">
                    Delete
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <DetailItem label="Owner" value={asset.owner} />
                <DetailItem
                  label="Source"
                  value={asset.vendor?.name ? `Vendor: ${asset.vendor.name}` : 'Internal'}
                />
                {isEditing ? (
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select id="status" value={editedStatus} onChange={(e) => setEditedStatus(e.target.value as AssetStatus)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                      {Object.values(AssetStatusEnum).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ) : (
                  <DetailItem label="Status" value={<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[asset.status]}`}>{asset.status}</span>} />
                )}
                {isEditing ? (
                   <div>
                    <label htmlFor="risk" className="block text-sm font-medium text-gray-700">Risk Classification</label>
                    <select id="risk" value={editedRisk} onChange={(e) => setEditedRisk(e.target.value as RiskLevel)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                      {Object.values(RiskLevelEnum).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                ) : (
                  <DetailItem label="Risk Classification" value={<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${riskColorMap[asset.riskClassification]}`}>{asset.riskClassification}</span>} />
                )}
                <DetailItem label="Date Registered" value={new Date(asset.dateRegistered).toLocaleDateString()} />
                <div className="sm:col-span-2">
                  <DetailItem label="Business Purpose" value={<p className="text-gray-700">{asset.businessPurpose}</p>} />
                </div>
              </dl>
              {isEditing && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button onClick={handleCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button onClick={handleSave} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition">Save Changes</button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white shadow-md rounded-lg">
             <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Compliance & Risk Assessments</h2>
              <button
                onClick={openAssessmentModal}
                className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition"
              >
                Start New Assessment
              </button>
            </div>
            <div className="p-6">
              {isLoadingAssessments ? (
                <p className="text-gray-500">Loading assessments...</p>
              ) : assessments.length === 0 ? (
                <p className="text-gray-500">No assessments have been started for this asset.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {assessments.map(assessment => (
                    <li key={assessment.id} className="py-4 flex justify-between items-center">
                      <div>
                        <Link href={`/assessments/${assessment.id}`} className="text-blue-600 hover:underline font-medium">
                          {assessment.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          Started on {new Date(assessment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assessmentStatusColorMap[assessment.status]}`}>
                          {assessment.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white shadow-md rounded-lg">
             <div className="p-6 border-b border-gray-200">
               <h2 className="text-xl font-semibold text-gray-800">Activity</h2>
             </div>
             <div className="p-6">
               {isLoadingLog ? (
                 <p className="text-gray-500">Loading activity log...</p>
               ) : auditLog.length === 0 ? (
                 <p className="text-gray-500">No activity has been recorded for this asset.</p>
               ) : (
                 <ul className="space-y-4">
                   {auditLog.map(log => (
                     <li key={log.id} className="flex space-x-3">
                       <div className="flex-shrink-0">
                         <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                           <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                         </div>
                       </div>
                       <div className="min-w-0 flex-1">
                         <p className="text-sm">
                           <span className="font-medium text-gray-800">{log.user?.name || log.user?.email || 'System'}</span>
                           <span className="text-gray-600"> {log.details}</span>
                         </p>
                         <p className="text-xs text-gray-500">
                           {new Date(log.createdAt).toLocaleString()}
                         </p>
                       </div>
                     </li>
                   ))}
                 </ul>
               )}
             </div>
          </div>
        </div>
      </main>

      {/* --- MODIFIED: Assessment Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50 relative">
            {/* --- NEW: Close Button --- */}
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* ------------------------- */}

            <h2 className="text-xl font-bold text-gray-800 mb-4">Start New Assessment</h2>
            <p className="text-sm text-gray-600 mb-4">Select an assessment template to begin.</p>
            
            {templates.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="template" className="block text-sm font-medium text-gray-700">Template</label>
                  <select
                    id="template"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button onClick={() => handleStartAssessment(selectedTemplate)} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition">Start Assessment</button>
                </div>
              </div>
            ) : (
              // --- MODIFIED: Add a cancel button here too ---
              <div className="text-center">
                <p className="text-gray-500">No assessment templates found. Please create one first in the Settings.</p>
                <div className="mt-6 flex justify-end">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
}