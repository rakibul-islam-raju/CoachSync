import { Model } from "mongoose";

export type IUser = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  isActive: boolean;
};

export type UserModel = Model<IUser, Record<string, unknown>>;

export type IUserFilters = {
  searchTerm?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  isActive?: string;
};
