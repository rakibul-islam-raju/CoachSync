import {
  PermissionRoles,
  ROLES,
  permissionRoles,
} from "../constants/roles.constants";

export function mapRole(role: string): string {
  const roleDescription = ROLES[role as keyof typeof ROLES];
  return roleDescription || "";
}

export function getVisibleRoles(role?: string): PermissionRoles[] {
  if (!role) return [];

  const roleAsKey = role as keyof typeof ROLES;

  const roles = permissionRoles.filter((item: PermissionRoles) => {
    const roleList: (keyof typeof ROLES)[] = item.notVisibleTo;
    return !roleList.includes(roleAsKey);
  });

  return roles;
}
