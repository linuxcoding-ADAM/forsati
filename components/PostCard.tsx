'use client';
import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { localizePost, type Post, type Reaction } from '@/lib/posts';
import { ThumbsUp, ThumbsDown, Bookmark, CalendarDays } from 'lucide-react';

interface Props {
  post: Post;
  reaction: Reaction | null;
  saved: boolean;
  busy?: boolean;
  onReact: (reaction: Reaction) => void;
  onSave: () => void;
}

export function PostCard({ post, reaction, saved, busy, onReact, onSave }: Props) {
  const { t, language } = useLanguage();
  const { title, description } = localizePost(post, language);

  let date = '';
  try {
    date = new Date(post.createdAt).toLocaleDateString(
      language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US',
      { day: 'numeric', month: 'short', year: 'numeric' },
    );
  } catch { /* ignore */ }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors flex flex-col animate-fade-in">
      {/* Cover (optional) */}
      {post.image && (
        <Link href={`/community/${post.id}`} className="block relative aspect-[16/9] bg-background overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image} alt={title} className="w-full h-full object-cover" />
        </Link>
      )}

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {t('interests', post.category) || post.category}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-textMuted ms-auto">
            <CalendarDays size={11} /> {date}
          </span>
        </div>

        <Link href={`/community/${post.id}`} className="group">
          <h3 className="font-bold text-white text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-textMuted line-clamp-3">{description}</p>

        {/* Engagement actions */}
        <div className="mt-auto pt-3 flex items-center gap-2">
          <ActionBtn
            active={reaction === 'like'} activeClass="bg-primary/15 text-primary border-primary/40"
            disabled={busy} onClick={() => onReact('like')} label={t('community', 'like')}
          >
            <ThumbsUp size={15} />
          </ActionBtn>
          <ActionBtn
            active={reaction === 'not_interested'} activeClass="bg-red-500/15 text-red-400 border-red-500/40"
            disabled={busy} onClick={() => onReact('not_interested')} label={t('community', 'notInterested')}
          >
            <ThumbsDown size={15} />
          </ActionBtn>
          <ActionBtn
            active={saved} activeClass="bg-amber-500/15 text-amber-400 border-amber-500/40"
            disabled={busy} onClick={onSave} label={t('community', 'save')} className="ms-auto"
          >
            <Bookmark size={15} className={saved ? 'fill-current' : ''} />
          </ActionBtn>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  children, label, active, activeClass, disabled, onClick, className = '',
}: {
  children: React.ReactNode; label: string; active: boolean; activeClass: string;
  disabled?: boolean; onClick: () => void; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 ${
        active ? activeClass : 'border-border text-textMuted hover:text-white'
      } ${className}`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
