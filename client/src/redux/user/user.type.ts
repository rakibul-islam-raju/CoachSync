export type IUserCreateData = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  role?: string;
};

export type IUserUpdateData = {
  id: number;
  user: Partial<IUser>;
};
