import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { organizationService } from "./organization.service";
import sendResponse from "../../utils/sendResponse";
import { IOrganization } from "./organization.interface";

import pick from "../../utils/pick";
import { organizationFilterableFields } from "./organization.constant";
import { paginationFields } from "../../constants/pagination.constants";

const createOrganization = catchAsync(async (req: Request, res: Response) => {
  const { user, organization } = req.body;
  const result = await organizationService.createNewOrg(user, organization);

  sendResponse<IOrganization>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization created successfully!",
    data: result,
  });
});

const getOrganization = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await organizationService.getSingleOrg(id);

  sendResponse<IOrganization>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization fetched successfully !",
    data: result,
  });
});

const getOrganizations = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, organizationFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await organizationService.getOrgList(
    filters,
    paginationOptions
  );

  sendResponse<IOrganization[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization fetched successfully !",
    meta: result.meta,
    data: result.data,
  });
});

const updateOrganization = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedData = req.body;

  const result = await organizationService.updateOrg(id, updatedData);

  sendResponse<IOrganization>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization updated successfully !",
    data: result,
  });
});

// const deleteOrganization = catchAsync(async (req: Request, res: Response) => {
//   const id = req.params.id;

//   const result = await organizationService.deleteOrganization(id);

//   sendResponse<IOrganization>(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Organization deleted successfully !",
//     data: result,
//   });
// });

export const OrganizationController = {
  createOrganization,
  getOrganization,
  getOrganizations,
  updateOrganization,
};
