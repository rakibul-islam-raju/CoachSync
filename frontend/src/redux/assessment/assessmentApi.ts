import { apiSlice } from "../api/apiSlice";
import {
  IAssessmentReview,
  ICandidate,
  IChild,
  IGradeScale,
  IGradeScaleWrite,
  IMarkInput,
  IMarkSheet,
  IOutcome,
  IPublication,
} from "./assessment.type";

export const assessmentApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    generateCandidates: builder.mutation<
      { created: number; count: number; candidates: ICandidate[] },
      number
    >({
      query: examTypeId => ({
        url: `/assessments/exam-types/${examTypeId}/candidates/generate`,
        method: "POST",
      }),
      invalidatesTags: ["Candidate", "MarkSheet", "AssessmentReview"],
    }),
    getMarkSheet: builder.query<IMarkSheet, number>({
      query: examId => ({
        url: `/assessments/exams/${examId}/marks`,
        method: "GET",
      }),
      providesTags: (_result, _error, examId) => [
        { type: "MarkSheet", id: examId },
      ],
    }),
    saveMarkSheet: builder.mutation<
      IMarkSheet,
      { examId: number; marks: IMarkInput[] }
    >({
      query: ({ examId, marks }) => ({
        url: `/assessments/exams/${examId}/marks`,
        method: "PUT",
        data: marks,
      }),
      invalidatesTags: (_result, _error, { examId }) => [
        { type: "MarkSheet", id: examId },
        "AssessmentReview",
      ],
    }),
    submitMarkSheet: builder.mutation<{ submitted: number }, number>({
      query: examId => ({
        url: `/assessments/exams/${examId}/marks/submit`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, examId) => [
        { type: "MarkSheet", id: examId },
        "AssessmentReview",
      ],
    }),
    verifyMarkSheet: builder.mutation<{ verified: number }, number>({
      query: examId => ({
        url: `/assessments/exams/${examId}/marks/verify`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, examId) => [
        { type: "MarkSheet", id: examId },
        "AssessmentReview",
      ],
    }),
    getAssessmentReview: builder.query<IAssessmentReview, number>({
      query: examTypeId => ({
        url: `/assessments/exam-types/${examTypeId}/review`,
        method: "GET",
      }),
      providesTags: ["AssessmentReview"],
    }),
    getGradeScales: builder.query<IPaginatedData<IGradeScale[]>, void>({
      query: () => ({
        url: "/assessments/grade-scales",
        method: "GET",
        params: { limit: 100 },
      }),
      providesTags: ["GradeScale"],
    }),
    createGradeScale: builder.mutation<IGradeScale, IGradeScaleWrite>({
      query: data => ({
        url: "/assessments/grade-scales",
        method: "POST",
        data,
      }),
      invalidatesTags: ["GradeScale"],
    }),
    publishResults: builder.mutation<
      IPublication,
      {
        examTypeId: number;
        grade_scale: number;
        message: string;
        show_rank: boolean;
      }
    >({
      query: ({ examTypeId, ...data }) => ({
        url: `/assessments/exam-types/${examTypeId}/publish`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Outcome", "AssessmentReview"],
    }),
    reopenPublication: builder.mutation<{ detail: string }, number>({
      query: publicationId => ({
        url: `/assessments/publications/${publicationId}/reopen`,
        method: "POST",
      }),
      invalidatesTags: ["Outcome", "AssessmentReview", "MarkSheet"],
    }),
    getExamTypeOutcomes: builder.query<IOutcome[], number>({
      query: examTypeId => ({
        url: `/assessments/exam-types/${examTypeId}/outcomes`,
        method: "GET",
      }),
      providesTags: ["Outcome"],
    }),
    getMyOutcomes: builder.query<IOutcome[], void>({
      query: () => ({ url: "/assessments/my-outcomes", method: "GET" }),
      providesTags: ["Outcome"],
    }),
    getMyChildren: builder.query<IChild[], void>({
      query: () => ({ url: "/assessments/my-children", method: "GET" }),
      providesTags: ["Children"],
    }),
    getChildOutcomes: builder.query<IOutcome[], number>({
      query: studentId => ({
        url: `/assessments/my-children/${studentId}/outcomes`,
        method: "GET",
      }),
      providesTags: ["Outcome"],
    }),
  }),
});

export const {
  useGenerateCandidatesMutation,
  useGetMarkSheetQuery,
  useSaveMarkSheetMutation,
  useSubmitMarkSheetMutation,
  useVerifyMarkSheetMutation,
  useGetAssessmentReviewQuery,
  useGetGradeScalesQuery,
  useCreateGradeScaleMutation,
  usePublishResultsMutation,
  useReopenPublicationMutation,
  useGetExamTypeOutcomesQuery,
  useGetMyOutcomesQuery,
  useGetMyChildrenQuery,
  useGetChildOutcomesQuery,
} = assessmentApi;
