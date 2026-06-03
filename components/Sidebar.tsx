'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  Home, Compass, Megaphone, MessageSquare, Settings, LogOut,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

const LINKS = [
  { href: '/dashboard', icon: Home,          key: 'home'      },
  { href: '/community', icon: Megaphone,     key: 'community' },
  { href: '/discover',  icon: Compass,       key: 'discover'  },
  { href: '/assistant', icon: MessageSquare, key: 'assistant' },
  { href: '/settings',  icon: Settings,      key: 'settings'  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { t, isRtl } = useLanguage();
  const { logout } = useAuth();
  const path = usePathname();

  // Persist across sessions
  useEffect(() => {
    try {
      const v = localStorage.getItem('sidebar_collapsed');
      if (v !== null) setCollapsed(v === 'true');
    } catch { /* ignore */ }
  }, []);

  const toggle = () =>
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebar_collapsed', String(next)); } catch { /* ignore */ }
      return next;
    });

  const isActive = (href: string) =>
    path === href || path.startsWith(href + '/');

  // Chevron direction accounts for both collapse state AND RTL
  const CollapseIcon = isRtl
    ? (collapsed ? ChevronLeft  : ChevronRight)
    : (collapsed ? ChevronRight : ChevronLeft);

  return (
    <aside
      className={`
        hidden md:flex flex-col shrink-0 relative
        bg-surface border-e border-border
        transition-[width] duration-200 ease-in-out
        ${collapsed ? 'w-[64px]' : 'w-60'}
      `}
    >
      {/* ── Brand area ───────────────────────────────────────── */}
      <div
        className={`
          flex items-center gap-3 px-4 border-b border-border
          ${collapsed ? 'justify-center py-3.5' : 'py-4'}
        `}
      >
        <Image
          src="/logo.png"
          alt="Forsati"
          width={collapsed ? 48 : 64}
          height={collapsed ? 48 : 64}
          className="rounded-xl shrink-0 transition-all duration-200"
          priority
        />
        {!collapsed && (
          <div className="overflow-hidden">
            {/* Premium wordmark */}
            <span
              className="block font-black text-2xl text-white tracking-tighter italic leading-none"
              style={{ fontFamily: "'Sacrifice', 'Inter', system-ui, sans-serif" }}
            >
              Forsati
            </span>
          </div>
        )}
      </div>

      {/* ── Collapse toggle — sits on the edge ──────────────── */}
      <button
        onClick={toggle}
        aria-label="Toggle sidebar"
        title={collapsed ? 'Expand' : 'Collapse'}
        className="
          absolute top-5 -end-3 z-20
          w-6 h-6 rounded-full
          bg-surface border border-border
          text-textMuted hover:text-white
          flex items-center justify-center
          transition-colors
        "
      >
        <CollapseIcon size={12} />
      </button>

      {/* ── Nav links ────────────────────────────────────────── */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {LINKS.map(({ href, icon: Icon, key }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? t('nav', key) : undefined}
              className={`
                flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium
                transition-colors whitespace-nowrap
                ${collapsed ? 'justify-center' : ''}
                ${active
                  ? 'bg-primary/10 text-primary'
                  : 'text-textMuted hover:text-white hover:bg-background'}
              `}
            >
              <Icon size={19} strokeWidth={active ? 2.3 : 1.7} className="shrink-0" />
              {!collapsed && <span className="truncate">{t('nav', key)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="p-2 border-t border-border">
        <button
          onClick={logout}
          title={collapsed ? t('nav', 'logout') : undefined}
          className={`
            w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg
            text-sm font-medium text-textMuted hover:text-white hover:bg-background
            transition-colors
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={19} strokeWidth={1.7} className="shrink-0" />
          {!collapsed && <span className="truncate">{t('nav', 'logout')}</span>}
        </button>
      </div>
    </aside>
  );
}