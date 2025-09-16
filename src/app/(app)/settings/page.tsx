'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Role } from '@prisma/client'; // Import Role

// Define a simple User type for the frontend state
interface ManagedUser {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
}

interface Organization {
  id: string;
  name: string;
  inviteCode: string;
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- NEW: State for user management ---
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isAdmin = session?.user?.role === Role.ADMIN;

  useEffect(() => {
    const fetchOrganization = async () => {
      if ((session?.user as any)?.organizationId) {
        const response = await fetch('/api/organizations/me');
        if (response.ok) {
          const data = await response.json();
          setOrganization(data);
        }
      }
    };

    const fetchUsers = async () => {
      // Only fetch users if the current user is an admin
      if (isAdmin) {
        setIsLoadingUsers(true);
        const response = await fetch('/api/organizations/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
        setIsLoadingUsers(false);
      }
    };

    setIsLoading(true);
    Promise.all([fetchOrganization(), fetchUsers()]).finally(() => setIsLoading(false));

  }, [session, isAdmin]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    const response = await fetch('/api/organizations/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    });

    if (response.ok) {
      // Update the user's role in the local state for immediate UI feedback
      setUsers(currentUsers =>
        currentUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      // If an admin changes their own role, update the session
      if (session?.user.id === userId) {
        await update();
      }
    } else {
      const data = await response.json();
      setError(data.error || 'Failed to update role.');
    }
  };

  const handleLeaveOrg = async () => {
    if (!window.confirm('Are you sure you want to leave this organization?')) return;
    const response = await fetch('/api/organizations/leave', { method: 'POST' });
    if (response.ok) await update();
    else {
      const data = await response.json();
      setError(data.error || 'Failed to leave organization.');
    }
  };
  
  if (isLoading || !session) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        
        {/* Organization Details Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-4">My Organization</h2>
          {organization ? (
            <div>
              <p className="text-gray-800 text-lg">You are a member of <span className="font-bold">{organization.name}</span>.</p>
              <p className="text-gray-600 mt-4">Share this code with colleagues to invite them as a Member:</p>
              <div className="mt-2 bg-gray-100 p-3 rounded-md text-center">
                <p className="text-xl font-mono font-semibold text-gray-800">{organization.inviteCode}</p>
              </div>
              <div className="mt-6 border-t pt-6">
                <button 
                  onClick={handleLeaveOrg}
                  className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition"
                >
                  Leave Organization
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">You are not currently part of an organization. Please create or join one from the Welcome page.</p>
          )}
        </div>

        {/* --- NEW: User Management Card (Admin Only) --- */}
        {isAdmin && organization && (
          <div className="bg-white shadow-md rounded-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
              <p className="text-sm text-gray-500 mt-1">Manage roles for all users in your organization.</p>
            </div>
            {isLoadingUsers ? (
              <p className="p-4 text-center text-gray-500">Loading users...</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Object.values(Role).map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {error && <p className="text-sm text-red-600 mt-4 text-center">{error}</p>}
        {message && <p className="text-sm text-green-600 mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}