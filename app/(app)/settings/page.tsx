'use client';
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Language } from '@/lib/contexts/LanguageContext';
import { canTypePhone, canTypeIdNumber, PHONE_LENGTH, ID_MAX_LENGTH } from '@/lib/validation';
import { Globe, MapPin, Tag, Bell, User, CheckCircle2, Check, Pencil, ChevronDown, Award } from 'lucide-react';

const INTERESTS = [
  'tech', 'ai', 'robotics', 'science', 'sport', 'music',
  'languages', 'volunteering', 'environment', 'art', 'theatre',
  'culture', 'digital', 'it', 'debate',
];

const WILAYAS = [
  { code: '01', fr: 'Adrar' }, { code: '02', fr: 'Chlef' }, { code: '03', fr: 'Laghouat' },
  { code: '04', fr: 'Oum El Bouaghi' }, { code: '05', fr: 'Batna' }, { code: '06', fr: 'Bejaia' },
  { code: '07', fr: 'Biskra' }, { code: '09', fr: 'Blida' }, { code: '10', fr: 'Bouira' },
  { code: '15', fr: 'Tizi Ouzou' }, { code: '16', fr: 'Alger' }, { code: '18', fr: 'Jijel' },
  { code: '19', fr: 'Setif' }, { code: '21', fr: 'Skikda' }, { code: '23', fr: 'Annaba' },
  { code: '25', fr: 'Constantine' }, { code: '27', fr: 'Mostaganem' }, { code: '31', fr: 'Oran' },
  { code: '35', fr: 'Boumerdes' }, { code: '42', fr: 'Tipaza' }, { code: '47', fr: 'Ghardaia' },
];

const ID_TYPES = [
  { value: 'national_id', label: 'National ID Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driver_license', label: "Driver's License" },
];

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}
  >
    <span className={`absolute top-0.5 start-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

function Section({ icon: Icon, title, subtitle, children }: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1.5 bg-primary/10 rounded-lg shrink-0"><Icon size={17} className="text-primary" /></div>
        <div>
          <h2 className="font-semibold text-white text-sm">{title}</h2>
          {subtitle && <p className="text-xs text-textMuted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', disabled = false, placeholder = '', inputMode, maxLength }: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; disabled?: boolean; placeholder?: string;
  inputMode?: 'numeric' | 'tel' | 'text'; maxLength?: number;
}) {
  return (
    <div>
      <label className="text-xs text-textMuted block mb-1">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus:border-primary'}`}
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const filled = value.trim().length > 0;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2">
      <span className="text-xs text-textMuted shrink-0">{label}</span>
      <span className={`text-sm font-medium text-end truncate ${filled ? 'text-white' : 'text-textMuted/60 italic'}`}>
        {filled ? value : 'Not set'}
      </span>
    </div>
  );
}

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { user, preferences, updatePreferences } = useAuth();

  // ── Personal Info ────────────────────────────────────────────────────────
  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [phone,        setPhone]        = useState('');
  const [age,          setAge]          = useState('');
  const [idType,       setIdType]       = useState('');
  const [idNumber,     setIdNumber]     = useState('');
  const [city,         setCity]         = useState('');

  // ── Location / Interests / Notifications ─────────────────────────────────
  const [wilayaCode,   setWilayaCode]   = useState('');
  const [wilayaName,   setWilayaName]   = useState('');
  const [interests,    setInterests]    = useState<string[]>([]);
  const [notifScope,   setNotifScope]   = useState<'wilaya' | 'all'>('all');
  const [notifTopics,  setNotifTopics]  = useState<'interests' | 'all'>('all');
  const [eventAlerts,  setEventAlerts]  = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [editingInfo,  setEditingInfo]  = useState(false);

  // Hydrate from preferences once
  useEffect(() => {
    if (preferences) {
      setFirstName(preferences.firstName || '');
      setLastName(preferences.lastName || '');
      setPhone(preferences.phone || '');
      setAge(preferences.age || '');
      setIdType(preferences.idType || '');
      setIdNumber(preferences.idNumber || '');
      setCity(preferences.city || '');
      setWilayaCode(preferences.wilayaCode || '');
      setWilayaName(preferences.wilaya || '');
      setInterests(preferences.interests || []);
      setNotifScope(preferences.notificationScope || 'all');
      setNotifTopics(preferences.notificationTopics || 'all');
      setEventAlerts(preferences.eventAlerts ?? true);
    }
  }, [preferences]);

  const toggleInterest = useCallback((id: string) => {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  // Digit guards — keep these forms in lock-step with the registration form.
  const handlePhone = (v: string) => { if (canTypePhone(v)) setPhone(v); };
  const handleIdNumber = (v: string) => { if (canTypeIdNumber(v)) setIdNumber(v); };

  const idTypeLabel = ID_TYPES.find(t => t.value === idType)?.label ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  const handleSave = async () => {
    setSaving(true);
    await updatePreferences({
      firstName,
      lastName,
      phone,
      age,
      idType: idType as any,
      idNumber,
      city,
      wilaya: wilayaName,
      wilayaCode,
      interests,
      notificationScope: notifScope,
      notificationTopics: notifTopics,
      eventAlerts,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-4 pb-24">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">{t('settings', 'title')}</h1>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
          <Award size={15} /> {preferences?.points ?? 0} {t('scanner', 'points')}
        </span>
      </div>

      {/* ── My Information ─────────────────────────────────────────────── */}
      <Section icon={User} title="My Information" subtitle="Used to auto-fill event registrations. Collected once.">
        {!editingInfo ? (
          /* ── Collapsed summary + Edit button ───────────────────────── */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <SummaryRow label="Full Name" value={fullName} />
              <SummaryRow label="Phone Number" value={phone} />
              <SummaryRow label="Age" value={age} />
              <SummaryRow label="Email" value={user?.email || ''} />
              <SummaryRow label="Document" value={idType ? `${idTypeLabel} · ${idNumber || '—'}` : ''} />
              <SummaryRow label="City" value={city} />
            </div>
            <button
              onClick={() => setEditingInfo(true)}
              className="w-full flex items-center justify-center gap-2 border border-border hover:border-primary text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              <Pencil size={15} className="text-primary" />
              Edit My Information
            </button>
          </div>
        ) : (
          /* ── Expanded editable form ────────────────────────────────── */
          <div className="space-y-4">
            {/* Personal */}
            <div>
              <p className="text-xs text-textMuted font-semibold uppercase tracking-wider mb-2">Personal</p>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="First Name" value={firstName} onChange={setFirstName} placeholder="Adam" />
                <InputField label="Last Name" value={lastName} onChange={setLastName} placeholder="Bensaid" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <InputField label="Phone Number" value={phone} onChange={handlePhone} type="tel" inputMode="numeric" maxLength={PHONE_LENGTH} placeholder="0555 xx xx xx" />
                <InputField label="Age" value={age} onChange={setAge} type="number" placeholder="22" />
              </div>
              <div className="mt-3">
                <InputField
                  label="Email"
                  value={user?.email || ''}
                  disabled
                  placeholder=""
                />
                <p className="text-xs text-textMuted mt-1">{t('settings', 'emailDisabled')}</p>
              </div>
            </div>

            {/* Identity */}
            <div>
              <p className="text-xs text-textMuted font-semibold uppercase tracking-wider mb-2">Identity Document</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-textMuted block mb-1">Document Type</label>
                  <select
                    value={idType}
                    onChange={e => setIdType(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Select type</option>
                    {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <InputField label="Document Number" value={idNumber} onChange={handleIdNumber} inputMode="numeric" maxLength={ID_MAX_LENGTH} placeholder="XXXXXXXXXXXXXXXX" />
              </div>
            </div>

            {/* Residence */}
            <div>
              <p className="text-xs text-textMuted font-semibold uppercase tracking-wider mb-2">Residence</p>
              <InputField label="City (optional)" value={city} onChange={setCity} placeholder={wilayaName || 'Your city'} />
            </div>

            <button
              onClick={() => setEditingInfo(false)}
              className="w-full flex items-center justify-center gap-2 bg-primary/10 border border-primary text-primary font-semibold py-2.5 rounded-lg transition-colors hover:bg-primary/20"
            >
              <ChevronDown size={16} />
              Done — collapse
            </button>
            <p className="text-xs text-textMuted text-center">Don&apos;t forget to press <span className="text-white font-medium">Save Changes</span> below to keep your edits.</p>
          </div>
        )}
      </Section>

      {/* ── Language ───────────────────────────────────────────────────── */}
      <Section icon={Globe} title={t('settings', 'language')}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['ar', 'fr', 'en', 'kab'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`p-2.5 rounded-lg border text-sm font-medium transition-colors ${
                language === lang ? 'bg-primary/10 border-primary text-primary' : 'border-border text-textMuted hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'العربية' : lang === 'fr' ? 'Français' : lang === 'en' ? 'English' : 'Tamazight'}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Wilaya ─────────────────────────────────────────────────────── */}
      <Section icon={MapPin} title={t('settings', 'wilaya')}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {WILAYAS.map(w => (
            <button
              key={w.code}
              onClick={() => { setWilayaCode(w.code); setWilayaName(w.fr); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-colors text-start ${
                wilayaCode === w.code ? 'bg-primary/10 border-primary text-primary' : 'border-border text-textMuted hover:text-white'
              }`}
            >
              <MapPin size={10} className="shrink-0" />
              <span className="truncate">{w.fr}</span>
              {wilayaCode === w.code && <CheckCircle2 size={10} className="ms-auto shrink-0" />}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Interests ──────────────────────────────────────────────────── */}
      <Section icon={Tag} title={t('settings', 'interests')}>
        <div className="flex flex-wrap gap-1.5">
          {INTERESTS.map(id => (
            <button
              key={id}
              onClick={() => toggleInterest(id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                interests.includes(id) ? 'bg-primary/10 border-primary text-primary' : 'border-border text-textMuted hover:text-white'
              }`}
            >
              {interests.includes(id) && <Check size={10} />}
              {t('interests', id)}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Notifications ──────────────────────────────────────────────── */}
      <Section icon={Bell} title={t('settings', 'notifications')} subtitle={t('settings', 'notificationsSub')}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">{t('settings', 'eventAlerts')}</p>
              <p className="text-xs text-textMuted">{t('settings', 'eventAlertsDesc')}</p>
            </div>
            <Toggle checked={eventAlerts} onChange={() => setEventAlerts(!eventAlerts)} />
          </div>
          <div>
            <p className="text-sm text-white font-medium mb-2">{t('settings', 'notifScope')}</p>
            <div className="flex gap-2">
              {(['wilaya', 'all'] as const).map(s => (
                <button key={s} onClick={() => setNotifScope(s)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    notifScope === s ? 'bg-primary/10 border-primary text-primary' : 'border-border text-textMuted hover:text-white'
                  }`}
                >
                  {s === 'wilaya' ? t('settings', 'notifScopeWilaya') : t('settings', 'notifScopeAll')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-white font-medium mb-2">{t('settings', 'notifTopics')}</p>
            <div className="flex gap-2">
              {(['interests', 'all'] as const).map(s => (
                <button key={s} onClick={() => setNotifTopics(s)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    notifTopics === s ? 'bg-primary/10 border-primary text-primary' : 'border-border text-textMuted hover:text-white'
                  }`}
                >
                  {s === 'interests' ? t('settings', 'notifTopicsInterests') : t('settings', 'notifTopicsAll')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Save ───────────────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary text-black font-bold py-3 rounded-xl disabled:opacity-60 transition-all hover:brightness-110"
      >
        {saving ? t('common', 'loading') : saved ? `✓ ${t('settings', 'saved')}` : t('settings', 'saveChanges')}
      </button>
    </div>
  );
}