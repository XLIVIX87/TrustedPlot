import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrustedPlot — Verified Real Estate in Nigeria',
  description: 'Browse legally verified properties in Lagos and Abuja with C of O documentation, on-site inspections, and escrow-protected transactions.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'TrustedPlot — Verified Real Estate in Nigeria',
    description: 'Trust-first property discovery. Every listing verified. Every transaction escrow-protected.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
