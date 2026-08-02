export enum ROLES {
  admin = "Admin",
  admin_staff = "Admin Staff",
  org_admin = "Organization Admin",
  org_staff = "Organization Staff",
  student = "student",
  teacher = "teacher",
  guardian = "guardian",
}

export type Role = keyof typeof ROLES;

export type PermissionRoles = {
  label: string;
  role: Role;
};

export const OPERATIONAL_ROLES: Role[] = [
  "admin",
  "admin_staff",
  "org_admin",
  "org_staff",
];

export const EMPLOYEE_ROLE_OPTIONS: PermissionRoles[] = [
  { label: "Admin", role: "admin" },
  { label: "Admin Staff", role: "admin_staff" },
  { label: "Organization Admin", role: "org_admin" },
  { label: "Organization Staff", role: "org_staff" },
];

export const VISIBLE_EMPLOYEE_ROLES: Record<Role, Role[]> = {
  admin: ["admin", "admin_staff", "org_admin", "org_staff"],
  admin_staff: ["org_admin", "org_staff"],
  org_admin: ["org_admin", "org_staff"],
  org_staff: ["org_admin", "org_staff"],
  student: [],
  teacher: [],
  guardian: [],
};

export const MANAGEABLE_EMPLOYEE_ROLES: Record<Role, Role[]> = {
  admin: ["admin_staff", "org_admin", "org_staff"],
  admin_staff: ["org_admin", "org_staff"],
  org_admin: ["org_staff"],
  org_staff: [],
  student: [],
  teacher: [],
  guardian: [],
};

export function isRole(role?: string): role is Role {
  return Boolean(role && role in ROLES);
}

export function hasOperationalAccess(role?: string): boolean {
  return isRole(role) && OPERATIONAL_ROLES.includes(role);
}

export function canCreateEmployee(role?: string): boolean {
  return isRole(role) && MANAGEABLE_EMPLOYEE_ROLES[role].length > 0;
}

export function canManageEmployee(
  actor: IUser | null | undefined,
  employee: IUser,
): boolean {
  if (!actor || actor.id === employee.id || employee.is_superuser) return false;
  if (!isRole(actor.role) || !isRole(employee.role)) return false;
  return MANAGEABLE_EMPLOYEE_ROLES[actor.role].includes(employee.role);
}
