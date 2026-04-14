export function hasAdminAccess(user) {
  return user?.role === 'admin';
}

export function hasSuperAdminAccess(user) {
  return hasAdminAccess(user) && user?.admin_level === 'super_admin';
}