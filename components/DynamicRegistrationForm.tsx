'use client';
import { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { submitRegistration, type Event, type EventRegistration } from '@/lib/events';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ID_TYPES, isValidPhone, canTypePhone, canTypeIdNumber } from '@/lib/validation';
import { TicketModal } from '@/components/TicketModal';
import { X, CheckCircle2, User, Phone, Mail, CreditCard, Ticket as TicketIcon } from 'lucide-react';

interface Props {
  event: Event;
  onClose: () => void;
  onSuccess: () => void;
}

const idTypeLabel = (idType: string) =>
  ID_TYPES.find(t => t.value === idType)?.label ?? '';

// Map registration field names to user profile fields
const PROFILE_FIELD_MAP: Record<string, (prefs: any, email: string) => string> = {
  name:       (p, _)  => [p.firstName, p.lastName].filter(Boolean).join(' '),
  first_name: (p, _)  => p.firstName || '',
  last_name:  (p, _)  => p.lastName || '',
  email:      (_, e)  => e,
  phone:      (p, _)  => p.phone || '',
  age:        (p, _)  => p.age || '',
  wilaya:     (p, _)  => p.wilaya || '',
  city:       (p, _)  => p.city || '',
  id_type:    (p, _)  => idTypeLabel(p.idType),
  id_number:  (p, _)  => p.idNumber || '',
};

// While-typing input guards for the (rare) fields not covered by the profile.
function guardExtraInput(field: string, val: string): string | null {
  if (field === 'phone')              return canTypePhone(val) ? val : null;
  if (field === 'id_number')          return canTypeIdNumber(val) ? val : null;
  if (field === 'age')                return /^\d{0,3}$/.test(val) ? val : null;
  return val;
}

// Final-state validation for an extra field — returns an error string or null.
function validateExtra(field: string, val: string): string | null {
  const v = val.trim();
  if (!v) return 'This field is required.';
  if (field === 'phone' && !isValidPhone(v)) return 'Phone must be exactly 10 digits.';
  if (field === 'id_number' && !/^\d{1,18}$/.test(v)) return 'ID number must be numeric (max 18 digits).';
  if (field === 'age' && (!/^\d+$/.test(v) || +v < 14 || +v > 99)) return 'Enter a valid age.';
  return null;
}

function FieldIcon({ field }: { field: string }) {
  if (['name', 'first_name', 'last_name'].includes(field)) return <User size={15} className="text-primary shrink-0" />;
  if (field === 'email') return <Mail size={15} className="text-primary shrink-0" />;
  if (field === 'phone') return <Phone size={15} className="text-primary shrink-0" />;
  return <CreditCard size={15} className="text-primary shrink-0" />;
}

export function DynamicRegistrationForm({ event, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const { user, preferences } = useAuth();

  // Build pre-filled values from profile
  const prefilled = useMemo(() => {
    const out: Record<string, string> = {};
    for (const field of event.registrationFields) {
      const resolver = PROFILE_FIELD_MAP[field];
      if (resolver && preferences) {
        const val = resolver(preferences, user?.email ?? '');
        if (val) out[field] = val;
      }
    }
    return out;
  }, [event.registrationFields, preferences, user?.email]);

  // Determine which fields are NOT in the profile
  const missingFields = event.registrationFields.filter(f => !prefilled[f]);

  // Extra inputs state for missing fields only
  const [extraData, setExtraData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [showTicket, setShowTicket] = useState(false);

  const handleExtraChange = (field: string, value: string) => {
    const guarded = guardExtraInput(field, value);
    if (guarded === null) return; // reject disallowed characters
    setExtraData(prev => ({ ...prev, [field]: guarded }));
  };

  const handleConfirm = async () => {
    if (!user) return;

    // Validate missing fields (presence + format)
    for (const field of missingFields) {
      const fieldError = validateExtra(field, extraData[field] ?? '');
      if (fieldError) {
        setError(`${formatLabel(field)}: ${fieldError}`);
        return;
      }
    }

    setLoading(true);
    setError('');

    const answers = { ...prefilled, ...extraData };

    const res = await submitRegistration({
      userId: user.uid,
      eventId: event.id,
      answers,
    });

    setLoading(false);

    if (res) {
      setRegistration(res);
      setSuccess(true);
      // Mark the parent as registered, but keep this dialog open so the user
      // can view their ticket. They close it themselves.
      onSuccess();
    } else {
      setError('An error occurred. Please try again.');
    }
  };

  const formatLabel = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-border w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden">

        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div>
            <h2 className="text-lg font-bold text-white">{t('eventDetail', 'join')}</h2>
            <p className="text-xs text-textMuted mt-0.5 truncate max-w-[220px]">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-textMuted hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <CheckCircle2 size={44} className="text-primary" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">{t('eventDetail', 'successTitle')}</h3>
              <p className="text-textMuted text-sm mb-6">{t('eventDetail', 'successSub')}</p>
              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={() => setShowTicket(true)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-3.5 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <TicketIcon size={18} /> {t('ticket', 'view')}
                </button>
                <button
                  onClick={onClose}
                  className="w-full border border-border text-textMuted font-semibold py-3 rounded-2xl hover:text-white hover:border-white transition-colors"
                >
                  {t('common', 'done')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Pre-filled profile fields preview */}
              {Object.keys(prefilled).length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-textMuted font-medium uppercase tracking-wider">{t('eventDetail', 'yourInfo')}</p>
                  <div className="bg-background border border-border/60 rounded-2xl overflow-hidden divide-y divide-border/40">
                    {event.registrationFields.filter(f => prefilled[f]).map(field => (
                      <div key={field} className="flex items-center gap-3 px-4 py-3">
                        <FieldIcon field={field} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-textMuted uppercase tracking-wide">{formatLabel(field)}</p>
                          <p className="text-sm text-white font-medium truncate">{prefilled[field]}</p>
                        </div>
                        <CheckCircle2 size={14} className="text-primary/60 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional required fields (not in profile) */}
              {missingFields.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-textMuted font-medium uppercase tracking-wider">{t('eventDetail', 'additionalInfo')}</p>
                  {missingFields.map(field => (
                    <div key={field} className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300">
                        {formatLabel(field)} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                        inputMode={['phone', 'id_number', 'age'].includes(field) ? 'numeric' : undefined}
                        value={extraData[field] || ''}
                        onChange={e => handleExtraChange(field, e.target.value)}
                        placeholder={`Enter your ${formatLabel(field).toLowerCase()}`}
                        className="bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer / Confirm button */}
        {!success && (
          <div className="px-5 pb-6 pt-3 border-t border-border/50 bg-surface">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-primary text-black font-bold py-4 rounded-2xl text-base hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? t('eventDetail', 'registering') : t('eventDetail', 'confirmReg')}
            </button>
          </div>
        )}
      </div>

      {showTicket && registration && (
        <TicketModal registration={registration} event={event} onClose={() => setShowTicket(false)} />
      )}
    </div>
  );
}
