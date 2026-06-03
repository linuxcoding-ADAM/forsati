'use client';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Clock, Plus } from 'lucide-react';
import Image from 'next/image';
import { ODEJ_DATA } from '@/lib/data';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { MapPin, Phone } from 'lucide-react';
import type { RawInst, Lang } from '@/lib/localize';
import { localize } from '@/lib/localize';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Message {
  role: 'bot' | 'user';
  text: string;
  results?: RawInst[];
}

interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

// ─── Storage helpers ────────────────────────────────────────────────────────
const STORAGE_KEY = 'forsati_chat_history';

function loadHistory(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(convos: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convos.slice(0, 20))); // keep max 20
  } catch { /* storage full — ignore */ }
}

// ─── Intent engine ──────────────────────────────────────────────────────────
const GREETING_SET = new Set([
  'hi','hello','hey','salut','bonjour','bonsoir','salam','azul','مرحبا','مرحباً',
  'السلام عليكم','صباح الخير','مساء الخير','ahlan','allo','coucou','bsr','bjr',
]);
const HELP_WORDS = [
  'help','aide','what can','que peux','ماذا','كيف','ساعدني','instructions',
  'que sais','what do','capabilities','fonctions',
];

type Intent = 'greeting' | 'help' | 'search';

function classifyIntent(q: string): Intent {
  const clean = q.toLowerCase().trim().replace(/[?!.,؟]/g, '');
  if (GREETING_SET.has(clean)) return 'greeting';
  if (HELP_WORDS.some(w => clean.includes(w))) return 'help';
  return 'search';
}

// ─── Dataset search ──────────────────────────────────────────────────────────
const RAW_INSTS = ODEJ_DATA.institutions as unknown as RawInst[];

/** Token scoring — weights longer, more specific tokens higher */
function search(query: string, contextComune?: string): RawInst[] {
  const tokens = query
    .toLowerCase()
    .trim()
    .replace(/[?!.,؟]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);

  if (tokens.length === 0) return [];

  const scored = RAW_INSTS.map(inst => {
    const blob = [
      inst.name_ar, inst.name_fr,
      inst.commune_ar, inst.commune_fr,
      inst.wilaya,
      inst.category, inst.category_name_ar, inst.category_name_fr,
      ...(inst.activity_tags ?? []),
    ].filter(Boolean).join(' ').toLowerCase();

    let score = 0;
    for (const tok of tokens) {
      if (blob.includes(tok)) score += tok.length > 4 ? 4 : 2;
    }

    // Boost if commune context matches
    if (contextComune) {
      const ctx = contextComune.toLowerCase();
      if ((inst.commune_ar ?? '').toLowerCase().includes(ctx) ||
          (inst.commune_fr ?? '').toLowerCase().includes(ctx)) {
        score += 6;
      }
    }

    return { inst, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.inst);
}

/** Extract a commune name from a message (for context follow-up) */
function extractContextComune(messages: Message[]): string | undefined {
  const communes = Array.from(new Set([
    ...RAW_INSTS.flatMap(i => [i.commune_ar, i.commune_fr].filter(Boolean) as string[]),
  ]));
  // Walk back through user messages looking for a commune
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== 'user') continue;
    const text = messages[i].text.toLowerCase();
    for (const c of communes) {
      if (text.includes(c.toLowerCase())) return c;
    }
  }
  return undefined;
}

// ─── Result card ─────────────────────────────────────────────────────────────
function ResultCard({ raw, lang }: { raw: RawInst; lang: Lang }) {
  const { t } = useLanguage();
  const inst = localize(raw, lang);
  return (
    <div className="bg-background border border-border rounded-xl p-3 text-sm space-y-1.5">
      <p className="font-semibold text-white leading-snug">{inst.name}</p>
      <p className="text-[11px] text-textMuted">{inst.categoryName}</p>
      <div className="flex items-center gap-1.5 text-[11px] text-textMuted">
        <MapPin size={10} className="shrink-0" /><span>{inst.commune}</span>
      </div>
      {inst.phone && (
        <div className="flex items-center gap-1.5 text-[11px] text-textMuted">
          <Phone size={10} className="shrink-0" /><span>{inst.phone}</span>
        </div>
      )}
      {inst.activityTags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {inst.activityTags.slice(0, 4).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
              {t('interests', tag)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel({
  conversations, active, onSelect, onDelete, onNew, onClose,
}: {
  conversations: Conversation[];
  active: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="absolute inset-y-0 start-0 z-20 w-72 bg-surface border-e border-border flex flex-col shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-semibold text-white text-sm">{t('assistant', 'history')}</span>
        <button onClick={onClose} className="text-textMuted hover:text-white p-1 rounded-lg transition-colors">✕</button>
      </div>
      <button
        onClick={onNew}
        className="mx-3 mt-3 mb-2 flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary hover:bg-primary/20 transition-colors"
      >
        <Plus size={14} /> {t('assistant', 'newChat')}
      </button>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 && (
          <p className="text-xs text-textMuted px-2 py-3">{t('assistant', 'noHistory')}</p>
        )}
        {conversations.map(c => (
          <div
            key={c.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              c.id === active ? 'bg-primary/10 text-primary' : 'hover:bg-background text-textMuted hover:text-white'
            }`}
          >
            <button className="flex-1 text-start" onClick={() => { onSelect(c.id); onClose(); }}>
              <p className="text-xs font-medium truncate">{c.title}</p>
              <p className="text-[10px] opacity-60">{new Date(c.timestamp).toLocaleDateString()}</p>
            </button>
            <button
              onClick={() => onDelete(c.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AssistantPage() {
  const { t, language, isRtl } = useLanguage();
  const { preferences } = useAuth();
  const lang = language as Lang;
  const historyEnabled = preferences?.chatHistoryEnabled !== false;

  const makeWelcome = useCallback((): Message => ({
    role: 'bot',
    text: t('assistant', 'welcome'),
  }), [t]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    if (!historyEnabled) return;
    const h = loadHistory();
    setConversations(h);
    if (h.length > 0) {
      setActiveId(h[0].id);
      setMessages(h[0].messages);
    } else {
      startNew();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startNew() {
    const id = Date.now().toString();
    const welcome = makeWelcome();
    const newConvo: Conversation = {
      id,
      title: t('assistant', 'newChat'),
      timestamp: Date.now(),
      messages: [welcome],
    };
    setActiveId(id);
    setMessages([welcome]);
    if (historyEnabled) {
      setConversations(prev => {
        const updated = [newConvo, ...prev];
        saveHistory(updated);
        return updated;
      });
    }
  }

  function persistMessages(id: string, msgs: Message[], title?: string) {
    if (!historyEnabled) return;
    setConversations(prev => {
      const updated = prev.map(c =>
        c.id === id ? { ...c, messages: msgs, ...(title ? { title } : {}) } : c
      );
      saveHistory(updated);
      return updated;
    });
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const reply = useCallback((query: string, currentMsgs: Message[]) => {
    const intent = classifyIntent(query);
    let botMsg: Message;

    if (intent === 'greeting') {
      botMsg = { role: 'bot', text: t('assistant', 'greetingReply') };
    } else if (intent === 'help') {
      botMsg = { role: 'bot', text: t('assistant', 'helpReply') };
    } else {
      // Context-aware: detect if follow-up refers to a commune mentioned before
      const contextComune = extractContextComune(currentMsgs);
      const results = search(query, contextComune);

      if (results.length === 0) {
        botMsg = { role: 'bot', text: t('assistant', 'notFound') };
      } else {
        const key = results.length >= 5 ? 'foundTop' : 'found';
        botMsg = {
          role: 'bot',
          text: t('assistant', key).replace('{count}', String(results.length)),
          results,
        };
      }
    }

    setMessages(prev => {
      const updated = [...prev, botMsg];
      // Auto-title from first user query
      const firstUserMsg = updated.find(m => m.role === 'user');
      const title = firstUserMsg
        ? firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '…' : '')
        : t('assistant', 'newChat');
      persistMessages(activeId, updated, title);
      return updated;
    });
  }, [t, activeId, historyEnabled]);

  const handleSend = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    const userMsg: Message = { role: 'user', text: q };
    
    // Explicitly construct currentMsgs array to avoid relying on updater side-effects
    const currentMsgs = [...messages, userMsg];
    setMessages(currentMsgs);
    setInput('');
    
    setTimeout(() => reply(q, currentMsgs), 150);
  }, [input, messages, reply]);

  const handleSuggestion = useCallback((s: string) => {
    const userMsg: Message = { role: 'user', text: s };
    const currentMsgs = [...messages, userMsg];
    setMessages(currentMsgs);
    setTimeout(() => reply(s, currentMsgs), 150);
  }, [messages, reply]);

  const deleteConversation = (id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveHistory(updated);
      if (id === activeId) {
        if (updated.length > 0) {
          setActiveId(updated[0].id);
          setMessages(updated[0].messages);
        } else {
          startNew();
        }
      }
      return updated;
    });
  };

  const SUGGESTIONS = [
    'دار الشباب في بجاية', 'robotics', 'Akbou', 'sport', 'science', 'musique'
  ];

  return (
    <div className="relative flex flex-col h-full max-w-2xl mx-auto overflow-hidden">
      {/* History panel (slide-over) */}
      {showHistory && (
        <HistoryPanel
          conversations={conversations}
          active={activeId}
          onSelect={id => {
            const c = conversations.find(x => x.id === id);
            if (c) { setActiveId(id); setMessages(c.messages); }
          }}
          onDelete={deleteConversation}
          onNew={() => { startNew(); setShowHistory(false); }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Forsati" width={28} height={28} className="rounded-lg" />
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">
              {t('nav', 'assistant')}
            </h1>
            <p className="text-[10px] text-textMuted">Forsati · Algeria</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(v => !v)}
            title={t('assistant', 'history')}
            className="p-2 rounded-lg text-textMuted hover:text-white hover:bg-background transition-colors"
          >
            <Clock size={16} />
          </button>
          <button
            onClick={startNew}
            title={t('assistant', 'newChat')}
            className="p-2 rounded-lg text-textMuted hover:text-white hover:bg-background transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-surface border border-border' : 'bg-primary/10 text-primary'
            }`}>
              {msg.role === 'user' ? <User size={13} /> : <Sparkles size={13} />}
            </div>
            <div className={`max-w-[82%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-black font-medium rounded-tr-sm'
                  : 'bg-surface border border-border text-gray-200 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
              {msg.results && (
                <div className="w-full space-y-2">
                  {msg.results.map(raw => (
                    <ResultCard key={raw.id} raw={raw} lang={lang} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions — on first message only */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="px-3 py-1 bg-surface border border-border rounded-full text-xs text-textMuted hover:text-white hover:border-primary/40 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="p-3 border-t border-border shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('assistant', 'placeholder')}
            className={`
              flex-1 bg-surface border border-border rounded-full py-2.5 text-sm text-white
              outline-none focus:border-primary transition-colors
              ${isRtl ? 'pr-4 pl-3' : 'pl-4 pr-3'}
            `}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-full bg-primary text-black disabled:opacity-40 hover:brightness-110 transition-all shrink-0"
          >
            <Send size={15} className={isRtl ? 'rotate-180' : ''} />
          </button>
        </form>
      </div>
    </div>
  );
}