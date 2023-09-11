export const teacherOrderings: { label: string; value: string }[] = [
  {
    label: "First Name (ASC)",
    value: "user__first_name",
  },
  {
    label: "First Name (DESC)",
    value: "-user__first_name",
  },
  {
    label: "Last Name (ASC)",
    value: "user__last_name",
  },
  {
    label: "Last Name (DESC)",
    value: "-user__last_name",
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
