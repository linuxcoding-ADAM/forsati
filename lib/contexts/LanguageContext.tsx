"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { SplashScreen } from '@/components/SplashScreen';

// ─── Translation dictionaries ──────────────────────────────────────────────
import { ar } from '../translations/ar';
import { en } from '../translations/en';
import { fr } from '../translations/fr';
import { kab } from '../translations/kab';

export type Language = 'ar' | 'en' | 'fr' | 'kab';

const DICTS: Record<Language, Record<string, Record<string, string>>> = {
  ar: ar as any,
  en: en as any,
  fr: fr as any,
  kab: kab as any,
};

// ─── Context shape ─────────────────────────────────────────────────────────
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: string, key: string) => string;
  isRtl: boolean;
  isMounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────────────────
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('ar');
  const [isMounted, setIsMounted] = useState(false);

  // Restore persisted language once (client-side only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_language') as Language | null;
      if (saved && DICTS[saved]) setLanguageState(saved);
    } catch { /* SSR / private mode */ }
    // Critical: mark as mounted only AFTER we've resolved local storage
    setIsMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem('app_language', lang); } catch { /* ignore */ }
  }, []);

  // Apply RTL/LTR to the document and update metadata
  // English also has the key)
  const t = useCallback((section: string, key: string): string => {
    const primary = DICTS[language];
    const fallback = DICTS['en'];
    return (
      primary?.[section]?.[key] ??
      fallback?.[section]?.[key] ??
      key // absolute last resort — key itself is the value
    );
  }, [language]);

  const isRtl = language === 'ar';

  // Apply RTL/LTR to the document and update metadata
  useEffect(() => {
    const html = document.documentElement;
    html.dir = isRtl ? 'rtl' : 'ltr';
    html.lang = language;
    document.title = `Forsati — ${t('landing', 'heroHighlight') || 'Opportunity Discovery Platform'}`;
  }, [language, isRtl, t]);

  const value = useMemo(
    () => ({ language, setLanguage, t, isRtl, isMounted }),
    [language, setLanguage, t, isRtl, isMounted]
  );

  if (!isMounted) {
    return <SplashScreen />;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────────────────
export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
};
