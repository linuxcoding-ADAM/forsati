// lib/validation.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for user-profile validation (phone + identity number).
// Used by Onboarding, Settings, and the event registration form so the rules
// can never drift apart.
// ─────────────────────────────────────────────────────────────────────────────

export type IdType = 'national_id' | 'passport' | 'driver_license' | '';

// ── Phone ────────────────────────────────────────────────────────────────────
// Requirement: exactly 10 digits, numeric only. Min length 10, max length 10.
export const PHONE_LENGTH = 10;

/** Final-state check: a valid phone is exactly 10 numeric digits. */
export function isValidPhone(phone: string): boolean {
  return new RegExp(`^\\d{${PHONE_LENGTH}}$`).test(phone);
}

/** While-typing guard: numeric only, never longer than the max. */
export function canTypePhone(val: string): boolean {
  return /^\d*$/.test(val) && val.length <= PHONE_LENGTH;
}

// ── Identity number ──────────────────────────────────────────────────────────
// Requirement: max length 18, numeric only, minimum length CONFIGURABLE per
// document type.
export const ID_MAX_LENGTH = 18;

/**
 * Minimum length per supported document type. Tune these freely — this map is
 * the single place the per-type minimum is configured.
 *  - National ID Card: the Algerian NIN is exactly 18 digits.
 *  - Driver's License / Passport: shorter numeric identifiers.
 */
export const ID_MIN_LENGTH: Record<Exclude<IdType, ''>, number> = {
  national_id: 18,
  driver_license: 9,
  passport: 7,
};

export const ID_TYPES: { value: Exclude<IdType, ''>; label: string }[] = [
  { value: 'national_id', label: 'National ID Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driver_license', label: "Driver's License" },
];

/** Minimum length required for the given document type (1 when no type chosen). */
export function getIdMinLength(idType: IdType): number {
  return idType && idType in ID_MIN_LENGTH
    ? ID_MIN_LENGTH[idType as Exclude<IdType, ''>]
    : 1;
}

/**
 * Final-state check for an identity number.
 * An empty value is treated as "valid here" — the required-ness is enforced
 * separately (see `isIdRequired`) so the field can stay optional until a
 * document type is selected.
 */
export function isValidIdNumber(idNumber: string, idType: IdType): boolean {
  if (idNumber === '') return true;
  if (!/^\d+$/.test(idNumber)) return false;            // numeric only
  if (idNumber.length > ID_MAX_LENGTH) return false;    // max 18
  if (idNumber.length < getIdMinLength(idType)) return false; // configurable min
  return true;
}

/** While-typing guard: numeric only, never longer than the absolute max (18). */
export function canTypeIdNumber(val: string): boolean {
  return /^\d*$/.test(val) && val.length <= ID_MAX_LENGTH;
}

/** Picking a document type makes the ID number mandatory. */
export function isIdRequired(idType: IdType, idNumber: string): boolean {
  return idType !== '' && idNumber === '';
}

/** Human-readable hint for the expected ID length, e.g. "18 digits" / "9–18 digits". */
export function idLengthHint(idType: IdType): string {
  const min = getIdMinLength(idType);
  return min === ID_MAX_LENGTH ? `${ID_MAX_LENGTH} digits` : `${min}–${ID_MAX_LENGTH} digits`;
}
