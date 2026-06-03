'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { Onboarding } from '@/components/Onboarding';
import { SplashScreen } from '@/components/SplashScreen';
import { OdejCorner } from '@/components/OdejCorner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, preferences, loading } = useAuth();
  const { isRtl, isMounted } = useLanguage();
  const router = useRouter();

  // Redirect unauthenticated users to landing page
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  // Show splash screen while Firebase auth is initializing
  if (loading) {
    return <SplashScreen />;
  }

  if (!user) return null; // redirect in progress

  // Gated strictly by onboardingComplete flag. Returning users will never see this again.
  const needsOnboarding = preferences && !preferences.onboardingComplete;

  if (needsOnboarding) {
    return <Onboarding />;
  }

  return (
    /**
     * RTL FIX:
     * Standard flex-row combined with dir="rtl" natively puts the first element 
     * on the right. Removing flex-row-reverse fixes the RTL sidebar bug.
     */
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex h-screen overflow-hidden bg-background flex-row"
    >
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 min-w-0">
        {children}
      </main>
      <BottomNav />
      <OdejCorner />
    </div>
  );
}