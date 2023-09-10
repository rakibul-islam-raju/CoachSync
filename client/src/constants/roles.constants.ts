export enum ROLES {
  admin = "Admin",
  admin_staff = "Admin Staff",
  org_admin = "Organization Admin",
  org_staff = "Organization Staff",
  student = "student",
  teacher = "teacher",
}

export type PermissionRoles = {
  label: string;
  role: keyof typeof ROLES;
  notVisibleTo: (keyof typeof ROLES)[] | [];
};

export const permissionRoles: PermissionRoles[] = [
  {
    label: "Admin",
    role: "admin",
    notVisibleTo: ["org_admin", "org_staff", "teacher", "student"],
  },
  {
    label: "Admin Staff",
    role: "admin_staff",
    notVisibleTo: ["org_admin", "org_staff", "teacher", "student"],
  },
  {
    label: "Organization Admin",
    role: "org_admin",
    notVisibleTo: ["teacher", "student"],
  },
  {
    label: "Organization Staff",
    role: "org_staff",
    notVisibleTo: ["teacher", "student"],
  },
  {
    label: "Student",
    role: "student",
    notVisibleTo: [],
  },
  {
    label: "Teacher",
    role: "teacher",
    notVisibleTo: [],
  },
];
