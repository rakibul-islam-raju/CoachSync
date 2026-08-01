import { apiSlice } from "../api/apiSlice";
import { IOrganization, IOrgShortStats } from "./organization.type";

export const organizationApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getOrganizations: builder.query<IPaginatedData<IOrganization[]>, void>({
      query: () => ({
        url: "/organizations/tenants",
        method: "GET",
        params: { limit: 100, offset: 0 },
      }),
      providesTags: ["Organization"],
    }),
    getOrgShortStats: builder.query<IOrgShortStats, undefined>({
      query: () => ({
        url: `/organizations/statistics`,
        method: "GET",
      }),
      providesTags: ["OrgStats"],
    }),
  }),
});

export const { useGetOrganizationsQuery, useGetOrgShortStatsQuery } =
  organizationApi;
