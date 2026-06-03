// Single source of truth for "who is an admin".
// A user is an admin if their Firestore profile role is 'admin' OR their email
// is in this allowlist. The same allowlist is mirrored in firestore.rules.
export const ADMIN_EMAILS = ['admin@gmail.com'];

export function isAdminUser(email: string | null | undefined, role: string | null | undefined): boolean {
  if (role === 'admin') return true;
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
