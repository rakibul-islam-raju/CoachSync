/* eslint-disable no-empty */

import { apiSlice } from "../api/apiSlice";
import {
  IStudent,
  IStudentCreateReqData,
  IStudentDetails,
  IStudentParams,
  IStudentShortStats,
  IStudentUpdateReqData,
} from "./student.type";

export const studentApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getStudents: builder.query<IPaginatedData<IStudent[]>, IStudentParams>({
      query: params => ({
        url: `students`,
        params,
      }),
      providesTags: result => {
        if (result) {
          return [
            ...result.results.map(({ id }) => ({
              type: "Student" as const,
              id,
            })),
            "Student",
          ];
        }
        return ["Student"];
      },
    }),

    getStudent: builder.query<IStudentDetails, string>({
      query: studentId => ({
        url: `students/${studentId}`,
      }),
      providesTags: result => {
        if (result) {
          return [
            {
              type: "Student" as const,
              id: result.id,
            },
          ];
        }
        return ["Student"];
      },
    }),

    createStudent: builder.mutation<IStudent, IStudentCreateReqData>({
      query: (data: IStudentCreateReqData) => ({
        url: `students/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StudentStats"],

      // pessimistically update cache
      async onQueryStarted(_data, { dispatch, queryFulfilled, getState }) {
        const param = getState().student.params;

        try {
          const { data } = await queryFulfilled;
          dispatch(
            studentApi.util.updateQueryData(
              "getStudents",
              param,
              (draft: IPaginatedData<IStudent[]> | undefined) => {
                if (draft) {
                  draft.results.unshift({ ...data });
                }
              },
            ),
          );
        } catch {}
      },
    }),

    updateStudent: builder.mutation<IStudent, Partial<IStudentUpdateReqData>>({
      query: ({ id, data }: Partial<IStudentUpdateReqData>) => ({
        url: `students/${id}`,
        method: "PATCH",
        body: data,
      }),

      // pessimistically update cache
      async onQueryStarted(
        { id, data: postData },
        { dispatch, queryFulfilled, getState },
      ) {
        const param = getState().student.params;

        try {
          const { data } = await queryFulfilled;

          dispatch(
            studentApi.util.updateQueryData(
              "getStudents",
              param,
              (draft: IPaginatedData<IStudent[]> | undefined) => {
                if (draft) {
                  const updatedStudentIndex = draft.results.findIndex(
                    item => item.id === id,
                  );
                  draft.results[updatedStudentIndex] = { ...data };
                }
              },
            ),
          );
          if (postData?.is_active) {
            dispatch(studentApi.util.invalidateTags(["StudentStats"]));
          }
        } catch {}
      },
    }),

    deleteStudent: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `students/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StudentStats"],

      // pessimistically update cache
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const param = getState().student.params;

        try {
          await queryFulfilled;
          dispatch(
            studentApi.util.updateQueryData(
              "getStudents",
              param,
              (draft: IPaginatedData<IStudent[]> | undefined) => {
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

    getStudentShortStats: builder.query<IStudentShortStats, undefined>({
      query: () => ({
        url: `students/statistics`,
      }),
      providesTags: ["StudentStats"],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetStudentShortStatsQuery,
} = studentApi;
