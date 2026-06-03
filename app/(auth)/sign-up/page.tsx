'use client';
import { useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Language } from '@/lib/contexts/LanguageContext';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      router.push('/dashboard');
    } catch {
      setError(t('auth', 'signUpError'));
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setLoading(true); setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/dashboard');
    } catch {
      setError(t('auth', 'googleError'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Language switcher */}
        <div className="flex justify-center mb-6">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as Language)}
            aria-label={t('settings', 'language')}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-white outline-none"
          >
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="kab">Tamazight</option>
          </select>
        </div>

        <div className="flex flex-col items-center gap-2 mb-8">
          <Image src="/logo.png" alt="Forsati ODEJ" width={96} height={96} className="rounded-3xl shadow-xl shadow-primary/10" priority />
          <span className="font-forsati font-bold text-white text-3xl">Forsati</span>
        </div>

        <div className="bg-surface p-8 rounded-2xl border border-border">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">{t('nav', 'signUp')}</h1>

          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label className="text-sm text-textMuted block mb-1.5">{t('auth', 'fullName')}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                aria-label={t('auth', 'fullName')}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary outline-none text-sm transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-textMuted block mb-1.5">{t('auth', 'email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                aria-label={t('auth', 'email')}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary outline-none text-sm transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-textMuted block mb-1.5">{t('auth', 'password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                aria-label={t('auth', 'password')}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary outline-none text-sm transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black font-semibold py-3 rounded-xl hover:bg-primary/80 disabled:opacity-60 transition-all"
            >
              {loading ? t('common', 'loading') : t('nav', 'signUp')}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-textMuted">{t('common', 'or')}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-100 disabled:opacity-60 transition-all text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t('auth', 'continueGoogle')}
          </button>

          <p className="mt-6 text-center text-sm text-textMuted">
            {t('auth', 'hasAccount')}{' '}
            <Link href="/sign-in" className="text-primary hover:underline font-medium">
              {t('nav', 'signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
