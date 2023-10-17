/* eslint-disable no-empty */

import { apiSlice } from "../api/apiSlice";
import {
  ISubject,
  ISubjectCreateReqData,
  ISubjectParams,
  ISubjectUpdateReqData,
} from "./subject.type";

export const subjectApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getSubjects: builder.query<IPaginatedData<ISubject[]>, ISubjectParams>({
      query: params => ({
        url: `/organizations/subjects`,
        method: "GET",
        params,
      }),
      providesTags: result => {
        if (result) {
          return [
            ...result.results.map(({ id }) => ({
              type: "Subject" as const,
              id,
            })),
            "Subject",
          ];
        }
        return ["Subject"];
      },
    }),

    createSubject: builder.mutation<ISubject, ISubjectCreateReqData>({
      query: (data: ISubjectCreateReqData) => ({
        url: `/organizations/subjects`,
        method: "POST",
        data,
      }),

      // pessimistically update cache
      async onQueryStarted(_data, { dispatch, queryFulfilled, getState }) {
        const param = getState().subject.params;

        try {
          const { data } = await queryFulfilled;
          dispatch(
            subjectApi.util.updateQueryData(
              "getSubjects",
              param,
              (draft: IPaginatedData<ISubject[]> | undefined) => {
                if (draft) {
                  draft.results.unshift({ ...data });
                }
              },
            ),
          );
        } catch {}
      },
    }),

    updateSubject: builder.mutation<ISubject, ISubjectUpdateReqData>({
      query: ({ id, data }: ISubjectUpdateReqData) => ({
        url: `/organizations/subjects/${id}`,
        method: "PATCH",
        data,
      }),

      // pessimistically update cache
      async onQueryStarted({ id }, { dispatch, queryFulfilled, getState }) {
        const param = getState().subject.params;

        try {
          const { data } = await queryFulfilled;

          dispatch(
            subjectApi.util.updateQueryData(
              "getSubjects",
              param,
              (draft: IPaginatedData<ISubject[]> | undefined) => {
                if (draft) {
                  const updatedSubjectIndex = draft.results.findIndex(
                    item => item.id === id,
                  );
                  draft.results[updatedSubjectIndex] = { ...data };
                }
              },
            ),
          );
        } catch {}
      },
    }),

    deleteSubject: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `/organizations/subjects/${id}`,
        method: "DELETE",
      }),

      // pessimistically update cache
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const param = getState().subject.params;

        try {
          await queryFulfilled;
          dispatch(
            subjectApi.util.updateQueryData(
              "getSubjects",
              param,
              (draft: IPaginatedData<ISubject[]> | undefined) => {
                if (draft) {
                  draft.results = draft.results.filter(
                    item => Number(item.id) !== id,
                  );
                }
              },
            ),
          );
        } catch {}
      },
    }),

    searchSubject: builder.query<IPaginatedData<ISubject[]>, undefined>({
      query: params => ({
        url: `/organizations/subjects`,
        method: "GET",
        params,
      }),
      providesTags: ["SubjectSearch"],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useSearchSubjectQuery,
} = subjectApi;
