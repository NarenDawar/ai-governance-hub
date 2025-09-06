import type { Metadata } from "next";
import Link from 'next/link';
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Governance & Compliance Hub",
  description: "A centralized system for managing AI governance, risk, and compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="w-full py-4 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center">
                  <Link href="/" className="text-xl font-bold text-gray-800">
                    AI Governance Hub
                  </Link>
                </div>
                <div className="space-x-8">
                    <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                        Inventory
                    </Link>
                    <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                        Dashboard
                    </Link>
                </div>
              </div>
            </nav>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
