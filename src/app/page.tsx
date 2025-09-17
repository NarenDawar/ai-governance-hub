'use client';

// REMOVED: Unused 'Link' import
import { signIn } from 'next-auth/react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SafeScale AI | The AI Governance & Compliance Platform',
  description: 'A centralized platform for managing AI governance, risk, and compliance. Get a single source of truth for all your AI assets and automate risk assessments.',
}

// --- Reusable Feature Component ---
const Feature = ({ icon, title, children }: { icon: string, title: string, children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
    <div className="text-4xl mb-4 text-blue-600">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

// --- The Main Landing Page Component ---
export default function LandingPage() {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* --- Header --- */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">SafeScale AI</h1>
          <button
            onClick={() => signIn('google', { callbackUrl: '/inventory', prompt: 'select_account' })}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </nav>
      </header>

      <main>
        {/* --- Hero Section --- */}
        <section className="text-center py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Govern Your AI, Not Your Innovation.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              SafeScale AI is the centralized platform for managing AI governance, risk, and compliance. Get a single source of truth for all your AI assets, automate risk assessments, and scale your AI initiatives with confidence.
            </p>
            <button
              onClick={() => signIn('google', { callbackUrl: '/inventory', prompt: 'select_account' })}
              className="mt-8 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition text-lg"
            >
              Get Started for Free
            </button>
          </div>
        </section>

        {/* --- Features Section --- */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">A Single Pane of Glass for AI Governance</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Feature icon="🗂️" title="Centralized AI Inventory">
                {/* FIXED: Replaced you're with you&apos;re */}
                Automatically discover and manually register every AI model and system across your organization. Know exactly what AI you&apos;re using, who owns it, and why.
              </Feature>
              <Feature icon="⚙️" title="Automated Risk Workflows">
                Turn policy into process. Our workflow engine triages new AI assets and assigns tailored risk assessments to legal, security, and compliance teams.
              </Feature>
              <Feature icon="🤝" title="Vendor Risk Management">
                The AI supply chain is a huge risk. Manage third-party AI vendors, send standardized security questionnaires, and track compliance from a single hub.
              </Feature>
            </div>
          </div>
        </section>

        {/* --- Call to Action Section --- */}
        <section className="bg-blue-700 text-white">
          <div className="max-w-4xl mx-auto text-center py-16 px-4">
            <h2 className="text-3xl font-bold">Ready to Scale AI Safely?</h2>
            <p className="mt-4">
              Take control of your AI ecosystem. Sign up today and get the visibility you need to innovate responsibly.
            </p>
            <button
              onClick={() => signIn('google', { callbackUrl: '/inventory', prompt: 'select_account' })}
              className="mt-8 bg-white text-blue-700 font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition text-lg"
            >
              Sign Up Now
            </button>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="text-center py-6 bg-white border-t">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} SafeScale AI. All rights reserved.</p>
      </footer>
    </div>
  );
}