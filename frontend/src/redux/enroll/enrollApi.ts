/* eslint-disable no-empty */

import { apiSlice } from "../api/apiSlice";
import {
  IEnroll,
  IEnrollCreateReqData,
  IEnrollParams,
  IEnrollUpdateReqData,
} from "./enroll.type";

export const enrollApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getEnrolls: builder.query<IPaginatedData<IEnroll[]>, IEnrollParams>({
      query: params => ({
        url: `students/enrolls`,
        params,
      }),
      providesTags: result => {
        if (result) {
          return [
            ...result.results.map(({ id }) => ({
              type: "Enroll" as const,
              id,
            })),
            "Enroll",
          ];
        }
        return ["Enroll"];
      },
    }),

    createEnroll: builder.mutation<IEnroll, IEnrollCreateReqData>({
      query: (data: IEnrollCreateReqData) => ({
        url: `students/enrolls`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StudentStats"],

      // pessimistically update cache
      async onQueryStarted(_data, { dispatch, queryFulfilled, getState }) {
        const param = getState().enroll.params;

        try {
          const { data } = await queryFulfilled;
          dispatch(
            enrollApi.util.updateQueryData(
              "getEnrolls",
              param,
              (draft: IPaginatedData<IEnroll[]> | undefined) => {
                if (draft) {
                  draft.results.unshift({ ...data });
                }
              },
            ),
          );
        } catch {}
      },
    }),

    updateEnroll: builder.mutation<IEnroll, Partial<IEnrollUpdateReqData>>({
      query: ({ id, data }: Partial<IEnrollUpdateReqData>) => ({
        url: `students/enrolls/${id}`,
        method: "PATCH",
        body: data,
      }),

      // pessimistically update cache
      async onQueryStarted({ id }, { dispatch, queryFulfilled, getState }) {
        const param = getState().enroll.params;

        try {
          const { data } = await queryFulfilled;

          dispatch(
            enrollApi.util.updateQueryData(
              "getEnrolls",
              param,
              (draft: IPaginatedData<IEnroll[]> | undefined) => {
                if (draft) {
                  const updatedEnrollIndex = draft.results.findIndex(
                    item => item.id === id,
                  );
                  draft.results[updatedEnrollIndex] = { ...data };
                }
              },
            ),
          );
        } catch {}
      },
    }),
  }),
});

export const {
  useGetEnrollsQuery,
  useCreateEnrollMutation,
  useUpdateEnrollMutation,
} = enrollApi;
