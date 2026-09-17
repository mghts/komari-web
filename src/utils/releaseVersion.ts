// Notifications only target stable fork releases; a final release supersedes its RC.
export function isNewerStableVersion(latest?: string | null, current?: string | null) {
  const pattern = /^v?(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/i;
  const a = latest?.trim().match(pattern);
  const b = current?.trim().match(pattern);
  if (!a || !b || a[4]) return false;
  for (let i = 1; i <= 3; i++) {
    if (Number(a[i]) > Number(b[i])) return true;
    if (Number(a[i]) < Number(b[i])) return false;
  }
  return Boolean(b[4]);
}
