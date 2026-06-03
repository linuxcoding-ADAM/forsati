'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Home, Compass, Megaphone, MessageSquare, Settings } from 'lucide-react';

const TABS = [
  { href: '/dashboard',  icon: Home,          labelKey: 'home'      },
  { href: '/community',  icon: Megaphone,      labelKey: 'community' },
  { href: '/discover',   icon: Compass,        labelKey: 'discover'  },
  { href: '/assistant',  icon: MessageSquare,  labelKey: 'assistant' },
  { href: '/settings',   icon: Settings,       labelKey: 'settings'  },
];

export function BottomNav() {
  const { t } = useLanguage();
  const path = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border flex">
      {TABS.map(({ href, icon: Icon, labelKey }) => {
        const active = path === href || path.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              active ? 'text-primary' : 'text-textMuted'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
            <span>{t('nav', labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
