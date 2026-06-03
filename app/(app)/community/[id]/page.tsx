'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { isAdminUser } from '@/lib/admin';
import {
  getPost, getUserReactions, getUserSavedPosts, setReaction, toggleSavePost, localizePost,
  getComments, addComment, deleteComment, commentsAllowed,
  type Post, type Reaction, type PostComment,
} from '@/lib/posts';
import { getEvent, type Event } from '@/lib/events';
import { ArrowLeft, ThumbsUp, ThumbsDown, Bookmark, CalendarDays, ArrowRight, MessageCircle, Send, Trash2, Lock } from 'lucide-react';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, preferences } = useAuth();
  const { t, language } = useLanguage();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [reaction, setReactionState] = useState<Reaction | null>(null);
  const [saved, setSaved] = useState(false);
  const [relatedEvent, setRelatedEvent] = useState<Event | null>(null);
  const [busy, setBusy] = useState(false);

  // Comments
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;
    (async () => {
      const p = await getPost(id);
      setPost(p);
      setLoading(false);
      if (p?.relatedEventId) getEvent(p.relatedEventId).then(setRelatedEvent);
      // Load comments only when the post allows them (eco: no wasted reads).
      if (p && commentsAllowed(p)) getComments(id).then(setComments);
      if (user) {
        const [r, s] = await Promise.all([getUserReactions(user.uid), getUserSavedPosts(user.uid)]);
        setReactionState(r[id] ?? null);
        setSaved(s.has(id));
      }
    })();
  }, [params.id, user]);

  if (loading) return <div className="p-8 text-center text-textMuted min-h-screen flex items-center justify-center">{t('common', 'loading')}</div>;
  if (!post) return <div className="p-8 text-center text-red-400 min-h-screen flex items-center justify-center">{t('community', 'notFound')}</div>;

  const loc = localizePost(post, language);

  const date = (() => {
    try {
      return new Date(post.createdAt).toLocaleDateString(
        language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US',
        { day: 'numeric', month: 'long', year: 'numeric' },
      );
    } catch { return ''; }
  })();

  const handleReact = async (r: Reaction) => {
    if (!user) return;
    const current = reaction;
    setBusy(true);
    setReactionState(prev => (prev === r ? null : r)); // optimistic
    try {
      const result = await setReaction(user.uid, post.id, r, current);
      setReactionState(result);
    } catch (err) {
      console.error('Reaction failed:', err);
      setReactionState(current); // roll back
    } finally { setBusy(false); }
  };

  const handleSave = async () => {
    if (!user) return;
    const wasSaved = saved;
    setBusy(true);
    setSaved(s => !s);
    try {
      const nowSaved = await toggleSavePost(user.uid, post.id, wasSaved);
      setSaved(nowSaved);
    } catch (err) {
      console.error('Save failed:', err);
      setSaved(wasSaved); // roll back
    } finally { setBusy(false); }
  };

  const myName = [preferences?.firstName, preferences?.lastName].filter(Boolean).join(' ')
    || user?.email?.split('@')[0] || 'User';
  const canModerate = isAdminUser(user?.email, preferences?.role);

  const handlePostComment = async () => {
    if (!user || !commentText.trim()) return;
    setPosting(true);
    const optimistic: PostComment = {
      id: `tmp-${comments.length}`, postId: post.id, userId: user.uid,
      userName: myName, text: commentText.trim(), createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, optimistic]);
    setCommentText('');
    try {
      const saved = await addComment(post.id, user.uid, myName, optimistic.text);
      // Swap the temp comment for the stored one (or drop it on failure).
      setComments(prev => prev.map(c => c.id === optimistic.id ? (saved ?? c) : c).filter(c => saved || c.id !== optimistic.id));
    } finally { setPosting(false); }
  };

  const handleDeleteComment = async (id: string) => {
    const prev = comments;
    setComments(cs => cs.filter(c => c.id !== id));
    const ok = await deleteComment(id);
    if (!ok) setComments(prev); // roll back
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-[760px] mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-white truncate text-xl">{t('community', 'title')}</h1>
        </header>

        <main className="p-6 sm:p-8 flex flex-col gap-6">
          {/* Cover */}
          {post.image && (
            <div className="rounded-2xl overflow-hidden border border-border bg-surface aspect-[16/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary">
              {t('interests', post.category) || post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-textMuted ms-auto">
              <CalendarDays size={13} /> {date}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">{loc.title}</h1>
          <p className="text-lg text-textMuted leading-relaxed">{loc.description}</p>

          {loc.content && (
            <div className="text-base text-gray-200 leading-relaxed whitespace-pre-wrap">{loc.content}</div>
          )}

          {/* Engagement bar */}
          <div className="flex items-center gap-2 border-y border-border/50 py-4">
            <Btn active={reaction === 'like'} activeClass="bg-primary/15 text-primary border-primary/40" disabled={busy} onClick={() => handleReact('like')}>
              <ThumbsUp size={16} /> {t('community', 'like')}
            </Btn>
            <Btn active={reaction === 'not_interested'} activeClass="bg-red-500/15 text-red-400 border-red-500/40" disabled={busy} onClick={() => handleReact('not_interested')}>
              <ThumbsDown size={16} /> {t('community', 'notInterested')}
            </Btn>
            <Btn active={saved} activeClass="bg-amber-500/15 text-amber-400 border-amber-500/40" disabled={busy} onClick={handleSave} className="ms-auto">
              <Bookmark size={16} className={saved ? 'fill-current' : ''} /> {t('community', 'save')}
            </Btn>
          </div>

          {/* Related event */}
          {relatedEvent && (
            <div>
              <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-3">{t('community', 'relatedEvents')}</h3>
              <Link
                href={`/events/${relatedEvent.id}`}
                className="flex items-center justify-between gap-3 bg-surface border border-border rounded-2xl p-4 hover:border-primary/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">{relatedEvent.title}</p>
                  <p className="text-xs text-textMuted truncate">{relatedEvent.wilaya}</p>
                </div>
                <ArrowRight size={18} className="text-primary shrink-0" />
              </Link>
            </div>
          )}

          {/* ── Comments ─────────────────────────────────────────────── */}
          <div className="border-t border-border/50 pt-6">
            {commentsAllowed(post) ? (
              <>
                <h3 className="flex items-center gap-2 text-sm font-bold text-textMuted uppercase tracking-wider mb-4">
                  <MessageCircle size={15} /> {t('community', 'comments')} ({comments.length})
                </h3>

                {/* Composer */}
                {user && (
                  <div className="flex items-start gap-2 mb-5">
                    <input
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(); } }}
                      maxLength={500}
                      placeholder={t('community', 'commentPlaceholder')}
                      className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      onClick={handlePostComment}
                      disabled={posting || !commentText.trim()}
                      className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-primary text-black hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
                      aria-label={t('community', 'postComment')}
                    >
                      <Send size={17} />
                    </button>
                  </div>
                )}

                {/* List */}
                {comments.length === 0 ? (
                  <p className="text-sm text-textMuted text-center py-6">{t('community', 'noComments')}</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {comments.map(c => (
                      <div key={c.id} className="flex gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {c.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 bg-surface border border-border/60 rounded-2xl px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white truncate">{c.userName}</span>
                            <span className="text-[10px] text-textMuted shrink-0">
                              {(() => { try { return new Date(c.createdAt).toLocaleDateString(); } catch { return ''; } })()}
                            </span>
                            {(canModerate || c.userId === user?.uid) && !c.id.startsWith('tmp-') && (
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="ms-auto text-textMuted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-200 break-words mt-0.5">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="flex items-center justify-center gap-2 text-sm text-textMuted py-4">
                <Lock size={14} /> {t('community', 'commentsDisabled')}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Btn({
  children, active, activeClass, disabled, onClick, className = '',
}: {
  children: React.ReactNode; active: boolean; activeClass: string;
  disabled?: boolean; onClick: () => void; className?: string;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50 ${
        active ? activeClass : 'border-border text-textMuted hover:text-white'
      } ${className}`}
    >
      {children}
    </button>
  );
}
