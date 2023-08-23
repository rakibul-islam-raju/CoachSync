/* eslint-disable no-empty */

import { apiSlice } from "../api/apiSlice";
import {
  ITeacher,
  ITeacherCreateReqData,
  ITeacherUpdateReqData,
  ITeacherParams,
} from "./teacher.type";

export const teacherApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getTeachers: builder.query<IPaginatedData<ITeacher[]>, ITeacherParams>({
      query: params => ({
        url: `organizations/teachers`,
        params,
      }),
      providesTags: result => {
        if (result) {
          return [
            ...result.results.map(({ id }) => ({
              type: "Teacher" as const,
              id,
            })),
            "Teacher",
          ];
        }
        return ["Teacher"];
      },
    }),

    createTeacher: builder.mutation<ITeacher, ITeacherCreateReqData>({
      query: (data: ITeacherCreateReqData) => ({
        url: `organizations/teachers`,
        method: "POST",
        body: data,
      }),

      // pessimistically update cache
      async onQueryStarted(_data, { dispatch, queryFulfilled, getState }) {
        const param = getState().teacher.params;

        try {
          const { data } = await queryFulfilled;
          dispatch(
            teacherApi.util.updateQueryData(
              "getTeachers",
              param,
              (draft: IPaginatedData<ITeacher[]> | undefined) => {
                if (draft) {
                  draft.results.unshift({ ...data });
                }
              },
            ),
          );
        } catch {}
      },
    }),

    updateTeacher: builder.mutation<ITeacher, Partial<ITeacherUpdateReqData>>({
      query: ({ id, data }: Partial<ITeacherUpdateReqData>) => ({
        url: `organizations/teachers/${id}`,
        method: "PATCH",
        body: data,
      }),

      // pessimistically update cache
      async onQueryStarted({ id }, { dispatch, queryFulfilled, getState }) {
        const param = getState().teacher.params;

        try {
          const { data } = await queryFulfilled;

          dispatch(
            teacherApi.util.updateQueryData(
              "getTeachers",
              param,
              (draft: IPaginatedData<ITeacher[]> | undefined) => {
                if (draft) {
                  const updatedTeacherIndex = draft.results.findIndex(
                    item => item.id === id,
                  );
                  draft.results[updatedTeacherIndex] = { ...data };
                }
              },
            ),
          );
        } catch {}
      },
    }),

    deleteTeacher: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `organizations/teachers/${id}`,
        method: "DELETE",
      }),

      // pessimistically update cache
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const param = getState().teacher.params;

        try {
          await queryFulfilled;
          dispatch(
            teacherApi.util.updateQueryData(
              "getTeachers",
              param,
              (draft: IPaginatedData<ITeacher[]> | undefined) => {
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

    searchTeacher: builder.query<IPaginatedData<ITeacher[]>, undefined>({
      query: params => ({
        url: `organizations/teachers`,
        params,
      }),
      providesTags: ["TeacherSearch"],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} = teacherApi;
