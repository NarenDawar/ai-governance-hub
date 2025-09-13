'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function WelcomePage() {
  const { update } = useSession();
  const router = useRouter();
  
  // State for forms
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: orgName }),
    });
    const data = await response.json();
    if (response.ok) {
      await update(); // This updates the session with the new organizationId
      router.push('/inventory'); // Redirect to the app
    } else {
      setError(data.error || 'Failed to create organization.');
      setIsCreating(false);
    }
  };

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setError('');
    const response = await fetch('/api/organizations/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode }),
    });
    const data = await response.json();
    if (response.ok) {
      await update(); // This updates the session with the new organizationId
      router.push('/inventory'); // Redirect to the app
    } else {
      setError(data.error || 'Failed to join organization.');
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-700">Welcome to SafeScale AI</h1>
          <p className="text-gray-600 mt-2">To get started, create a new organization or join an existing one.</p>
        </div>
        
        <div className="bg-white shadow-xl rounded-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Create Organization Form */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create an Organization</h2>
            <p className="text-gray-500 mb-4 text-sm">Create a private workspace for your team to manage your AI assets.</p>
            <form onSubmit={handleCreateOrg} className="space-y-4 flex-grow flex flex-col">
              <div className="flex-grow">
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">Organization Name</label>
                <input
                  type="text" id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Acme Corporation"
                />
              </div>
              <button type="submit" disabled={isCreating} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>

          {/* Join Organization Form */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Join an Organization</h2>
            <p className="text-gray-500 mb-4 text-sm">Enter an invite code from a colleague to join their workspace.</p>
            <form onSubmit={handleJoinOrg} className="space-y-4 flex-grow flex flex-col">
              <div className="flex-grow">
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">Invite Code</label>
                <input
                  type="text" id="inviteCode" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste invite code here"
                />
              </div>
              <button type="submit" disabled={isJoining} className="w-full bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-400">
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            </form>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}