'use client';
import { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ODEJ_DATA } from '@/lib/data';
import type { RawInst } from '@/lib/localize';
import { getEvents, getJoinedEventIds, type Event } from '@/lib/events';
import { EventCard } from '@/components/EventCard';
import { InstitutionCard } from '@/components/InstitutionCard';
import { recommendForUser, type ScoredInstitution } from '@/lib/recommend';

const RAW_INSTS = ODEJ_DATA.institutions as unknown as RawInst[];

// ─── Section header ────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1.5 h-5 bg-primary rounded-full" />
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, preferences } = useAuth();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [loadingJoined, setLoadingJoined] = useState(true);

  useEffect(() => {
    // EcoHack Optimization: Load only what is required
    getEvents().then(data => {
      setEvents(data);
      setLoadingEvents(false);

      // Resolve which of those events the user has joined (point-reads only).
      if (user) {
        getJoinedEventIds(user.uid, data)
          .then(setJoinedIds)
          .finally(() => setLoadingJoined(false));
      } else {
        setLoadingJoined(false);
      }
    });
  }, [user]);

  // Events the user has registered for
  const joinedEvents = useMemo<Event[]>(
    () => events.filter(ev => joinedIds.has(ev.id)),
    [events, joinedIds]
  );

  // Filter Nearby Institutions based on Wilaya or just general recommendation
  const nearbyInstitutions = useMemo<ScoredInstitution[]>(() => {
    if (!preferences) return [];
    // Reuse recommend logic which boosts by Wilaya
    const scored = recommendForUser(RAW_INSTS, preferences, 8);
    // Filter out ones that were ONLY recommended for interests if we specifically want "Nearby"
    // But recommendForUser already sorts by relevance, prioritizing wilaya.
    return scored;
  }, [preferences]);

  // Sort/Filter Recommended Events based on user interests
  const recommendedEvents = useMemo<Event[]>(() => {
    if (!events.length || !preferences) return [];
    
    // Simple mock recommendation logic for events:
    // Match event category to user interests, or wilaya.
    return events.filter(ev => {
      if (preferences.wilaya && ev.wilaya.toLowerCase() === preferences.wilaya.toLowerCase()) return true;
      if (preferences.interests.includes(ev.category)) return true;
      return false;
    }).slice(0, 4); // Keep lightweight
  }, [events, preferences]);

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-10">

      {/* Joined Events Section — only shown once we know the user joined something */}
      {(loadingJoined || joinedEvents.length > 0) && (
        <Section title={t('feed', 'joinedEvents')}>
          {loadingJoined ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-surface/50 border border-border rounded-xl h-40 animate-pulse" />
            ))
          ) : (
            joinedEvents.map(ev => <EventCard key={ev.id} event={ev} />)
          )}
        </Section>
      )}

      {/* Recommended Events Section */}
      <Section title={t('feed', 'recommendedEvents')}>
        {loadingEvents ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface/50 border border-border rounded-xl h-40 animate-pulse" />
          ))
        ) : recommendedEvents.length > 0 ? (
          recommendedEvents.map(ev => (
            <EventCard key={ev.id} event={ev} />
          ))
        ) : events.slice(0, 4).map(ev => (
           // Fallback to latest events if no matches
          <EventCard key={ev.id} event={ev} />
        ))}
      </Section>

      {/* Nearby Institutions Section */}
      <Section title={t('feed', 'nearbyInstitutions')}>
        {nearbyInstitutions.length > 0 ? (
          nearbyInstitutions.map(scored => (
            <InstitutionCard
              key={scored.inst.id}
              raw={scored.inst}
              reasons={scored.reasons}
            />
          ))
        ) : (
          <p className="text-textMuted text-sm">{t('feed', 'noInstitutions')}</p>
        )}
      </Section>
      
    </div>
  );
}