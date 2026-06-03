"use client";
import { LanguageProvider } from '../../lib/contexts/LanguageContext';
import { AuthProvider } from '../../lib/contexts/AuthContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AuthProvider>
  );
}
