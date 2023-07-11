import { Model, Types } from "mongoose";

export type IOrganization = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  tagline?: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  owner: Types.ObjectId;
};

export type OrgamizationModel = Model<IOrganization, Record<string, unknown>>;

export type IOrganizationFilters = {
  searchTerm?: string;
  id?: string;
  name?: string;
  slug?: string;
  phone?: string;
  email?: string;
  owner?: string;
  isActive?: string;
};
