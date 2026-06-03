import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';
import type { Metadata, Viewport } from 'next';

// Zoom is locked on phones (no pinch-zoom, no iOS focus auto-zoom) so the layout
// stays visually stable, as requested. The globals.css rule that forces form
// controls to 16px on small screens still belts-and-suspenders the iOS
// focus-zoom case. Note: locking zoom does cost a few points on Lighthouse's
// accessibility audit — that's an accepted trade for the stable mobile layout.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

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
  // Default lang/dir match the default language (Arabic). LanguageContext updates
  // these on the client when the user switches language — but having them in the
  // initial HTML satisfies the "html element has a [lang] attribute" a11y audit
  // even before hydration.
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-background text-gray-100">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}