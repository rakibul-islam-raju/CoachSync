export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
] as const;

export enum BLOOD_GROUP_ENUM {
  "A+" = "A+",
  "A-" = "A-",
  "B+" = "B+",
  "B-" = "B-",
  "O+" = "O+",
  "O-" = "O-",
  "AB+" = "AB+",
  "AB-" = "AB-",
}

export const studentsOrderings: { label: string; value: string }[] = [
  {
    label: "First Name (ASC)",
    value: "user__first_name",
  },
  {
    label: "First Name (DESC)",
    value: "-user__first_name",
  },
  {
    label: "Created At (ASC)",
    value: "created_at",
  },
  {
    label: "Created At (DESC)",
    value: "-created_at",
  },
  {
    label: "Updated At (ASC)",
    value: "updated_at",
  },
  {
    label: "Updated At (DESC)",
    value: "-updated_at",
  },
];
