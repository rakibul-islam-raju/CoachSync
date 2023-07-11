import { SortOrder } from "mongoose";
import { IGenericResponse } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";
import { calculatePagination } from "../../utils/paginationUtils";
import { organizationSearchableFields } from "./organization.constant";
import { IOrganization, IOrganizationFilters } from "./organization.interface";
import { Organization } from "./organization.model";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IUser } from "../user/user.interface";

const createNewOrg = async (
  data: IOrganization,
  user: IUser
): Promise<IOrganization> => {
  console.log(user);
  // TODO: create user

  const newOrg = new Organization(data);
  await newOrg.save();
  return newOrg;
};

const getOrgList = async (
  filters: IOrganizationFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IOrganization[]>> => {
  // Extract searchTerm to implement search query
  const { searchTerm, ...filtersData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);

  const andConditions = [];
  // Search needs $or for searching in specified fields
  if (searchTerm) {
    andConditions.push({
      $or: organizationSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }
  // Filters needs $and to fullfill all the conditions
  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // Dynamic  sorting
  const sortConditions: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }
  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Organization.find(whereConditions)
    .populate("owner")
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = result.length;

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleOrg = async (id: string): Promise<IOrganization | null> => {
  const result = await Organization.findOne({ id }).populate("owner");
  return result;
};

const updateOrg = async (
  id: string,
  payload: Partial<IOrganization>
): Promise<IOrganization | null> => {
  const isExist = await Organization.findOne({ id });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Organization not found !");
  }

  const { ...orgData } = payload;

  const updatedOrgData: Partial<IOrganization> = { ...orgData };

  const result = await Organization.findOneAndUpdate({ id }, updatedOrgData, {
    new: true,
  });
  return result;
};

// const deleteOrg = async (id: string): Promise<IOrganization | null> => {
//   // check if the organization is exist
//   const isExist = await Organization.findOne({ id });

//   if (!isExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Organization not found !");
//   }

//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();
//     //delete organization first
//     const organization = await Organization.findOneAndDelete({ id }, { session });
//     if (!organization) {
//       throw new ApiError(404, "Failed to delete organization");
//     }
//     //delete user
//     await User.deleteOne({ id });
//     session.commitTransaction();
//     session.endSession();

//     return organization;
//   } catch (error) {
//     session.abortTransaction();
//     throw error;
//   }
// };

export const organizationService = {
  createNewOrg,
  getOrgList,
  getSingleOrg,
  updateOrg,
};
