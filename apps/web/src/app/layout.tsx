import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Fanout — Programmable Revenue Sharing on Stellar',
  description: 'One payment. Everyone gets their share. Automate multi-beneficiary revenue distributions using Soroban smart contracts.',
  icons: {
    icon: '/fanout-logo.png',
    shortcut: '/fanout-logo.png',
    apple: '/fanout-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
