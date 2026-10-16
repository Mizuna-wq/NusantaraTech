// Halaman tujuan setelah login / register.
// "from" adalah halaman yang tadinya ingin dibuka (misalnya form lamaran).
export function getHomePath(user, from) {
  if (user.role === 'admin') return '/admin/dashboard';
  if (from && (from.startsWith('/karir') || from.startsWith('/candidate'))) return from;
  return '/candidate/dashboard';
}
