"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserPreferences {
  language: string;
  wilaya: string;
  wilayaCode: string;
  interests: string[];
  eventAlerts: boolean;
  opportunityAlerts: boolean;
  notificationScope: 'wilaya' | 'all';
  notificationTopics: 'interests' | 'all';
  onboardingComplete: boolean;
  role?: string;
  chatHistoryEnabled?: boolean;
  // Earned only via confirmed event attendance (admin scanner). Never at signup.
  points?: number;
  // Personal profile — collected once during onboarding
  firstName?: string;
  lastName?: string;
  phone?: string;
  age?: string;
  idType?: 'national_id' | 'passport' | 'driver_license' | '';
  idNumber?: string;
  city?: string;
}

const DEFAULT_PREFS: UserPreferences = {
  language: 'ar',
  wilaya: '',
  wilayaCode: '',
  interests: [],
  eventAlerts: true,
  opportunityAlerts: true,
  notificationScope: 'all',
  notificationTopics: 'all',
  onboardingComplete: false,
  role: 'user',
  chatHistoryEnabled: true,
  points: 0,
  firstName: '',
  lastName: '',
  phone: '',
  age: '',
  idType: '',
  idNumber: '',
  city: '',
};

interface AuthContextType {
  user: User | null;
  preferences: UserPreferences | null;
  loading: boolean;
  logout: () => Promise<void>;
  updatePreferences: (patch: Partial<UserPreferences>) => Promise<void>;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Set loading to true while we fetch the user profile to prevent race conditions
        setLoading(true);
        setUser(firebaseUser);

        // Read the profile with a bounded retry. A *transient* read failure must
        // NOT drop a returning user back to defaults (onboardingComplete: false),
        // because that would re-trigger onboarding for someone who already
        // finished it — the exact thing the acceptance criteria forbid.
        const ref = doc(db, 'users', firebaseUser.uid);
        let snap: Awaited<ReturnType<typeof getDoc>> | null = null;
        let readError: any = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            snap = await getDoc(ref);
            readError = null;
            break;
          } catch (error: any) {
            readError = error;
            console.warn(`Firestore profile read attempt ${attempt}/3 failed:`, error?.message ?? error);
            // Short backoff so a transient hiccup is retried without making the
            // splash linger. Permission-denied is permanent, not transient —
            // don't waste seconds retrying it; bail to the fallback immediately.
            if (error?.code === 'permission-denied') break;
            if (attempt < 3) await sleep(150 * attempt);
          }
        }

        if (readError || !snap) {
          // Could not determine onboarding status after retries. Fall back to
          // defaults only as a last resort, and log it loudly so it's obvious in
          // the console that this is an unknown-state fallback, not a real
          // new-user signal.
          console.error("=== DEBUG: PROFILE READ FAILED AFTER RETRIES ===");
          console.error("User UID:", firebaseUser.uid);
          console.error("Error:", readError?.message ?? readError);
          console.error("Falling back to defaults (new-user state).");
          console.error("================================================");
          setPreferences(DEFAULT_PREFS);
        } else {
          const data: UserPreferences = snap.exists()
            ? { ...DEFAULT_PREFS, ...snap.data() as Partial<UserPreferences> }
            : DEFAULT_PREFS;

          console.log("=== DEBUG: USER LOGIN PROFILE LOADED ===");
          console.log("User UID:", firebaseUser.uid);
          console.log("User Document Exists:", snap.exists());
          console.log("Wilaya:", data.wilaya);
          console.log("favoriteTopics (interests):", data.interests);
          console.log("profile loaded:", { firstName: data.firstName, lastName: data.lastName, phone: data.phone });
          console.log("onboardingComplete:", data.onboardingComplete);
          console.log("Route Decision:", data.onboardingComplete ? "Home Feed" : "Onboarding");
          console.log("========================================");

          setPreferences(data);
        }
      } else {
        setUser(null);
        setPreferences(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  /**
   * Sign out → clear local state → redirect to landing page.
   * Uses window.location.replace for a hard redirect so all cached
   * component state is guaranteed to be flushed and the dashboard 
   * is removed from the browser back-history.
   */
  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setPreferences(null);
    // Optional: if any other local storage needs clearing, do it here
    // but leave 'app_language' intact.
    window.location.replace('/');
  }, []);

  /**
   * Persist a profile patch to Firestore, then reflect it locally.
   *
   * ROOT-CAUSE FIX (onboarding re-appearing after login):
   * The previous version fired `setDoc` as a detached promise *inside* a
   * `setPreferences` updater. Two problems fell out of that:
   *   1. The updater is supposed to be pure — running a network side-effect
   *      there is double-invoked under React StrictMode and is generally unsafe.
   *   2. `await updatePreferences(...)` resolved immediately, BEFORE the write
   *      reached Firestore, and any failure was swallowed by `.catch`. So the
   *      onboarding screen advanced the user to the app while the
   *      `onboardingComplete: true` write might never have landed — and the
   *      next login re-read a doc without it, forcing onboarding again.
   *
   * Now we AWAIT the write first and only update local state once it succeeds,
   * re-throwing on failure so the caller can keep the user on the form instead
   * of silently advancing with an unsaved profile.
   */
  const updatePreferences = useCallback(async (patch: Partial<UserPreferences>) => {
    if (!user) {
      console.warn('updatePreferences called with no authenticated user — skipping write.');
      return;
    }
    const base = preferences ?? DEFAULT_PREFS;
    const updated: UserPreferences = { ...base, ...patch };

    // `points` and `role` are admin/server-managed — the security rules forbid
    // the client from changing them. Never include them in a client write, or a
    // stale local value (e.g. after an admin just credited points) would make
    // the whole save fail with permission-denied.
    const { points: _p, role: _r, ...writable } = updated;

    try {
      // Durable, awaited write. The caller's `await` now genuinely waits for
      // Firestore to acknowledge the save.
      await setDoc(doc(db, 'users', user.uid), writable, { merge: true });
    } catch (error: any) {
      console.error('=== DEBUG: PROFILE SAVE FAILED ===');
      console.error('User UID:', user.uid);
      console.error('Error:', error?.message ?? error);
      console.error('==================================');
      throw error; // let the caller surface the failure and allow a retry
    }

    console.log('=== DEBUG: PROFILE SAVED TO FIRESTORE ===');
    console.log('User UID:', user.uid);
    console.log('onboardingComplete:', updated.onboardingComplete);
    console.log('wilaya:', updated.wilaya);
    console.log('favoriteTopics:', updated.interests);
    console.log('profile saved:', {
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
    });
    console.log('=========================================');

    // Reflect the persisted state locally ONLY after the write succeeds.
    setPreferences(updated);
  }, [user, preferences]);

  return (
    <AuthContext.Provider value={{ user, preferences, loading, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
