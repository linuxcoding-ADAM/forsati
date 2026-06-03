import { db } from './firebase';
import {
  collection, doc, getDoc, getDocs, query, orderBy, setDoc,
  where, limit, updateDoc, increment,
} from 'firebase/firestore';

// Points granted to a user once their attendance is confirmed by a scan.
// NB: points are NEVER granted at registration time — only after attendance.
export const POINTS_PER_ATTENDANCE = 50;

export interface Event {
  id: string;
  title: string;
  description: string;
  institutionId: string;
  wilaya: string;
  category: string;
  date: string; // ISO String
  status: 'open' | 'closed';
  registrationFields: string[];
  availableSeats?: number;
  // Optional per-language overrides for title/description. When absent the base
  // (English) strings are used. Lets baked-in / seeded events read natively.
  translations?: Partial<Record<string, { title?: string; description?: string }>>;
}

/** Pick the title/description for the active language (falls back to base). */
export function localizeEvent(event: Event, lang: string): { title: string; description: string } {
  const tr = event.translations?.[lang];
  return {
    title: tr?.title || event.title,
    description: tr?.description || event.description,
  };
}

export interface EventRegistration {
  id?: string;
  userId: string;
  eventId: string;
  answers: Record<string, string>;
  submittedAt: string;
  // Digital ticket — the QR encodes ONLY this opaque, unguessable id.
  ticketId: string;
  // Attendance is set true only by the admin scanner, never at registration.
  attended: boolean;
  attendedAt?: string | null;
  // True once attendance points have been credited (prevents double-credit).
  pointsAwarded: boolean;
}

// Result of an admin scan attempt.
export type AttendanceResult =
  | { status: 'valid'; registration: EventRegistration; points: number }
  | { status: 'duplicate'; registration: EventRegistration }
  | { status: 'invalid' }
  | { status: 'error'; message: string };

// ─────────────────────────────────────────────────────────────────────────────
// Demo events (Req #6) — the four Akbou Youth House events. These are baked in
// as a fallback so they ALWAYS exist for testing the registration flow, even
// before /seed has been run or if Firestore is unreachable. `/seed` writes the
// exact same document IDs, so a seeded copy transparently takes precedence.
// ─────────────────────────────────────────────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000;

function buildDemoEvents(): Event[] {
  const now = Date.now();
  return [
    {
      id: 'demo-event-robotics-akbou',
      title: 'Robotics Workshop Akbou',
      description:
        'Join us for an intensive hands-on robotics workshop. Learn how to build and program your first Arduino robot. Perfect for beginners and enthusiasts alike.',
      institutionId: 'yh-003', // Akbou Youth House
      wilaya: 'Bejaia',
      category: 'robotics',
      date: new Date(now + 5 * DAY).toISOString(),
      status: 'open',
      registrationFields: ['name', 'email', 'phone', 'id_number', 'university'],
      availableSeats: 25,
      translations: {
        ar: { title: 'ورشة الروبوتيك أقبو', description: 'انضم إلينا في ورشة عملية مكثفة في الروبوتيك. تعلّم كيفية بناء وبرمجة أول روبوت Arduino خاص بك. مثالية للمبتدئين والهواة على حد سواء.' },
        fr: { title: 'Atelier Robotique Akbou', description: "Rejoignez-nous pour un atelier pratique et intensif de robotique. Apprenez à construire et programmer votre premier robot Arduino. Parfait pour les débutants et les passionnés." },
        kab: { title: 'Tazwart n Robotik Akbu', description: "Ddu yid-nneɣ ɣer tezwart tussnant n robotik. Lmed amek ara tebnuḍ syen ad tessneɣmeḍ arudino-inek amezwaru." },
      },
    },
    {
      id: 'demo-event-ai-akbou',
      title: 'Artificial Intelligence Discovery Day',
      description:
        'An exciting discovery day exploring the fundamentals of Artificial Intelligence, ChatGPT, and how AI is shaping the future of technology and society.',
      institutionId: 'yh-003',
      wilaya: 'Bejaia',
      category: 'ai',
      date: new Date(now + 10 * DAY).toISOString(),
      status: 'open',
      registrationFields: ['name', 'email', 'phone', 'age'],
      availableSeats: 50,
      translations: {
        ar: { title: 'يوم اكتشاف الذكاء الاصطناعي', description: 'يوم اكتشاف مثير لاستكشاف أساسيات الذكاء الاصطناعي، ChatGPT، وكيف يشكّل الذكاء الاصطناعي مستقبل التكنولوجيا والمجتمع.' },
        fr: { title: "Journée Découverte de l'Intelligence Artificielle", description: "Une journée de découverte passionnante pour explorer les fondements de l'intelligence artificielle, ChatGPT, et comment l'IA façonne l'avenir de la technologie et de la société." },
        kab: { title: 'Ass n Tagnawt Tafalsaft', description: "Ass n unadi yecbeḥ i wakken ad tessneḍ lsas n tegnawt tafalsaft d wamek ara d-tawi ddunit n uzekka." },
      },
    },
    {
      id: 'demo-event-entrepreneurship-akbou',
      title: 'Youth Entrepreneurship Camp',
      description:
        'A 3-day boot camp designed to help young visionaries turn their ideas into successful startups. Learn pitching, business models, and meet local investors.',
      institutionId: 'yh-003',
      wilaya: 'Bejaia',
      category: 'entrepreneurship',
      date: new Date(now + 15 * DAY).toISOString(),
      status: 'open',
      registrationFields: ['name', 'email', 'phone'],
      availableSeats: 30,
      translations: {
        ar: { title: 'مخيم ريادة الأعمال للشباب', description: 'معسكر تدريبي لمدة 3 أيام مصمم لمساعدة أصحاب الرؤى الشباب على تحويل أفكارهم إلى شركات ناشئة ناجحة. تعلّم العرض ونماذج الأعمال والتقِ بالمستثمرين المحليين.' },
        fr: { title: "Camp d'Entrepreneuriat des Jeunes", description: "Un bootcamp de 3 jours conçu pour aider les jeunes visionnaires à transformer leurs idées en startups prospères. Apprenez le pitch, les modèles économiques et rencontrez des investisseurs locaux." },
        kab: { title: 'Anezruf n Tkebbaniyin i Ilemẓiyen', description: "Anezruf n 3 wussan i wakken ad nɛiwen ilemẓiyen ad rren tikta-nsen d tikebbaniyin yedduklen." },
      },
    },
    {
      id: 'demo-event-science-akbou',
      title: 'Scientific Innovation Fair',
      description:
        'Showcasing the brightest minds in Akbou. Come and see local inventions, scientific experiments, and network with passionate researchers and students.',
      institutionId: 'yh-003',
      wilaya: 'Bejaia',
      category: 'science',
      date: new Date(now + 20 * DAY).toISOString(),
      status: 'open',
      registrationFields: ['name', 'email', 'phone', 'age', 'city'],
      availableSeats: 100,
      translations: {
        ar: { title: 'معرض الابتكار العلمي', description: 'عرض لألمع العقول في أقبو. تعال وشاهد الاختراعات المحلية والتجارب العلمية وتواصل مع الباحثين والطلاب الشغوفين.' },
        fr: { title: "Salon de l'Innovation Scientifique", description: "Une vitrine des esprits les plus brillants d'Akbou. Venez voir les inventions locales, les expériences scientifiques et échanger avec des chercheurs et étudiants passionnés." },
        kab: { title: 'Tamɣiwant n Usnulfu Amassan', description: "Askan n yixfawen yufraren n Akbu. As-d ad twaliḍ isnulfuyen idiganen d tirmitin tussnanin." },
      },
    },
  ];
}

/** Merge Firestore events with the demo set, Firestore winning on id collisions. */
function withDemoEvents(remote: Event[]): Event[] {
  const seen = new Set(remote.map(e => e.id));
  const fallback = buildDemoEvents().filter(e => !seen.has(e.id));
  return [...remote, ...fallback];
}

// Fetch all events (Firestore + always-present demo events)
export async function getEvents(): Promise<Event[]> {
  try {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const snap = await getDocs(q);
    const remote = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Event & { published?: boolean }))
      // Drafts (published === false) are hidden from the public feed.
      .filter(e => e.published !== false);
    return withDemoEvents(remote);
  } catch (error) {
    console.error('Error fetching events, serving demo events:', error);
    return buildDemoEvents();
  }
}

// Fetch a single event (falls back to the demo set when not in Firestore)
export async function getEvent(id: string): Promise<Event | null> {
  try {
    const snap = await getDoc(doc(db, 'events', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() } as Event;
  } catch (error) {
    console.error('Error fetching event, checking demo events:', error);
  }
  return buildDemoEvents().find(e => e.id === id) ?? null;
}

// Deterministic registration document id — one registration per user/event.
// This is what makes duplicate registrations impossible at the storage level.
function registrationId(userId: string, eventId: string): string {
  return `${userId}_${eventId}`;
}

// Fetch registration status for a user and event
export async function getUserRegistration(userId: string, eventId: string): Promise<EventRegistration | null> {
  try {
    const snap = await getDoc(doc(db, 'registrations', registrationId(userId, eventId)));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as EventRegistration;
  } catch (error) {
    console.error('Error checking registration:', error);
    return null;
  }
}

/**
 * Which of the given events has this user already joined?
 * Probes each event by its deterministic registration doc id (`uid_eventId`),
 * so it works with per-document security rules — no broad `list` query needed.
 * The event set is small, so the parallel point-reads stay cheap.
 */
export async function getJoinedEventIds(userId: string, events: Event[]): Promise<Set<string>> {
  const results = await Promise.all(
    events.map(ev => getUserRegistration(userId, ev.id).then(reg => (reg ? ev.id : null)))
  );
  return new Set(results.filter((id): id is string => id !== null));
}

// Generate an opaque, unguessable ticket identifier. The QR encodes only this.
function newTicketId(): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `TKT-${rand}`;
}

// Submit registration. Uses a deterministic document id so re-submitting the
// same (user, event) overwrites rather than creating a duplicate. Returns the
// stored registration (including its ticket) so the UI can show the ticket.
// IMPORTANT: registering grants NO points — it only mints an unused ticket.
export async function submitRegistration(
  registration: Pick<EventRegistration, 'userId' | 'eventId' | 'answers'>
): Promise<EventRegistration | null> {
  try {
    const ref = doc(db, 'registrations', registrationId(registration.userId, registration.eventId));

    // Idempotent: if already registered, return the existing ticket unchanged.
    const existing = await getDoc(ref);
    if (existing.exists()) {
      console.warn('Duplicate registration blocked for', ref.id);
      return { id: existing.id, ...existing.data() } as EventRegistration;
    }

    const record: EventRegistration = {
      userId: registration.userId,
      eventId: registration.eventId,
      answers: registration.answers,
      submittedAt: new Date().toISOString(),
      ticketId: newTicketId(),
      attended: false,
      attendedAt: null,
      pointsAwarded: false,
    };

    await setDoc(ref, record);
    return { id: ref.id, ...record };
  } catch (error) {
    console.error('Error submitting registration:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Attendance (admin scanner)
// ─────────────────────────────────────────────────────────────────────────────

/** Find a registration by its ticket id. Admin-only by security rules. */
export async function getRegistrationByTicket(ticketId: string): Promise<EventRegistration | null> {
  const id = ticketId.trim();
  if (!id) return null;
  const snap = await getDocs(
    query(collection(db, 'registrations'), where('ticketId', '==', id), limit(1))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as EventRegistration;
}

/**
 * Validate a scanned ticket and, if valid & not already used, mark attendance
 * and credit the attendee's points. Duplicate scans are rejected without
 * re-crediting. This is the ONLY place attendance points are awarded.
 */
export async function confirmAttendance(ticketId: string): Promise<AttendanceResult> {
  try {
    const registration = await getRegistrationByTicket(ticketId);
    if (!registration) return { status: 'invalid' };

    // Duplicate-scan protection: already attended → reject, no re-credit.
    if (registration.attended) {
      return { status: 'duplicate', registration };
    }

    const regRef = doc(db, 'registrations', registrationId(registration.userId, registration.eventId));

    // 1) Mark the ticket as used.
    await updateDoc(regRef, {
      attended: true,
      attendedAt: new Date().toISOString(),
      pointsAwarded: true,
    });

    // 2) Credit the attendee's points (atomic increment on the user profile).
    await updateDoc(doc(db, 'users', registration.userId), {
      points: increment(POINTS_PER_ATTENDANCE),
    });

    return {
      status: 'valid',
      registration: { ...registration, attended: true, pointsAwarded: true },
      points: POINTS_PER_ATTENDANCE,
    };
  } catch (error: any) {
    console.error('Error confirming attendance:', error);
    return { status: 'error', message: error?.message ?? 'Unknown error' };
  }
}
