import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  // Resolves relative OG/icon URLs to absolute ones. Removes the
  // "metadataBase property in metadata export is not set" terminal warning.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Forsati | ODEJ Opportunities',
  description: 'Personalized youth opportunity discovery platform powered by ODEJ Bejaia data.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Forsati — Discover Your Opportunity',
    description: 'Intelligent, eco-friendly platform connecting Algerian youth with ODEJ institutions.',
    images: ['/logo.png'],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className="bg-background text-gray-100">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}