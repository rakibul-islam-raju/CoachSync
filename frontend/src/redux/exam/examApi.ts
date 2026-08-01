import { apiSlice } from "../api/apiSlice";
import {
  IExam,
  IExamParams,
  IExamType,
  IExamTypeWrite,
  IExamWrite,
} from "./exam.type";

export const examApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getExamTypes: builder.query<IPaginatedData<IExamType[]>, IExamParams>({
      query: params => ({
        url: "/organizations/exam-types",
        method: "GET",
        params,
      }),
      providesTags: ["ExamType"],
    }),
    createExamType: builder.mutation<IExamType, IExamTypeWrite>({
      query: data => ({
        url: "/organizations/exam-types",
        method: "POST",
        data,
      }),
      invalidatesTags: ["ExamType"],
    }),
    updateExamType: builder.mutation<
      IExamType,
      { id: number; data: Partial<IExamTypeWrite> }
    >({
      query: ({ id, data }) => ({
        url: `/organizations/exam-types/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["ExamType", "Exam"],
    }),
    deleteExamType: builder.mutation<void, number>({
      query: id => ({
        url: `/organizations/exam-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExamType", "Exam"],
    }),
    getExams: builder.query<IPaginatedData<IExam[]>, IExamParams>({
      query: params => ({ url: "/organizations/exams", method: "GET", params }),
      providesTags: ["Exam"],
    }),
    createExam: builder.mutation<IExam, IExamWrite>({
      query: data => ({ url: "/organizations/exams", method: "POST", data }),
      invalidatesTags: ["Exam"],
    }),
    updateExam: builder.mutation<
      IExam,
      { id: number; data: Partial<IExamWrite> }
    >({
      query: ({ id, data }) => ({
        url: `/organizations/exams/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Exam", "Schedule"],
    }),
    deleteExam: builder.mutation<void, number>({
      query: id => ({ url: `/organizations/exams/${id}`, method: "DELETE" }),
      invalidatesTags: ["Exam", "Schedule"],
    }),
  }),
});

export const {
  useGetExamTypesQuery,
  useCreateExamTypeMutation,
  useUpdateExamTypeMutation,
  useDeleteExamTypeMutation,
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
} = examApi;
