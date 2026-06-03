import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';
import type { Metadata, Viewport } from 'next';

// Pinch-zoom stays ENABLED — disabling it (user-scalable=no / maximum-scale=1)
// fails Lighthouse's accessibility audit. The "page jumps/zooms on its own"
// problem on iOS is the focus auto-zoom that fires when an input's font-size is
// < 16px; that's killed in globals.css (form controls are forced to 16px on
// small screens), so the layout stays stable AND users can still zoom.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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