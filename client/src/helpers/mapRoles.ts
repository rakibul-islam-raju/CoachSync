export enum ROLES {
  admin = "Admin",
  admin_staff = "Admin Staff",
  org_admin = "Organization Admin",
  org_staff = "Organization Staff",
  student = "student",
  teacher = "teacher",
}

export function mapRole(role: string): string {
  const roleDescription = ROLES[role as keyof typeof ROLES];
  return roleDescription || "";
}
