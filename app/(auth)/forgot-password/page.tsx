'use client';
import { useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch {
      setError(t('auth', 'signInError'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 font-bold text-xl mb-8">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-black font-bold text-xs">F</span>
          </div>
          Forsati
        </div>
        <div className="bg-surface p-8 rounded-2xl border border-border">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">{t('auth', 'resetPassword')}</h1>
          
          {sent ? (
            <div className="text-center py-4">
              <p className="text-green-400 mb-6">{t('auth', 'resetSent')}</p>
              <Link href="/sign-in" className="text-primary hover:underline text-sm">{t('nav', 'signIn')}</Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 mt-6">
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <div>
                <label className="text-sm text-textMuted block mb-1.5">{t('auth', 'email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-black font-semibold py-3 rounded-xl disabled:opacity-60 hover:bg-primary/80 transition-all"
              >
                {loading ? t('common', 'loading') : t('auth', 'resetPassword')}
              </button>
              <div className="text-center">
                <Link href="/sign-in" className="text-sm text-textMuted hover:text-white">{t('common', 'back')}</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
