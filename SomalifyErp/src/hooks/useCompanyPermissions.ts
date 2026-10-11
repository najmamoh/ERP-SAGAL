import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/Store';
import { hasPermission, isFullAccessRole } from '@/lib/permissions';

/**
 * Get current company user's permissions from Redux userInfo.
 * Use to conditionally show Create/Edit/Delete buttons based on role.
 */
export function useCompanyPermissions() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  // Fallback to localStorage for initial load (e.g. page refresh before Redux hydration)
  const stored = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
  const parsed = stored ? (() => { try { return JSON.parse(stored); } catch { return {}; } })() : {};
  const fallbackUser = parsed?.user ?? parsed;
  const permissions: string[] = userInfo?.user?.permissions ?? fallbackUser?.permissions ?? [];
  const roles: string[] = userInfo?.user?.roles ?? fallbackUser?.roles ?? [];
  const fullAccess = isFullAccessRole(roles);

  const can = (resource: string, action: string) =>
    fullAccess || hasPermission(permissions, `${resource}:${action}`);

  return {
    permissions,
    roles,
    can,
    canCreate: (resource: string) => can(resource, 'create'),
    canRead: (resource: string) => can(resource, 'read'),
    canUpdate: (resource: string) => can(resource, 'update'),
    canDelete: (resource: string) => can(resource, 'delete'),
  };
}
