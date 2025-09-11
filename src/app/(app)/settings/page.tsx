'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface Organization {
  id: string;
  name: string;
  inviteCode: string;
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchOrganization = async () => {
      setIsLoading(true);
      if ((session?.user as any)?.organizationId) { // eslint-disable-line @typescript-eslint/no-explicit-any
        const response = await fetch('/api/organizations/me');
        if (response.ok) {
          const data = await response.json();
          setOrganization(data);
        } else {
          setOrganization(null);
        }
      } else {
        setOrganization(null);
      }
      setIsLoading(false);
    };
    fetchOrganization();
  }, [session]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: orgName }),
    });
    const data = await response.json();
    if (response.ok) {
      setMessage(`Organization "${data.name}" created!`);
      await update();
    } else {
      setError(data.error || 'Failed to create organization.');
    }
  };

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const response = await fetch('/api/organizations/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode }),
    });
    const data = await response.json();
    if (response.ok) {
      setMessage('Successfully joined organization!');
      await update();
    } else {
      setError(data.error || 'Failed to join organization.');
    }
  };

  // --- NEW: Function to handle leaving an organization ---
  const handleLeaveOrg = async () => {
    if (!window.confirm('Are you sure you want to leave this organization?')) {
      return;
    }
    setError('');
    setMessage('');
    const response = await fetch('/api/organizations/leave', { method: 'POST' });
    const data = await response.json();
    if (response.ok) {
      setMessage('You have successfully left the organization.');
      await update(); // This will refresh the session and trigger the useEffect
    } else {
      setError(data.error || 'Failed to leave organization.');
    }
  };
  // --------------------------------------------------------
  
  if (isLoading || !session) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-4">Organization</h2>

          {organization ? (
            <div>
              <p className="text-gray-800 text-lg">You are a member of <span className="font-bold">{organization.name}</span>.</p>
              <p className="text-gray-600 mt-4">Share this code with your colleagues to invite them:</p>
              <div className="mt-2 bg-gray-100 p-3 rounded-md text-center">
                <p className="text-xl font-mono font-semibold text-gray-800">{organization.inviteCode}</p>
              </div>

              {/* --- NEW: Leave Organization Button --- */}
              <div className="mt-6 border-t pt-6">
                <button 
                  onClick={handleLeaveOrg}
                  className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition"
                >
                  Leave Organization
                </button>
              </div>
              {/* ------------------------------------ */}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Create Organization Form */}
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Create an Organization</h3>
                <form onSubmit={handleCreateOrg} className="space-y-4">
                  <div>
                    <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">Organization Name</label>
                    <input
                      type="text" id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">Create</button>
                </form>
              </div>

              {/* Join Organization Form */}
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Join an Organization</h3>
                 <form onSubmit={handleJoinOrg} className="space-y-4">
                  <div>
                    <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">Invite Code</label>
                    <input
                      type="text" id="inviteCode" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button type="submit" className="w-full bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700">Join</button>
                </form>
              </div>
            </div>
          )}
          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
          {message && <p className="text-sm text-green-600 mt-4">{message}</p>}
        </div>
      </div>
    </div>
  );
}