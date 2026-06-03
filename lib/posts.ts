import { db } from './firebase';
import {
  collection, addDoc, doc, getDoc, getDocs, setDoc, deleteDoc,
  query, where, orderBy, limit,
} from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// Community Feed — lightweight engagement (NO comments / chat / followers).
// Posts are authored ONLY by admins/ODEJ. Regular users may react and save.
// ─────────────────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  title: string;
  description: string;        // short summary (card)
  content?: string;           // optional full body (detail page)
  category: string;           // maps to interest tags for recommendations
  image?: string | null;      // optional cover image URL
  relatedEventId?: string | null;
  createdAt: string;          // ISO
  createdBy: string;          // admin email/uid
  // Admin chooses per post whether users may comment. Undefined = allowed
  // (back-compat for posts created before this field existed).
  commentsEnabled?: boolean;
  // Optional per-language overrides (seeded posts ship all languages).
  translations?: Partial<Record<string, { title?: string; description?: string; content?: string }>>;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;          // ISO
}

/** Whether comments are allowed on a post (default: allowed). */
export const commentsAllowed = (post: Post): boolean => post.commentsEnabled !== false;

/** Pick title/description/content for the active language (falls back to base). */
export function localizePost(post: Post, lang: string): { title: string; description: string; content: string } {
  const tr = post.translations?.[lang];
  return {
    title: tr?.title || post.title,
    description: tr?.description || post.description,
    content: tr?.content || post.content || '',
  };
}

export type Reaction = 'like' | 'not_interested';

export interface PostReaction {
  userId: string;
  postId: string;
  reaction: Reaction;
}

export interface PostEngagement {
  likes: number;
  notInterested: number;
  saved: number;
  rate: number; // 0–100
}

const reactionDocId = (userId: string, postId: string) => `${userId}_${postId}`;
const savedDocId = (userId: string, postId: string) => `${userId}_${postId}`;

// ── Authoring (admin) ────────────────────────────────────────────────────────
export async function createPost(
  data: Omit<Post, 'id' | 'createdAt'>,
): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'posts'), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

// ── Seed posts ───────────────────────────────────────────────────────────────
// Always-present sample posts so the Community Feed is never empty (mirrors the
// demo-events approach). Real posts created via the admin panel sit alongside
// these. Each ships full translations so it reads natively in every language.
const HOUR = 3600_000;
function buildDemoPosts(): Post[] {
  const now = Date.now();
  const iso = (h: number) => new Date(now - h * HOUR).toISOString();
  return [
    {
      id: 'demo-post-robotics',
      title: '🤖 Robotics Workshop Registration Open',
      description: 'Registration is now open for the hands-on robotics workshop in Akbou. Limited to 25 seats — reserve yours!',
      content: 'Build and program your first Arduino robot over an intensive day with our mentors. No prior experience required — just curiosity. Bring a laptop if you have one.',
      category: 'robotics',
      image: null,
      relatedEventId: 'demo-event-robotics-akbou',
      createdAt: iso(2),
      createdBy: 'ODEJ',
      translations: {
        ar: { title: '🤖 فتح التسجيل في ورشة الروبوتيك', description: 'التسجيل مفتوح الآن في ورشة الروبوتيك العملية بأقبو. الأماكن محدودة بـ 25 مقعدًا — احجز مكانك!', content: 'ابنِ وبرمج أول روبوت Arduino خاص بك خلال يوم مكثف مع مرشدينا. لا حاجة لخبرة سابقة — فقط الفضول. أحضر حاسوبك المحمول إن وُجد.' },
        fr: { title: "🤖 Inscriptions ouvertes — Atelier Robotique", description: "Les inscriptions sont ouvertes pour l'atelier de robotique pratique à Akbou. Limité à 25 places — réservez la vôtre !", content: "Construisez et programmez votre premier robot Arduino lors d'une journée intensive avec nos mentors. Aucune expérience requise, juste de la curiosité." },
        kab: { title: '🤖 Ldin ijerriden i tezwart n Robotik', description: 'Ldin ijerriden i tezwart tussnant n robotik deg Akbu. Ɣur-s kan 25 yimukan — ḥrez amkan-ik!', content: "Bnu syen sneɣmeḍ arudino-inek amezwaru deg yiwen wass yid imceṭṭa-nneɣ." },
      },
    },
    {
      id: 'demo-post-environment',
      title: '🌱 Bejaia Coastline Clean-up Campaign',
      description: 'Join hundreds of young volunteers to clean our beaches this weekend. Gloves and bags provided.',
      content: 'As part of our environmental commitment, ODEJ Bejaia is organizing a large coastline clean-up. Meet at the Tichy main beach at 9 AM. Reusable water bottles encouraged — let\'s keep it green!',
      category: 'environment',
      image: null,
      relatedEventId: null,
      createdAt: iso(8),
      createdBy: 'ODEJ',
      translations: {
        ar: { title: '🌱 حملة تنظيف ساحل بجاية', description: 'انضم إلى مئات المتطوعين الشباب لتنظيف شواطئنا نهاية هذا الأسبوع. القفازات والأكياس متوفرة.', content: 'في إطار التزامنا البيئي، تنظّم أوديج بجاية حملة كبيرة لتنظيف الساحل. الموعد في شاطئ تيشي الرئيسي على الساعة 9 صباحًا. نشجع على إحضار قارورات ماء قابلة لإعادة الاستخدام — لنحافظ على البيئة!' },
        fr: { title: '🌱 Campagne de nettoyage du littoral de Béjaïa', description: 'Rejoignez des centaines de jeunes bénévoles pour nettoyer nos plages ce week-end. Gants et sacs fournis.', content: "Dans le cadre de notre engagement environnemental, l'ODEJ Béjaïa organise un grand nettoyage du littoral. Rendez-vous à la plage principale de Tichy à 9h. Bouteilles réutilisables encouragées !" },
        kab: { title: '🌱 Takcampant n usizdeg n lqbayel n Bgayet', description: 'Ddu yid n meyat n imutiwen ilemẓiyen i usizdeg n yiftasen-nneɣ deg dduṛt-a. Ileɣwa d yiqacwalen ttwafkan.', content: "Deg uktazel-nneɣ n twennaḍt, ODEJ Bgayet tessuddus asizdeg ameqqran n lqbala. Tamlilit deg lqbala n Tici ɣef 9." },
      },
    },
    {
      id: 'demo-post-competition',
      title: '🏆 National Youth Science Competition',
      description: 'Submit your scientific project and compete with the brightest young minds across Algeria. Prizes for the top 3 teams.',
      content: 'Teams of 2–4 may submit an original scientific project in technology, environment, or health. Finalists present in Algiers. Registration deadline approaches — gather your team!',
      category: 'science',
      image: null,
      relatedEventId: 'demo-event-science-akbou',
      createdAt: iso(26),
      createdBy: 'ODEJ',
      translations: {
        ar: { title: '🏆 المسابقة الوطنية للعلوم للشباب', description: 'قدّم مشروعك العلمي ونافس ألمع العقول الشابة في الجزائر. جوائز لأفضل 3 فرق.', content: 'يمكن لفرق من 2 إلى 4 أعضاء تقديم مشروع علمي أصلي في التكنولوجيا أو البيئة أو الصحة. يقدّم المتأهلون عروضهم في الجزائر العاصمة. اقترب أجل التسجيل — اجمع فريقك!' },
        fr: { title: '🏆 Compétition Nationale des Sciences', description: 'Soumettez votre projet scientifique et affrontez les esprits les plus brillants d\'Algérie. Prix pour les 3 meilleures équipes.', content: "Des équipes de 2 à 4 peuvent soumettre un projet scientifique original en technologie, environnement ou santé. Les finalistes présentent à Alger. La date limite approche — formez votre équipe !" },
        kab: { title: '🏆 Anmenyi Aɣelnaw n Tussna i Ilemẓiyen', description: 'Azen asenfar-ik asnan syen nnaɣ d yixfawen yufraren n Lezzayer. Arrazen i 3 igrawen ufraren.', content: "Igrawen n 2 ɣer 4 zemren ad aznen asenfar asnan amezwaru." },
      },
    },
    {
      id: 'demo-post-training',
      title: '🎓 Free Digital Skills Training',
      description: 'A free 4-week program covering web basics, office tools, and online safety for youth aged 16–30.',
      content: 'Boost your employability with practical digital skills. Sessions are held at the Youth House and certified on completion. Seats are limited and assigned first-come, first-served.',
      category: 'digital',
      image: null,
      relatedEventId: null,
      createdAt: iso(50),
      createdBy: 'ODEJ',
      translations: {
        ar: { title: '🎓 تكوين مجاني في المهارات الرقمية', description: 'برنامج مجاني لمدة 4 أسابيع يغطي أساسيات الويب وأدوات المكتب والأمان على الإنترنت للشباب من 16 إلى 30 سنة.', content: 'عزّز قابليتك للتوظيف بمهارات رقمية عملية. تُقام الحصص في دار الشباب وتُسلَّم شهادة عند الإتمام. الأماكن محدودة وتُمنح حسب أسبقية التسجيل.' },
        fr: { title: '🎓 Formation gratuite aux compétences numériques', description: 'Un programme gratuit de 4 semaines couvrant les bases du web, les outils bureautiques et la sécurité en ligne pour les 16–30 ans.', content: "Boostez votre employabilité avec des compétences numériques pratiques. Les sessions ont lieu à la Maison de Jeunes, avec certificat à la clé. Places limitées." },
        kab: { title: '🎓 Aseɣti baṭel n tezmar timḍinin', description: 'Ahil baṭel n 4 dduṛtin i lsas n web, ifecka n lbiru d tɣellist srid i ilemẓiyen n 16–30 iseggasen.', content: "Senγ tazmert-ik n uxeddim s tezmar timḍinin tilmimin. Tiɣimiyin deg Wexxam n Ilemẓiyen." },
      },
    },
    {
      id: 'demo-post-initiative',
      title: '💡 Call for Youth Initiatives 2026',
      description: 'Have an idea that helps your community? Pitch it to ODEJ and get mentorship and funding to make it real.',
      content: 'We support youth-led initiatives in culture, environment, technology and solidarity. Submit a one-page proposal; selected projects receive guidance and a small grant.',
      category: 'volunteering',
      image: null,
      relatedEventId: null,
      createdAt: iso(72),
      createdBy: 'ODEJ',
      translations: {
        ar: { title: '💡 دعوة لمبادرات الشباب 2026', description: 'هل لديك فكرة تساعد مجتمعك؟ اعرضها على أوديج واحصل على المرافقة والتمويل لتحقيقها.', content: 'ندعم المبادرات التي يقودها الشباب في الثقافة والبيئة والتكنولوجيا والتضامن. قدّم مقترحًا من صفحة واحدة؛ تحصل المشاريع المختارة على المرافقة ومنحة صغيرة.' },
        fr: { title: '💡 Appel à initiatives jeunes 2026', description: 'Vous avez une idée qui aide votre communauté ? Présentez-la à l\'ODEJ et obtenez mentorat et financement pour la concrétiser.', content: "Nous soutenons les initiatives portées par les jeunes en culture, environnement, technologie et solidarité. Soumettez une proposition d'une page ; les projets retenus reçoivent un accompagnement et une petite subvention." },
        kab: { title: '💡 Asuter n tigawin n ilemẓiyen 2026', description: 'Ɣur-k tikti i yett ɛawanen tamɣiwant-ik? Ssken-itt i ODEJ syen aɣ-d tawiḍ amɛiwen d wadrim.', content: "Nessefrag tigawin n ilemẓiyen deg yidles, twennaḍt, tatiknulujit d temlilt." },
      },
    },
  ];
}

// ── Reading ──────────────────────────────────────────────────────────────────
export async function getPosts(): Promise<Post[]> {
  let remote: Post[] = [];
  try {
    const snap = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc')));
    remote = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
  } catch (error) {
    console.error('Error fetching posts, serving demo posts only:', error);
  }
  // Merge demo posts; Firestore wins on id collisions, newest first.
  const seen = new Set(remote.map(p => p.id));
  const merged = [...remote, ...buildDemoPosts().filter(p => !seen.has(p.id))];
  return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const snap = await getDoc(doc(db, 'posts', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() } as Post;
  } catch (error) {
    console.error('Error fetching post, checking demo posts:', error);
  }
  return buildDemoPosts().find(p => p.id === id) ?? null;
}

// ── User signals ─────────────────────────────────────────────────────────────
/** Map of postId → reaction for the current user. */
export async function getUserReactions(userId: string): Promise<Record<string, Reaction>> {
  try {
    const snap = await getDocs(query(collection(db, 'post_reactions'), where('userId', '==', userId)));
    const out: Record<string, Reaction> = {};
    snap.docs.forEach(d => { const r = d.data() as PostReaction; out[r.postId] = r.reaction; });
    return out;
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return {};
  }
}

/** Set of saved postIds for the current user. */
export async function getUserSavedPosts(userId: string): Promise<Set<string>> {
  try {
    const snap = await getDocs(query(collection(db, 'saved_posts'), where('userId', '==', userId)));
    return new Set(snap.docs.map(d => (d.data() as { postId: string }).postId));
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return new Set();
  }
}

/**
 * Toggle a reaction. Clicking the same reaction again clears it; clicking the
 * other switches. `current` is the user's existing reaction (the caller already
 * knows it), so no pre-read is needed. Returns the resulting reaction (or null).
 */
export async function setReaction(
  userId: string, postId: string, reaction: Reaction, current: Reaction | null,
): Promise<Reaction | null> {
  const ref = doc(db, 'post_reactions', reactionDocId(userId, postId));
  if (current === reaction) {
    await deleteDoc(ref);
    return null;
  }
  await setDoc(ref, { userId, postId, reaction });
  return reaction;
}

/** Toggle saving a post. `currentlySaved` is supplied by the caller (no read). */
export async function toggleSavePost(
  userId: string, postId: string, currentlySaved: boolean,
): Promise<boolean> {
  const ref = doc(db, 'saved_posts', savedDocId(userId, postId));
  if (currentlySaved) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { userId, postId, savedAt: new Date().toISOString() });
  return true;
}

// ── Comments (lightweight) ───────────────────────────────────────────────────
// One flat `comments` collection, loaded only on the post page with a capped
// query. No realtime listeners, no edits, no threads — keeps it eco-light.
const COMMENTS_LIMIT = 100;

/** Fetch a post's comments (single `where` + `limit`, sorted in memory → no index). */
export async function getComments(postId: string): Promise<PostComment[]> {
  try {
    const snap = await getDocs(query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      limit(COMMENTS_LIMIT),
    ));
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as PostComment))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)); // oldest → newest
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

/** Add a comment. Returns the stored comment, or null on failure. */
export async function addComment(
  postId: string, userId: string, userName: string, text: string,
): Promise<PostComment | null> {
  const body = text.trim();
  if (!body) return null;
  try {
    const record = {
      postId,
      userId,
      userName: userName || 'User',
      text: body.slice(0, 500),
      createdAt: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, 'comments'), record);
    return { id: ref.id, ...record };
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}

/** Delete a comment (the author or an admin). */
export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'comments', commentId));
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
}

// ── Admin analytics ──────────────────────────────────────────────────────────
/** Aggregate engagement for a single post (admin only — needs broad read). */
export async function getPostEngagement(postId: string): Promise<PostEngagement> {
  const [reactionsSnap, savedSnap] = await Promise.all([
    getDocs(query(collection(db, 'post_reactions'), where('postId', '==', postId))),
    getDocs(query(collection(db, 'saved_posts'), where('postId', '==', postId))),
  ]);
  let likes = 0, notInterested = 0;
  reactionsSnap.docs.forEach(d => {
    const r = (d.data() as PostReaction).reaction;
    if (r === 'like') likes++; else if (r === 'not_interested') notInterested++;
  });
  const saved = savedSnap.size;
  const denom = likes + notInterested;
  const rate = denom === 0 ? 0 : Math.round((likes / denom) * 100);
  return { likes, notInterested, saved, rate };
}

// ── Recommendation ranking ───────────────────────────────────────────────────
/**
 * Lightweight, deterministic post ranking. Learns from favorite topics + the
 * user's like / not-interested signals. Nothing is hidden — a "not interested"
 * post simply SINKS to the bottom (so the user still sees their click took
 * effect) and its category is down-weighted; liked/favorite categories rise.
 */
export function rankPosts(
  posts: Post[],
  opts: { interests?: string[]; reactions?: Record<string, Reaction> },
): Post[] {
  const interests = new Set(opts.interests ?? []);
  const reactions = opts.reactions ?? {};

  // Derive liked / disliked categories from prior reactions.
  const likedCats = new Set<string>();
  const dislikedCats = new Set<string>();
  for (const p of posts) {
    const r = reactions[p.id];
    if (r === 'like') likedCats.add(p.category);
    else if (r === 'not_interested') dislikedCats.add(p.category);
  }

  const score = (p: Post): number => {
    let s = 0;
    const r = reactions[p.id];
    if (interests.has(p.category)) s += 10;
    if (likedCats.has(p.category)) s += 6;
    if (dislikedCats.has(p.category)) s -= 8;
    if (r === 'like') s += 12;
    // Push this specific disliked post far down — but keep it visible.
    if (r === 'not_interested') s -= 100;
    // Mild recency tiebreaker (newer first).
    s += Math.max(0, 5 - daysOld(p.createdAt) * 0.1);
    return s;
  };

  // No filtering — every post stays in the feed; order reflects the signals.
  return posts
    .map(p => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s || b.p.createdAt.localeCompare(a.p.createdAt))
    .map(x => x.p);
}

function daysOld(iso: string): number {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 0;
  return (Date.now() - t) / 86_400_000;
}
