import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "./SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Governance & Compliance Hub",
  description: "A centralized system for managing AI governance, risk, and compliance.",
  icons: {
    icon: '/favicon.ico',
  },
};

// a comment

// This is the root layout for the entire application.
// Its only job is to set up the HTML shell and the session provider.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

