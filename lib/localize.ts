/**
 * Data localization helpers.
 * 
 * The ODEJ dataset provides:
 *   - name_ar (Arabic) — always present
 *   - name_fr — may be null (most institutions only have Arabic names)
 *   - commune_ar / commune_fr
 *   - category_name_ar / category_name_fr
 *
 * Rules:
 *   - Arabic → use *_ar fields
 *   - French → use *_fr, fall back to *_ar if null
 *   - English → use *_fr (closest available), fall back to *_ar
 *   - Kabyle → use *_ar (closest available)
 *
 * Never expose raw JSON field names to the UI.
 */

export type Lang = 'ar' | 'fr' | 'en' | 'kab';

export interface RawInst {
  id: string;
  name_ar: string;
  name_fr?: string | null;
  commune_ar: string;
  commune_fr?: string | null;
  wilaya?: string;
  category: string;
  category_name_ar?: string;
  category_name_fr?: string;
  activity_tags?: string[];
  phone?: string | null;
  email?: string | null;
}

export interface LocalizedInst {
  id: string;
  name: string;
  commune: string;
  wilaya: string;
  categoryId: string;
  categoryName: string;
  activityTags: string[];
  phone: string | null;
  email: string | null;
}

export function localize(inst: RawInst, lang: Lang): LocalizedInst {
  const useAr = lang === 'ar' || lang === 'kab';

  const commune = useAr
    ? inst.commune_ar
    : (inst.commune_fr || inst.commune_ar);
  const categoryName = useAr
    ? (inst.category_name_ar || inst.category)
    : (inst.category_name_fr || inst.category);

  // The ODEJ dataset never carries a French/English institution name
  // (`name_fr` is always null) — the Arabic name is literally
  // "<category_ar> <commune_ar>". So for non-Arabic languages we faithfully
  // reconstruct the same shape from the localized category + commune
  // ("Maison de Jeunes Ait Rzine") instead of leaking the Arabic name.
  const name = useAr
    ? inst.name_ar
    : (inst.name_fr || `${categoryName} ${commune}`.trim());

  return {
    id: inst.id,
    name,
    commune,
    wilaya: inst.wilaya ?? 'Bejaia',
    categoryId: inst.category,
    categoryName,
    activityTags: inst.activity_tags ?? [],
    phone: inst.phone ?? null,
    email: inst.email ?? null,
  };
}

/** Localize an array of institutions efficiently in one pass */
export function localizeAll(insts: RawInst[], lang: Lang): LocalizedInst[] {
  return insts.map(i => localize(i, lang));
}
