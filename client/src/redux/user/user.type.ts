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

export interface IUserParams {
  limit: number;
  offset: number;
  search?: string;
  name?: boolean;
  code?: boolean;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  role?: string;
  ordering?: string;

  // Index signature for string keys
  [key: string]: string | number | boolean | undefined;
}
