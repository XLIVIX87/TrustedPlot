import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrustedPlot - Trust-First Real Estate',
  description: 'Verified listings, structured inspections, and secure transactions for Nigerian real estate.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-page">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
