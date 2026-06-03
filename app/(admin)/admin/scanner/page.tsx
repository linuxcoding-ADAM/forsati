'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isAdminUser } from '@/lib/admin';
import { confirmAttendance, type AttendanceResult, type EventRegistration } from '@/lib/events';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import {
  ArrowLeft, ScanLine, CheckCircle2, XCircle, AlertTriangle, Award, Camera, Loader2, ShieldAlert, LogOut,
} from 'lucide-react';

const READER_ID = 'qr-reader';

export default function ScannerPage() {
  const { t } = useLanguage();

  // ── Admin auth gate ───────────────────────────────────────────────────────
  const [user, setUser] = useState<User | null | 'loading'>('loading');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setUser(null); setIsAdmin(false); return; }
      let role: string | null = null;
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        role = snap.exists() ? (snap.data()?.role ?? 'user') : 'user';
      } catch { role = 'user'; }
      setIsAdmin(isAdminUser(u.email, role));
      setUser(u);
    });
    return unsub;
  }, []);

  if (user === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={52} className="text-red-500 mb-4 opacity-80" />
        <h2 className="text-xl font-bold text-white mb-2">{t('common', 'unauthorized')}</h2>
        <p className="text-sm text-textMuted max-w-xs mb-6">{t('scanner', 'adminOnly')}</p>
        <div className="flex gap-3">
          <Link href="/admin" className="px-5 py-2.5 bg-surface border border-border rounded-lg text-sm text-white hover:border-primary transition-colors">
            {t('scanner', 'backToAdmin')}
          </Link>
          {user && (
            <button onClick={() => signOut(auth)} className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border rounded-lg text-sm text-white hover:border-primary transition-colors">
              <LogOut size={14} /> {t('nav', 'logout')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return <Scanner />;
}

// ── The actual scanner (only mounted for admins) ────────────────────────────
function Scanner() {
  const { t } = useLanguage();
  const [active, setActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [camError, setCamError] = useState('');

  const scannerRef = useRef<any>(null);       // Html5Qrcode instance
  const lockRef = useRef(false);              // re-entrancy guard for decode callback
  const seenRef = useRef<Set<string>>(new Set()); // tickets handled this session

  // Stop & tear down the camera.
  const stopCamera = useCallback(async () => {
    const s = scannerRef.current;
    scannerRef.current = null;
    if (s) {
      try { await s.stop(); } catch { /* already stopped */ }
      try { await s.clear(); } catch { /* ignore */ }
    }
  }, []);

  const handleDecoded = useCallback(async (decoded: string) => {
    if (lockRef.current) return;            // ignore the rapid repeat frames
    lockRef.current = true;
    setProcessing(true);
    await stopCamera();
    setActive(false);

    const ticketId = decoded.trim();
    // Session-level duplicate guard (in addition to the Firestore one).
    if (seenRef.current.has(ticketId)) {
      setProcessing(false);
      setResult({ status: 'duplicate', registration: { ticketId } as EventRegistration });
      return;
    }

    const res = await confirmAttendance(ticketId);
    if (res.status === 'valid') seenRef.current.add(ticketId);
    setResult(res);
    setProcessing(false);
  }, [stopCamera]);

  // Start the camera whenever we enter the "active" state.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;
        const instance = new Html5Qrcode(READER_ID, /* verbose */ false);
        scannerRef.current = instance;
        await instance.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText: string) => { handleDecoded(decodedText); },
          () => { /* per-frame decode failure — ignore */ }
        );
      } catch (err: any) {
        if (!cancelled) {
          setCamError(err?.message || 'Camera unavailable');
          setActive(false);
        }
      }
    })();

    return () => { cancelled = true; stopCamera(); };
  }, [active, handleDecoded, stopCamera]);

  const startScan = () => {
    setResult(null);
    setCamError('');
    lockRef.current = false;
    setActive(true);
  };
  const scanNext = () => { setResult(null); startScan(); };

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border flex items-center gap-3 px-5 py-3.5">
        <Link href="/admin" className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <ScanLine size={18} className="text-primary" />
          <h1 className="font-bold text-white text-sm">{t('scanner', 'title')}</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto p-5 flex flex-col gap-5">
        <p className="text-sm text-textMuted text-center">{t('scanner', 'subtitle')}</p>

        {/* Camera viewport */}
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-black border border-border">
          <div id={READER_ID} className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

          {!active && !processing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-textMuted">
              <Camera size={48} className="opacity-50" />
              <span className="text-sm">{t('scanner', 'cameraIdle')}</span>
            </div>
          )}
          {processing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 text-white">
              <Loader2 size={40} className="animate-spin text-primary" />
              <span className="text-sm">{t('scanner', 'verifying')}</span>
            </div>
          )}
          {active && !processing && (
            <div className="pointer-events-none absolute inset-0 border-[3px] border-primary/40 rounded-3xl m-8" />
          )}
        </div>

        {camError && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{t('scanner', 'cameraError')}: {camError}</span>
          </div>
        )}

        {/* Result */}
        {result && <ResultCard result={result} />}

        {/* Controls */}
        {!active && !processing && (
          <button
            onClick={result ? scanNext : startScan}
            className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <ScanLine size={18} /> {result ? t('scanner', 'scanNext') : t('scanner', 'startScan')}
          </button>
        )}
        {active && !processing && (
          <button
            onClick={() => { stopCamera(); setActive(false); }}
            className="w-full border border-border text-textMuted font-semibold py-3 rounded-2xl hover:text-white hover:border-white transition-colors"
          >
            {t('common', 'cancel')}
          </button>
        )}
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: AttendanceResult }) {
  const { t } = useLanguage();

  if (result.status === 'valid') {
    const name = result.registration.answers?.name
      || [result.registration.answers?.first_name, result.registration.answers?.last_name].filter(Boolean).join(' ')
      || '—';
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5 flex flex-col items-center text-center gap-2">
        <CheckCircle2 size={44} className="text-green-400" />
        <h3 className="text-lg font-black text-white">{t('scanner', 'validTitle')}</h3>
        <p className="text-sm text-textMuted">{name}</p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-bold">
          <Award size={15} /> +{result.points} {t('scanner', 'points')}
        </div>
      </div>
    );
  }
  if (result.status === 'duplicate') {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex flex-col items-center text-center gap-2">
        <AlertTriangle size={44} className="text-amber-400" />
        <h3 className="text-lg font-black text-white">{t('scanner', 'duplicateTitle')}</h3>
        <p className="text-sm text-textMuted">{t('scanner', 'duplicateSub')}</p>
      </div>
    );
  }
  if (result.status === 'invalid') {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex flex-col items-center text-center gap-2">
        <XCircle size={44} className="text-red-400" />
        <h3 className="text-lg font-black text-white">{t('scanner', 'invalidTitle')}</h3>
        <p className="text-sm text-textMuted">{t('scanner', 'invalidSub')}</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex flex-col items-center text-center gap-2">
      <XCircle size={44} className="text-red-400" />
      <h3 className="text-lg font-black text-white">{t('scanner', 'errorTitle')}</h3>
      <p className="text-sm text-textMuted break-words">{result.message}</p>
    </div>
  );
}
