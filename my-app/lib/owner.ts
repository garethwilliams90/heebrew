type OwnerClaim = {
  email?: string | null;
  email_confirmed_at?: string | null;
};

/** True when this confirmed account is the single app owner. */
export function isOwnerUser(user: OwnerClaim | null, ownerEmail: string | undefined) {
  const expected = ownerEmail?.trim().toLowerCase();
  const actual = user?.email?.trim().toLowerCase();
  if (!expected || !actual || actual !== expected) {
    return false;
  }
  return Boolean(user?.email_confirmed_at);
}
