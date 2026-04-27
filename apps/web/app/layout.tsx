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
      <head>
        {/* Preconnect to speed up font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Body fonts — Manrope (headlines) + Inter (body) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />

        {/*
          Material Symbols Outlined — variable font with all axes.
          Uses display=block (not swap) so icons never flash as raw text.
          Axes: opsz 20–48, wght 100–700, FILL 0–1, GRAD -50–200
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
