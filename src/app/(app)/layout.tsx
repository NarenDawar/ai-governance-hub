'use client';

import Link from 'next/link';
import AuthButton from '../../components/AuthButton';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full py-4 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center">
              {/* --- BRANDING CHANGE --- */}
              <Link href="/inventory" className="text-xl font-bold text-blue-700">
                SafeScale AI
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {/* --- LINK CHANGE --- */}
              <Link href="/inventory" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                Inventory
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/vendors" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                Vendors
              </Link>
              <Link href="/settings" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                Settings
              </Link>
            </div>
            <div>
              <AuthButton />
            </div>
          </div>
        </nav>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}