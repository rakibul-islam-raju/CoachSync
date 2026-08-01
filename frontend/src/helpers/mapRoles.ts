import {
  EMPLOYEE_ROLE_OPTIONS,
  MANAGEABLE_EMPLOYEE_ROLES,
  PermissionRoles,
  ROLES,
  VISIBLE_EMPLOYEE_ROLES,
  isRole,
} from "../constants/roles.constants";

export function mapRole(role: string): string {
  const roleDescription = ROLES[role as keyof typeof ROLES];
  return roleDescription || "";
}

export function getVisibleRoles(role?: string): PermissionRoles[] {
  if (!isRole(role)) return [];
  return EMPLOYEE_ROLE_OPTIONS.filter(item =>
    VISIBLE_EMPLOYEE_ROLES[role].includes(item.role),
  );
}

export function getManageableRoles(role?: string): PermissionRoles[] {
  if (!isRole(role)) return [];
  return EMPLOYEE_ROLE_OPTIONS.filter(item =>
    MANAGEABLE_EMPLOYEE_ROLES[role].includes(item.role),
  );
}
