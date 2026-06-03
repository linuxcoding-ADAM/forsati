'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { canTypePhone, canTypeIdNumber, PHONE_LENGTH, ID_MAX_LENGTH } from '@/lib/validation';
import { CheckCircle2, MapPin, User } from 'lucide-react';

const INTERESTS = [
  'tech', 'ai', 'robotics', 'science', 'sport', 'music',
  'languages', 'volunteering', 'environment', 'art', 'theatre',
  'culture', 'digital', 'it', 'debate', 'exchange', 'support',
];

const WILAYAS = [
  { code: '01', name: 'Adrar' }, { code: '02', name: 'Chlef' },
  { code: '03', name: 'Laghouat' }, { code: '04', name: 'Oum El Bouaghi' },
  { code: '05', name: 'Batna' }, { code: '06', name: 'Bejaia' },
  { code: '07', name: 'Biskra' }, { code: '08', name: 'Bechar' },
  { code: '09', name: 'Blida' }, { code: '10', name: 'Bouira' },
  { code: '15', name: 'Tizi Ouzou' }, { code: '16', name: 'Alger' },
  { code: '18', name: 'Jijel' }, { code: '19', name: 'Setif' },
  { code: '21', name: 'Skikda' }, { code: '23', name: 'Annaba' },
  { code: '25', name: 'Constantine' }, { code: '27', name: 'Mostaganem' },
  { code: '31', name: 'Oran' }, { code: '35', name: 'Boumerdes' },
  { code: '42', name: 'Tipaza' }, { code: '47', name: 'Ghardaia' },
];

const ID_TYPES = [
  { value: 'national_id', label: 'National ID Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driver_license', label: "Driver's License" },
];

export function Onboarding() {
  const { t, language } = useLanguage();
  const { updatePreferences } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1: Wilaya
  const [wilayaCode, setWilayaCode] = useState('');
  const [wilayaName, setWilayaName] = useState('');

  // Step 2: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Step 3: Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [idType, setIdType] = useState<'national_id' | 'passport' | 'driver_license' | ''>('');
  const [idNumber, setIdNumber] = useState('');
  const [city, setCity] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    setError('');
    try {
      // Single Firestore write with all data at once
      await updatePreferences({
        wilaya: wilayaName,
        wilayaCode,
        interests: selectedInterests,
        language,
        onboardingComplete: true,
        firstName,
        lastName,
        phone,
        age,
        idType,
        idNumber,
        city,
      });
    } catch (err: any) {
      // Most commonly this is a Firestore "permission-denied" from security
      // rules. Surface it instead of leaving the button stuck on "Saving...".
      const code = err?.code ?? '';
      setError(
        code === 'permission-denied'
          ? 'Could not save your profile: Firestore permission denied. Check your Firestore security rules.'
          : (err?.message || 'Could not save your profile. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  };

  const stepTitles = [
    { title: t('onboarding', 'step1Title') || 'Where are you from?', sub: t('onboarding', 'step1Sub') || 'Select your Wilaya to find nearby opportunities.' },
    { title: t('onboarding', 'step2Title') || 'What interests you?', sub: t('onboarding', 'step2Sub') || 'Pick topics to personalize your feed.' },
    { title: 'Complete Your Profile', sub: 'Fill in your details once — reused for all registrations.' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 font-bold text-2xl mb-6">
            <Image src="/logo.png" alt="Forsati" width={48} height={48} className="rounded-xl shadow-lg shadow-primary/10" priority />
            <span className="font-forsati font-bold text-white text-3xl">
              Forsati
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{stepTitles[step - 1].title}</h1>
          <p className="text-textMuted">{stepTitles[step - 1].sub}</p>
        </div>

        {/* Progress indicator — 3 bars */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-2 w-20 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>

        {/* ── Step 1: Wilaya ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {WILAYAS.map(w => (
                <button
                  key={w.code}
                  onClick={() => { setWilayaCode(w.code); setWilayaName(w.name); }}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium border transition-all text-start ${
                    wilayaCode === w.code
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border text-textMuted hover:border-primary/40 hover:text-white'
                  }`}
                >
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate">{w.name}</span>
                  {wilayaCode === w.code && <CheckCircle2 size={14} className="ms-auto shrink-0" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!wilayaCode}
              className="mt-6 w-full bg-primary text-black font-semibold py-3 rounded-xl disabled:opacity-40 transition-opacity"
            >
              {t('onboarding', 'continueBtn') || 'Continue'}
            </button>
          </div>
        )}

        {/* ── Step 2: Interests ──────────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex flex-wrap gap-3 mb-6">
              {INTERESTS.map(id => (
                <button
                  key={id}
                  onClick={() => toggleInterest(id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    selectedInterests.includes(id)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border text-textMuted hover:border-primary/40 hover:text-white'
                  }`}
                >
                  {selectedInterests.includes(id) && '✓ '}
                  {t('interests', id) || id}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-border text-textMuted font-semibold py-3 rounded-xl hover:border-white hover:text-white transition-colors"
              >
                {t('common', 'back') || 'Back'}
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedInterests.length === 0}
                className="flex-1 bg-primary text-black font-semibold py-3 rounded-xl disabled:opacity-40 transition-opacity"
              >
                {t('onboarding', 'continueBtn') || 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Personal Info ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2 text-textMuted text-sm">
              <User size={16} className="text-primary" />
              <span>This information is stored securely and used to auto-fill event registrations.</span>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-textMuted">First Name <span className="text-red-400">*</span></label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Adam"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-textMuted">Last Name <span className="text-red-400">*</span></label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Bensaid"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Phone + Age row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-textMuted">Phone Number <span className="text-red-400">*</span></label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={PHONE_LENGTH}
                  value={phone}
                  onChange={e => { if (canTypePhone(e.target.value)) setPhone(e.target.value); }}
                  placeholder="0555 xx xx xx"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-textMuted">Age <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  min="14"
                  max="35"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="22"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Identity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-textMuted">ID Document Type</label>
                <select
                  value={idType}
                  onChange={e => setIdType(e.target.value as typeof idType)}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select type</option>
                  {ID_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-textMuted">ID Number</label>
                <input
                  inputMode="numeric"
                  maxLength={ID_MAX_LENGTH}
                  value={idNumber}
                  onChange={e => { if (canTypeIdNumber(e.target.value)) setIdNumber(e.target.value); }}
                  placeholder="XXXXXXXXXXXXXXXX"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* City (optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-textMuted">City <span className="text-textMuted">(optional)</span></label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder={wilayaName}
                className="bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-border text-textMuted font-semibold py-3 rounded-xl hover:border-white hover:text-white transition-colors"
              >
                {t('common', 'back') || 'Back'}
              </button>
              <button
                onClick={handleFinish}
                disabled={saving || !firstName || !lastName || !phone || !age}
                className="flex-1 bg-primary text-black font-bold py-3 rounded-xl disabled:opacity-40 transition-opacity hover:brightness-110"
              >
                {saving ? (t('common', 'loading') || 'Saving...') : (t('onboarding', 'finishBtn') || 'Save Profile')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
