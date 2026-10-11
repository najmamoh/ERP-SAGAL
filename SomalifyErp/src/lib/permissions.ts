/**
 * Permission helpers – use with roles/permissions from user_roles (MainUserRole / UserRole).
 * Backend uses Permission.name = "resource:action" (e.g. "products:create").
 */

export function hasPermission(permissions: string[] | undefined, perm: string): boolean {
  if (!permissions?.length) return false;
  return permissions.includes(perm);
}

export function hasAnyPermission(permissions: string[] | undefined, perms: string[]): boolean {
  if (!permissions?.length || !perms?.length) return false;
  return perms.some((p) => permissions.includes(p));
}

export function hasAllPermissions(permissions: string[] | undefined, perms: string[]): boolean {
  if (!permissions?.length) return false;
  return perms.every((p) => permissions.includes(p));
}

/** Full-access roles that bypass permission checks on the backend. */
export function isFullAccessRole(roles: string[] | undefined): boolean {
  if (!roles?.length) return false;
  return roles.includes('superAdmin') || roles.includes('super_admin') || roles.includes('admin');
}
