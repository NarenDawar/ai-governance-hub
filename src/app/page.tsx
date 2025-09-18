'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import TestimonialCard from '../components/TestimonialCard';
import DotGridBackground from '../components/DotGridBackground'; // Import the new component

// --- Reusable Feature Component ---
const Feature = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
    <div className="text-4xl mb-4 text-blue-600">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

// --- Motion Container for animations ---
const MotionContainer = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial="offscreen"
    whileInView="onscreen"
    viewport={{ once: true, amount: 0.3 }}
    transition={{ staggerChildren: 0.2 }}
  >
    {children}
  </motion.div>
);

const fadeIn = {
  offscreen: { y: 20, opacity: 0 },
  onscreen: { y: 0, opacity: 1, transition: { type: "spring" as const, duration: 1 } }
};


// --- The Main Landing Page Component ---
export default function LandingPage() {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* --- Header --- */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
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
        <section className="relative text-center py-24 md:py-32 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
          <DotGridBackground opacity={0.5} color="#bfdbfe" size={0.5} /> {/* Added DotGridBackground here */}
          <MotionContainer>
            <motion.div variants={fadeIn} className="max-w-4xl mx-auto px-4 relative z-10"> {/* Added relative z-10 */}
              <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                Govern Your AI, Not Your Innovation.
              </h2>
              <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                SafeScale AI is the centralized platform for GRC teams to manage AI risk and compliance. Get a single source of truth for all your AI assets, automate risk assessments, and scale your AI initiatives with confidence.
              </p>
              <motion.div variants={fadeIn}>
                <button
                  onClick={() => signIn('google', { callbackUrl: '/inventory', prompt: 'select_account' })}
                  className="mt-10 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105 text-lg shadow-lg"
                >
                  Get Started for Free
                </button>
              </motion.div>
            </motion.div>
          </MotionContainer>
        </section>

        {/* --- Features Section --- */}
        <section className="py-20">
          <MotionContainer>
            <div className="max-w-7xl mx-auto px-4">
              <motion.h2 variants={fadeIn} className="text-3xl font-bold text-center mb-12">A Single Pane of Glass for AI Governance</motion.h2>
              <div className="grid md:grid-cols-3 gap-8">
                <motion.div variants={fadeIn}>
                  <Feature icon={<span>🗂️</span>} title="Centralized AI Inventory">
                    Automatically discover and manually register every AI model and system across your organization. Know exactly what AI you&apos;re using, who owns it, and why.
                  </Feature>
                </motion.div>
                <motion.div variants={fadeIn}>
                  <Feature icon={<span>⚙️</span>} title="Automated Risk Workflows">
                    Turn policy into process. Our workflow engine triages new AI assets and assigns tailored risk assessments to legal, security, and compliance teams.
                  </Feature>
                </motion.div>
                <motion.div variants={fadeIn}>
                  <Feature icon={<span>🤝</span>} title="Vendor Risk Management">
                    The AI supply chain is a huge risk. Manage third-party AI vendors, send standardized security questionnaires, and track compliance from a single hub.
                  </Feature>
                </motion.div>
              </div>
            </div>
          </MotionContainer>
        </section>
        
        {/* --- Testimonials Section --- */}
        <section className="py-20 bg-gray-100">
           <MotionContainer>
            <div className="max-w-7xl mx-auto px-4">
              <motion.h2 variants={fadeIn} className="text-3xl font-bold text-center mb-12">Built for the Teams on the Front Line of AI Risk</motion.h2>
              <div className="grid md:grid-cols-2 gap-8">
                <TestimonialCard name="Catherine, Compliance Officer" title="Global Finance Corp" quote="SafeScale AI replaced a chaotic mess of spreadsheets and gave us a single source of truth. The automated risk scoring is a game-changer for our EU AI Act readiness." />
                <TestimonialCard name="David, In-House Counsel" title="InnovateTech Solutions" quote="Evaluating third-party AI vendors used to be our biggest bottleneck. Now we have a standardized, repeatable process that our entire legal team can follow." />
              </div>
            </div>
           </MotionContainer>
        </section>

        {/* --- Call to Action Section --- */}
        <section className="bg-blue-700 text-white">
          <MotionContainer>
            <div className="max-w-4xl mx-auto text-center py-20 px-4">
              <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold">Ready to Scale AI Safely?</motion.h2>
              <motion.p variants={fadeIn} className="mt-4 max-w-xl mx-auto">
                Take control of your AI ecosystem. Sign up today and get the visibility you need to innovate responsibly.
              </motion.p>
              <motion.div variants={fadeIn}>
                <button
                  onClick={() => signIn('google', { callbackUrl: '/inventory', prompt: 'select_account' })}
                  className="mt-8 bg-white text-blue-700 font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-transform hover:scale-105 text-lg shadow-lg"
                >
                  Sign Up Now
                </button>
              </motion.div>
            </div>
          </MotionContainer>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="text-center py-6 bg-white border-t">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} SafeScale AI. All rights reserved.</p>
      </footer>
    </div>
  );
}