/**
 * Deterministic scoring-based recommendation engine.
 * No AI, no API calls, no external dependencies.
 * Pure function — runs in < 1ms on the full ODEJ dataset.
 */

import type { RawInst } from './localize';

export type { RawInst };

export interface ScoredInstitution {
  inst: RawInst;
  score: number;
  reasons: string[]; // tag keys or '__wilaya__'
}

interface UserProfile {
  wilaya?: string;
  wilayaCode?: string;
  interests?: string[];
}

// Category → interest tag mappings
const CATEGORY_INTEREST_MAP: Record<string, string[]> = {
  youth_house:        ['culture', 'music', 'art', 'theatre', 'debate', 'volunteering', 'sport', 'support'],
  sports_complex:     ['sport'],
  youth_hostel:       ['accommodation', 'exchange', 'culture'],
  science_center:     ['tech', 'ai', 'robotics', 'science', 'digital', 'it'],
  multiservice_hall:  ['art', 'digital', 'culture', 'theatre'],
  youth_camp:         ['environment', 'culture', 'volunteering'],
};

export function scoreInstitution(inst: RawInst, profile: UserProfile): ScoredInstitution {
  let score = 0;
  const reasons: string[] = [];
  const interests = profile.interests ?? [];
  const tags = inst.activity_tags ?? [];
  const categoryTags = CATEGORY_INTEREST_MAP[inst.category] ?? [];
  const allTags = Array.from(new Set([...tags, ...categoryTags]));

  // +10 per matching interest
  for (const interest of interests) {
    if (allTags.includes(interest)) {
      score += 10;
      reasons.push(interest);
    }
  }

  // +10 wilaya match
  const instWilaya  = (inst.wilaya ?? '').toLowerCase();
  const userWilaya  = (profile.wilaya ?? '').toLowerCase();
  if (userWilaya && (instWilaya === userWilaya || instWilaya.includes('bejaia'))) {
    score += 10;
    reasons.push('__wilaya__');
  }

  // Small bonus for active institutions with contact info
  if (inst.phone) score += 1;
  if (inst.email) score += 1;

  return { inst, score, reasons };
}

export function recommendForUser(
  institutions: RawInst[],
  profile: UserProfile,
  limit = 10,
): ScoredInstitution[] {
  return institutions
    .map(inst => scoreInstitution(inst, profile))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getByCategory(institutions: RawInst[], category: string, limit = 6): RawInst[] {
  return institutions.filter(i => i.category === category).slice(0, limit);
}
