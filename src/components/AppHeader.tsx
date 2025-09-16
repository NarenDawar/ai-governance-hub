'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import AuthButton from './AuthButton';
import NotificationBell from './NotificationBell';

export default function AppHeader() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === Role.ADMIN;

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center">
            <Link href="/inventory" className="text-xl font-bold text-blue-700">
              SafeScale AI
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/inventory" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Inventory
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/vendors" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Vendors
            </Link>
            {isAdmin && (
              <>
                <Link href="/settings/templates" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Templates
                </Link>
                <Link href="/settings" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Settings
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <AuthButton />
          </div>
        </div>
      </nav>
    </header>
  );
}