'use client';
import { useState, useEffect, useCallback, memo } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { ODEJ_DATA } from '@/lib/data';
import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, getCountFromServer,
} from 'firebase/firestore';
import {
  Building2, Users, CalendarDays, Plus, Trash2, Lock, ChevronDown, ChevronUp,
  ShieldAlert, LogOut, Mail, ScanLine, Megaphone, ThumbsUp, ThumbsDown, Bookmark,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { isAdminUser } from '@/lib/admin';
import { createPost, getPosts, getPostEngagement, type Post, type PostEngagement } from '@/lib/posts';

const INSTITUTIONS = ODEJ_DATA.institutions as any[];
const PAGE_SIZE = 15;

// Event types double as recommendation categories (they map to user interests).
const EVENT_CATEGORIES = [
  'tech', 'ai', 'robotics', 'science', 'sport', 'culture',
  'art', 'theatre', 'music', 'environment', 'volunteering', 'debate', 'entrepreneurship',
];

const EMPTY_EVENT = {
  title: '', description: '', category: 'tech', wilaya: 'Bejaia', venue: '',
  dateTime: '', seats: '', status: 'open' as 'open' | 'closed', published: true,
};

// ─── Memoised institution row ──────────────────────────────────────────────
const InstRow = memo(({ inst, lang }: { inst: any; lang: string }) => (
  <tr className="border-b border-border/40 hover:bg-background/50 transition-colors">
    <td className="py-2.5 px-4 font-mono text-xs text-textMuted">{inst.id}</td>
    <td className="py-2.5 px-4 text-white text-sm">{inst.name_ar}</td>
    <td className="py-2.5 px-4 text-textMuted text-sm">
      {lang === 'ar' ? inst.commune_ar : inst.commune_fr}
    </td>
    <td className="py-2.5 px-4 text-textMuted text-sm">
      {lang === 'ar' ? inst.category_name_ar : inst.category_name_fr}
    </td>
  </tr>
));
InstRow.displayName = 'InstRow';

// ─── Login form ───────────────────────────────────────────────────────────
function AdminLogin({ onSuccess }: { onSuccess: (user: User) => void }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      onSuccess(result.user);
    } catch {
      setError(t('admin', 'wrongPassword'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <Image src="/logo.png" alt="ODEJ Forsati" width={96} height={96} className="rounded-3xl shadow-xl shadow-primary/10" />
          <div className="text-center">
            <h1 className="font-forsati text-2xl font-bold text-white">
              Forsati Admin
            </h1>
            <p className="text-xs text-textMuted mt-1">ODEJ Bejaia — Administration</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-7">
          <div className="flex justify-center mb-5">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Lock size={20} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-textMuted block mb-1.5">
                {t('auth', 'email')}
              </label>
              <div className="relative">
                <Mail size={14} className="absolute start-3 top-3 text-textMuted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-background border border-border rounded-lg ps-9 pe-4 py-2.5 text-white text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-textMuted block mb-1.5">
                {t('auth', 'password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black font-semibold py-2.5 rounded-lg hover:brightness-110 transition-all text-sm disabled:opacity-60"
            >
              {loading ? t('common', 'loading') : t('admin', 'loginBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Unauthorized screen ──────────────────────────────────────────────────
function Unauthorized({ onSignOut }: { onSignOut: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <ShieldAlert size={52} className="text-red-500 mb-4 opacity-80" />
      <h2 className="text-xl font-bold text-white mb-2">{t('common', 'unauthorized')}</h2>
      <p className="text-sm text-textMuted max-w-xs mb-6">
        Your account does not have the <code className="text-primary">admin</code> role required to access this area.
      </p>
      <button
        onClick={onSignOut}
        className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border rounded-lg text-sm text-white hover:border-primary transition-colors"
      >
        <LogOut size={14} /> Sign Out
      </button>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────
const KPI = ({ label, val, icon: Icon }: { label: string; val: string | number; icon: React.ElementType }) => (
  <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
    <div className="p-2.5 bg-primary/10 rounded-xl shrink-0"><Icon size={20} className="text-primary" /></div>
    <div>
      <p className="text-xl font-bold text-white">{val}</p>
      <p className="text-xs text-textMuted">{label}</p>
    </div>
  </div>
);

// ─── Community: create posts + engagement analytics ──────────────────────
const EMPTY_POST = { title: '', description: '', content: '', category: 'tech', image: '', relatedEventId: '' };

function CommunitySection({ user }: { user: User }) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [eng, setEng] = useState<Record<string, PostEngagement>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_POST });
  const [allowComments, setAllowComments] = useState(true);

  const setField = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    const p = await getPosts();
    setPosts(p);
    const entries = await Promise.all(p.map(async post => [post.id, await getPostEngagement(post.id)] as const));
    setEng(Object.fromEntries(entries));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setCreating(true);
    try {
      await createPost({
        title: form.title.trim(),
        description: form.description.trim(),
        content: form.content.trim() || undefined,
        category: form.category,
        image: form.image.trim() || null,
        relatedEventId: form.relatedEventId.trim() || null,
        commentsEnabled: allowComments,
        createdBy: user.email ?? user.uid,
      });
      setForm({ ...EMPTY_POST });
      setAllowComments(true);
      load();
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
        <Megaphone size={16} className="text-primary" />
        <h2 className="font-semibold text-white text-sm">{t('community', 'title')} — {t('admin', 'createPost')}</h2>
      </div>

      <div className="p-5">
        {/* Create post */}
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-background/40 border border-border/60 rounded-xl p-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-textMuted block mb-1">Title *</label>
            <input value={form.title} onChange={e => setField('title', e.target.value)} placeholder="🤖 Robotics Workshop Registration Open"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-textMuted block mb-1">Short Description *</label>
            <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={2} placeholder="One or two lines shown on the card"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary resize-y" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-textMuted block mb-1">Full Content (optional)</label>
            <textarea value={form.content} onChange={e => setField('content', e.target.value)} rows={3} placeholder="Full body shown on the post page"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary resize-y" />
          </div>
          <div>
            <label className="text-xs text-textMuted block mb-1">Category</label>
            <select value={form.category} onChange={e => setField('category', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary">
              {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{t('interests', c) || c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-textMuted block mb-1">Related Event ID (optional)</label>
            <input value={form.relatedEventId} onChange={e => setField('relatedEventId', e.target.value)} placeholder="demo-event-robotics-akbou"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-textMuted block mb-1">Cover Image URL (optional)</label>
            <input value={form.image} onChange={e => setField('image', e.target.value)} placeholder="https://…"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary" />
          </div>
          {/* Allow comments toggle */}
          <div className="sm:col-span-2 flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2.5">
            <div>
              <p className="text-sm text-white font-medium">{t('community', 'allowComments')}</p>
              <p className="text-[11px] text-textMuted">{allowComments ? t('community', 'commentsOnHint') : t('community', 'commentsOffHint')}</p>
            </div>
            <button
              type="button" role="switch" aria-checked={allowComments}
              onClick={() => setAllowComments(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${allowComments ? 'bg-primary' : 'bg-border'}`}
            >
              <span className={`absolute top-0.5 start-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${allowComments ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="sm:col-span-2">
            <button type="submit" disabled={creating || !form.title}
              className="w-full flex justify-center items-center gap-1.5 bg-primary text-black text-sm font-semibold px-4 py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50">
              <Plus size={15} /> {creating ? t('common', 'loading') : t('admin', 'publishPost')}
            </button>
          </div>
        </form>

        {/* Analytics */}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-textMuted mb-3">{t('admin', 'communityAnalytics')}</h3>
        {loading ? (
          <p className="text-textMuted text-xs py-4 text-center">{t('common', 'loading')}</p>
        ) : posts.length === 0 ? (
          <p className="text-textMuted text-xs py-4 text-center">{t('community', 'noPosts')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {posts.map(post => {
              const e = eng[post.id];
              return (
                <div key={post.id} className="flex items-center gap-3 bg-background border border-border/60 rounded-lg px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">{post.title}</p>
                    <p className="text-[11px] text-textMuted">{t('interests', post.category) || post.category}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="flex items-center gap-1 text-primary"><ThumbsUp size={13} /> {e?.likes ?? 0}</span>
                    <span className="flex items-center gap-1 text-red-400"><ThumbsDown size={13} /> {e?.notInterested ?? 0}</span>
                    <span className="flex items-center gap-1 text-amber-400"><Bookmark size={13} /> {e?.saved ?? 0}</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{e?.rate ?? 0}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────
function Dashboard({ user }: { user: User }) {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<any[]>([]);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_EVENT });
  const [creating, setCreating] = useState(false);
  const [showInstitutions, setShowInstitutions] = useState(false);
  const [instPage, setInstPage] = useState(0);

  const setField = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const loadKpis = useCallback(async () => {
    setLoadingKpis(true);
    try {
      const [snap, usersSnap] = await Promise.all([
        getDocs(query(collection(db, 'events'), orderBy('date', 'desc'))),
        getCountFromServer(collection(db, 'users')),
      ]);
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setUserCount(usersSnap.data().count);
    } catch (e) { console.error(e); }
    setLoadingKpis(false);
  }, []);

  useEffect(() => { loadKpis(); }, [loadKpis]);

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.dateTime) return;
    setCreating(true);
    try {
      await addDoc(collection(db, 'events'), {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        wilaya: form.wilaya,
        venue: form.venue.trim(),
        // datetime-local → ISO string (matches the Event.date contract)
        date: new Date(form.dateTime).toISOString(),
        status: form.status,
        published: form.published,
        availableSeats: form.seats ? Number(form.seats) : null,
        registrationFields: ['name', 'email', 'phone'],
        institutionId: '',
        createdAt: new Date().toISOString(),
      });
      setForm({ ...EMPTY_EVENT });
      loadKpis();
    } catch (err) {
      console.error('Failed to create event:', err);
    } finally {
      setCreating(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm(t('admin', 'confirmDelete'))) return;
    await deleteDoc(doc(db, 'events', id));
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const pagedInsts = INSTITUTIONS.slice(instPage * PAGE_SIZE, (instPage + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(INSTITUTIONS.length / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Topbar */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="ODEJ" width={32} height={32} className="rounded-lg" />
          <div>
            <span className="font-bold text-white text-sm">Forsati Admin</span>
            <span className="text-xs text-textMuted block">ODEJ Bejaia</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-textMuted hidden sm:block">{user.email}</span>
          <Link
            href="/admin/scanner"
            className="flex items-center gap-1.5 text-xs font-semibold text-black bg-primary hover:brightness-110 transition-all px-3 py-1.5 rounded-lg"
          >
            <ScanLine size={13} /> {t('scanner', 'title')}
          </Link>
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-1.5 text-xs text-textMuted hover:text-white transition-colors border border-border px-3 py-1.5 rounded-lg"
          >
            <LogOut size={13} /> {t('nav', 'logout')}
          </button>
        </div>
      </header>

      <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-6 pb-10">
        <h1 className="text-xl font-bold text-white">{t('admin', 'title')}</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPI label={t('admin', 'totalInstitutions')} val={INSTITUTIONS.length} icon={Building2} />
          <KPI label={t('admin', 'totalUsers')} val={loadingKpis ? '…' : (userCount ?? 0)} icon={Users} />
          <KPI label={t('admin', 'activeEvents')} val={loadingKpis ? '…' : events.length} icon={CalendarDays} />
        </div>

        {/* Event Management */}
        <section className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="font-semibold text-white text-sm">{t('admin', 'eventManagement')}</h2>
          </div>
          <div className="p-5">
            <form onSubmit={addEvent} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-background/40 border border-border/60 rounded-xl p-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="text-xs text-textMuted block mb-1">{t('admin', 'eventTitle')} *</label>
                <input
                  type="text" value={form.title} onChange={e => setField('title', e.target.value)}
                  placeholder="Robotics Workshop Akbou"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary"
                />
              </div>
              {/* Description */}
              <div className="sm:col-span-2">
                <label className="text-xs text-textMuted block mb-1">Description</label>
                <textarea
                  value={form.description} onChange={e => setField('description', e.target.value)}
                  placeholder="Short description shown on the event page"
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary resize-y"
                />
              </div>
              {/* Type */}
              <div>
                <label className="text-xs text-textMuted block mb-1">Event Type</label>
                <select
                  value={form.category} onChange={e => setField('category', e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary"
                >
                  {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{t('interests', c) || c}</option>)}
                </select>
              </div>
              {/* Date & Time */}
              <div>
                <label className="text-xs text-textMuted block mb-1">{t('admin', 'eventDate')} & Time *</label>
                <input
                  type="datetime-local" value={form.dateTime} onChange={e => setField('dateTime', e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary"
                />
              </div>
              {/* Wilaya */}
              <div>
                <label className="text-xs text-textMuted block mb-1">Wilaya</label>
                <input
                  type="text" value={form.wilaya} onChange={e => setField('wilaya', e.target.value)}
                  placeholder="Bejaia"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary"
                />
              </div>
              {/* Venue / Place */}
              <div>
                <label className="text-xs text-textMuted block mb-1">Place / Venue</label>
                <input
                  type="text" value={form.venue} onChange={e => setField('venue', e.target.value)}
                  placeholder="Maison de Jeunes Akbou"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary"
                />
              </div>
              {/* Seats */}
              <div>
                <label className="text-xs text-textMuted block mb-1">Available Seats</label>
                <input
                  type="number" min="0" value={form.seats} onChange={e => setField('seats', e.target.value)}
                  placeholder="Unlimited if empty"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary"
                />
              </div>
              {/* Registration status */}
              <div>
                <label className="text-xs text-textMuted block mb-1">Registration</label>
                <div className="flex gap-2">
                  {(['open', 'closed'] as const).map(s => (
                    <button
                      key={s} type="button" onClick={() => setField('status', s)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors capitalize ${
                        form.status === s ? 'bg-primary/10 border-primary text-primary' : 'border-border text-textMuted hover:text-white'
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </div>
              {/* Publish vs draft */}
              <div className="sm:col-span-2 flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2.5">
                <div>
                  <p className="text-sm text-white font-medium">{form.published ? 'Publish now' : 'Save as draft'}</p>
                  <p className="text-[11px] text-textMuted">{form.published ? 'Visible to users immediately' : 'Hidden from the public feed'}</p>
                </div>
                <button
                  type="button" role="switch" aria-checked={form.published}
                  onClick={() => setField('published', !form.published)}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.published ? 'bg-primary' : 'bg-border'}`}
                >
                  <span className={`absolute top-0.5 start-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {/* Submit */}
              <div className="sm:col-span-2">
                <button
                  type="submit" disabled={creating || !form.title || !form.dateTime}
                  className="w-full flex justify-center items-center gap-1.5 bg-primary text-black text-sm font-semibold px-4 py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  <Plus size={15} /> {creating ? t('common', 'loading') : (form.published ? t('admin', 'createEvent') : 'Save Draft')}
                </button>
              </div>
            </form>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-textMuted uppercase">
                    <th className="py-2.5 px-4 text-start">{t('admin', 'eventTitle')}</th>
                    <th className="py-2.5 px-4 text-start">{t('admin', 'eventDate')}</th>
                    <th className="py-2.5 px-4 text-end">{t('admin', 'actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingKpis ? (
                    <tr><td colSpan={3} className="text-center py-6 text-textMuted text-xs">{t('common', 'loading')}</td></tr>
                  ) : events.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-6 text-textMuted text-xs">{t('admin', 'noEvents')}</td></tr>
                  ) : events.map(ev => (
                    <tr key={ev.id} className="border-b border-border/40 hover:bg-background/50">
                      <td className="py-2.5 px-4">
                        <div className="text-white font-medium">{ev.title}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {ev.published === false
                            ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Draft</span>
                            : <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">Published</span>}
                          {ev.status && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background border border-border text-textMuted capitalize">{ev.status}</span>}
                          {ev.category && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background border border-border text-textMuted">{t('interests', ev.category) || ev.category}</span>}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-textMuted whitespace-nowrap">
                        {ev.date ? new Date(ev.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-end">
                        <button onClick={() => deleteEvent(ev.id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Institutions — lazy accordion */}
        <section className="bg-surface border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowInstitutions(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 border-b border-border hover:bg-background/30 transition-colors"
          >
            <h2 className="font-semibold text-white text-sm">
              {t('admin', 'institutionManagement')} ({INSTITUTIONS.length})
            </h2>
            {showInstitutions ? <ChevronUp size={16} className="text-textMuted" /> : <ChevronDown size={16} className="text-textMuted" />}
          </button>
          {showInstitutions && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-textMuted uppercase">
                    <th className="py-2.5 px-4 text-start">{t('admin', 'id')}</th>
                    <th className="py-2.5 px-4 text-start">{t('admin', 'name')}</th>
                    <th className="py-2.5 px-4 text-start">{t('admin', 'commune')}</th>
                    <th className="py-2.5 px-4 text-start">{t('admin', 'category')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedInsts.map(inst => (
                    <InstRow key={inst.id} inst={inst} lang={language} />
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <button disabled={instPage === 0} onClick={() => setInstPage(p => p - 1)}
                  className="text-xs text-textMuted disabled:opacity-40 hover:text-white px-3 py-1.5 border border-border rounded-lg">
                  ← {t('common', 'back')}
                </button>
                <span className="text-xs text-textMuted">{instPage + 1} / {totalPages}</span>
                <button disabled={instPage >= totalPages - 1} onClick={() => setInstPage(p => p + 1)}
                  className="text-xs text-textMuted disabled:opacity-40 hover:text-white px-3 py-1.5 border border-border rounded-lg">
                  {t('common', 'next')} →
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Community — create posts + engagement analytics */}
        <CommunitySection user={user} />
      </div>
    </div>
  );
}

// ─── Root — orchestrates auth state ──────────────────────────────────────
export default function AdminPage() {
  const [user, setUser] = useState<User | null | 'loading'>('loading');
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setUser(null); setRole(null); return; }
      // Fetch role from Firestore users doc
      try {
        const { doc: fsDoc, getDoc } = await import('firebase/firestore');
        const snap = await getDoc(fsDoc(db, 'users', u.uid));
        setRole(snap.exists() ? (snap.data()?.role ?? 'user') : 'user');
      } catch { setRole('user'); }
      setUser(u);
    });
    return unsub;
  }, []);

  if (user === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AdminLogin onSuccess={setUser} />;
  if (!isAdminUser(user.email, role)) return <Unauthorized onSignOut={() => signOut(auth)} />;
  return <Dashboard user={user} />;
}
