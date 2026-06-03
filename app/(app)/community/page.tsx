'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import {
  getPosts, getUserReactions, getUserSavedPosts, setReaction, toggleSavePost,
  rankPosts, type Post, type Reaction,
} from '@/lib/posts';
import { PostCard } from '@/components/PostCard';
import { Megaphone, Bookmark } from 'lucide-react';

export default function CommunityPage() {
  const { user, preferences } = useAuth();
  const { t } = useLanguage();

  const [posts, setPosts] = useState<Post[]>([]);
  const [reactions, setReactions] = useState<Record<string, Reaction>>({});
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'saved'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [p, r, s] = await Promise.all([
        getPosts(),
        user ? getUserReactions(user.uid) : Promise.resolve({}),
        user ? getUserSavedPosts(user.uid) : Promise.resolve(new Set<string>()),
      ]);
      setPosts(p);
      setReactions(r);
      setSaved(s);
      setLoading(false);
    })();
  }, [user]);

  // Ranked by interests + reaction signals; not-interested posts are dropped.
  const ranked = useMemo(
    () => rankPosts(posts, { interests: preferences?.interests, reactions }),
    [posts, preferences?.interests, reactions],
  );

  const visible = useMemo(() => {
    if (filter === 'saved') return posts.filter(p => saved.has(p.id)); // saved keeps disliked too
    return ranked;
  }, [filter, ranked, posts, saved]);

  const handleReact = async (postId: string, reaction: Reaction) => {
    if (!user) return;
    const current = reactions[postId] ?? null;
    setBusyId(postId);
    // Optimistic
    setReactions(prev => {
      const next = { ...prev };
      if (next[postId] === reaction) delete next[postId];
      else next[postId] = reaction;
      return next;
    });
    try {
      const result = await setReaction(user.uid, postId, reaction, current);
      setReactions(prev => {
        const next = { ...prev };
        if (result === null) delete next[postId];
        else next[postId] = result;
        return next;
      });
    } catch (err) {
      console.error('Reaction failed:', err);
      // Roll back to the known previous state on failure.
      setReactions(prev => {
        const next = { ...prev };
        if (current === null) delete next[postId]; else next[postId] = current;
        return next;
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleSave = async (postId: string) => {
    if (!user) return;
    const wasSaved = saved.has(postId);
    setBusyId(postId);
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
    try {
      const nowSaved = await toggleSavePost(user.uid, postId, wasSaved);
      setSaved(prev => {
        const next = new Set(prev);
        if (nowSaved) next.add(postId); else next.delete(postId);
        return next;
      });
    } catch (err) {
      console.error('Save failed:', err);
      setSaved(prev => {
        const next = new Set(prev);
        if (wasSaved) next.add(postId); else next.delete(postId);
        return next;
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl"><Megaphone size={20} className="text-primary" /></div>
        <div>
          <h1 className="text-xl font-bold text-white">{t('community', 'title')}</h1>
          <p className="text-sm text-textMuted">{t('community', 'subtitle')}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'saved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              filter === f ? 'bg-primary/10 border-primary text-primary' : 'border-border text-textMuted hover:text-white'
            }`}
          >
            {f === 'saved' && <Bookmark size={14} />}
            {f === 'all' ? t('community', 'allPosts') : t('community', 'savedPosts')}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface/50 border border-border rounded-xl h-56 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-2xl">
          <Megaphone size={36} className="mx-auto text-textMuted/50 mb-3" />
          <p className="text-textMuted">
            {filter === 'saved' ? t('community', 'noSaved') : t('community', 'noPosts')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(post => (
            <PostCard
              key={post.id}
              post={post}
              reaction={reactions[post.id] ?? null}
              saved={saved.has(post.id)}
              busy={busyId === post.id}
              onReact={r => handleReact(post.id, r)}
              onSave={() => handleSave(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
