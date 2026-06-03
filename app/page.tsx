'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Language } from '@/lib/contexts/LanguageContext';
import { Leaf, Zap, Database, Smartphone } from 'lucide-react';

export default function Landing() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background text-gray-100">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Forsati ODEJ" width={32} height={32} className="rounded-lg" />
          <span className="font-forsati text-2xl font-black text-white">Forsati</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as Language)}
            aria-label={t('settings', 'language')}
            className="bg-surface text-sm border border-border rounded-lg px-2 py-1.5 outline-none focus:border-primary text-white"
          >
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="kab">Tamazight</option>
          </select>
          <Link href="/sign-in" className="text-sm text-textMuted hover:text-white transition-colors font-medium">
            {t('nav', 'signIn')}
          </Link>
          <Link href="/sign-up" className="bg-primary text-black text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition-all">
            {t('nav', 'signUp')}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full px-6 py-20 gap-24">
        {/* Hero */}
        <section className="flex flex-col items-center text-center max-w-3xl mt-12">
          {/* Logo */}
          <div className="mb-6">
            <Image src="/logo.png" alt="Forsati" width={128} height={128} className="rounded-3xl shadow-2xl shadow-primary/20" priority />
          </div>

          {/* Pilot scope badge */}
          <div className="flex items-center justify-center mb-6">
            <span className="px-3 py-1 bg-surface border border-border text-textMuted text-xs font-medium rounded-full">
              {t('landing', 'pilotBadge')}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5 text-white leading-tight">
            {t('landing', 'heroTitle')}{' '}
            <span 
              className="text-primary font-black italic tracking-tighter block mt-2 sm:inline sm:mt-0"
              style={{ fontFamily: "'Sacrifice', 'Inter', system-ui, sans-serif" }}
            >
              {t('landing', 'heroHighlight')}
            </span>
          </h1>
          <p className="text-base text-textMuted mb-8 max-w-xl leading-relaxed">
            {t('landing', 'heroSub')}
          </p>
          <Link href="/sign-up" className="bg-primary text-black font-bold text-base px-8 py-3.5 rounded-xl hover:brightness-110 transition-all">
            {t('landing', 'getStarted')}
          </Link>
        </section>


        {/* Problem & Solution */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-bold text-white text-lg mb-2">{t('landing', 'problemTitle')}</h2>
            <p className="text-textMuted text-sm leading-relaxed">{t('landing', 'problemText')}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-bold text-white text-lg mb-2">{t('landing', 'solutionTitle')}</h2>
            <p className="text-textMuted text-sm leading-relaxed">{t('landing', 'solutionText')}</p>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full">
          {[
            { Icon: Smartphone, titleKey: 'featMultilingual', descKey: 'featMultilingualDesc' },
            { Icon: Database,   titleKey: 'featVerified',     descKey: 'featVerifiedDesc'     },
            { Icon: Zap,        titleKey: 'featPersonalized', descKey: 'featPersonalizedDesc' },
          ].map(({ Icon, titleKey, descKey }) => (
            <div key={titleKey} className="bg-surface p-6 rounded-xl border border-border">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-white text-sm mb-2">{t('landing', titleKey)}</h3>
              <p className="text-textMuted text-xs leading-relaxed">{t('landing', descKey)}</p>
            </div>
          ))}
        </section>

        {/* Eco badge */}
        <section className="w-full max-w-4xl">
          <div className="border border-green-500/20 bg-green-500/5 rounded-2xl p-6 md:p-8 flex items-start gap-5">
            <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center shrink-0">
              <Leaf size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1.5">{t('landing', 'ecoTitle')}</h3>
              <p className="text-textMuted text-sm leading-relaxed mb-3">{t('landing', 'ecoDesc')}</p>
              <ul className="flex flex-wrap gap-4 text-xs text-green-400 font-medium">
                {['ecoBandwidth', 'ecoCaching', 'ecoNoLLM'].map(key => (
                  <li key={key} className="flex items-center gap-1.5">
                    <Zap size={11} />
                    {t('landing', key)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center text-center pb-10">
          <h2 className="text-3xl font-bold text-white mb-5">{t('landing', 'ctaTitle')}</h2>
          <Link href="/sign-up" className="bg-primary text-black font-bold text-base px-10 py-3.5 rounded-xl hover:brightness-110 transition-all">
            {t('landing', 'ctaBtn')}
          </Link>
        </section>
      </main>
    </div>
  );
}