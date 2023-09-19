/* eslint-disable no-empty */

import { apiSlice } from "../api/apiSlice";
import { IOrgShortStats } from "./organization.type";

export const organizationSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getOrgShortStats: builder.query<IOrgShortStats, undefined>({
      query: () => ({
        url: `organizations/statistics`,
      }),
      providesTags: ["OrgStats"],
    }),
  }),
});

export const { useGetOrgShortStatsQuery } = organizationSlice;
