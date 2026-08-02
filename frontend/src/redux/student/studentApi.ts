/* eslint-disable no-empty */

import { apiSlice } from "../api/apiSlice";
import type { RootState } from "../store";
import {
  IStudent,
  IStudentCreateReqData,
  IStudentDetails,
  IStudentParams,
  IStudentShortStats,
  IStudentUpdateReqData,
  IStudentGuardian,
  IStudentGuardianWrite,
} from "./student.type";

export const studentApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getStudents: builder.query<IPaginatedData<IStudent[]>, IStudentParams>({
      query: params => ({
        url: `/students`,
        method: "GET",
        params: params,
      }),
      providesTags: result => {
        if (result) {
          return [
            ...result.results.map(({ id }) => ({
              type: "Students" as const,
              id,
            })),
            "Students",
          ];
        }
        return ["Students"];
      },
    }),

    getStudent: builder.query<IStudentDetails, string>({
      query: studentId => ({
        url: `/students/${studentId}`,
        method: "GET",
      }),
      providesTags: result => {
        if (result) {
          return [
            {
              type: "Student" as const,
              id: result.id,
            },
            "Student",
          ];
        }
        return ["Student"];
      },
    }),

    createStudent: builder.mutation<IStudent, IStudentCreateReqData>({
      query: (data: IStudentCreateReqData) => ({
        url: `/students/`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["StudentStats"],

      // pessimistically update cache
      async onQueryStarted(_data, { dispatch, queryFulfilled, getState }) {
        const param = (getState() as RootState).student.params;

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
        url: `/students/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Student"],

      // pessimistically update cache
      async onQueryStarted(
        { data: postData },
        { dispatch, queryFulfilled, getState },
      ) {
        const param = (getState() as RootState).student.params;

        try {
          const { data } = await queryFulfilled;

          dispatch(
            studentApi.util.updateQueryData(
              "getStudents",
              param,
              (draft: IPaginatedData<IStudent[]> | undefined) => {
                if (draft) {
                  const updatedStudentIndex = draft.results.findIndex(
                    item => item.id === data.id,
                  );
                  if (updatedStudentIndex >= 0) {
                    draft.results[updatedStudentIndex] = { ...data };
                  }
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

    deleteStudent: builder.mutation<void, string>({
      query: studentId => ({
        url: `/students/${studentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StudentStats", "Student"],

      // pessimistically update cache
      async onQueryStarted(studentId, { dispatch, queryFulfilled, getState }) {
        const param = (getState() as RootState).student.params;

        try {
          await queryFulfilled;
          dispatch(
            studentApi.util.updateQueryData(
              "getStudents",
              param,
              (draft: IPaginatedData<IStudent[]> | undefined) => {
                if (draft) {
                  draft.results = draft.results.filter(
                    item => item.student_id !== studentId,
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
        url: `/students/statistics`,
        method: "GET",
      }),
      providesTags: ["StudentStats"],
    }),
    getStudentGuardians: builder.query<
      IPaginatedData<IStudentGuardian[]>,
      string
    >({
      query: studentId => ({
        url: `/students/${studentId}/guardians`,
        method: "GET",
      }),
      providesTags: ["Guardian"],
    }),
    createStudentGuardian: builder.mutation<
      IStudentGuardian,
      { studentId: string; data: IStudentGuardianWrite }
    >({
      query: ({ studentId, data }) => ({
        url: `/students/${studentId}/guardians`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Guardian"],
    }),
    deleteStudentGuardian: builder.mutation<void, number>({
      query: id => ({
        url: `/students/guardians/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Guardian"],
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
  useGetStudentGuardiansQuery,
  useCreateStudentGuardianMutation,
  useDeleteStudentGuardianMutation,
} = studentApi;
