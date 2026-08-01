import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as examApi from "../../redux/exam/examApi";
import { useGetBatchesQuery } from "../../redux/batch/batchApi";
import { useGetSubjectsQuery } from "../../redux/subject/subjectApi";
import ExamManagement from "./ExamManagement";

vi.mock("../../redux/exam/examApi");
vi.mock("../../redux/batch/batchApi", () => ({ useGetBatchesQuery: vi.fn() }));
vi.mock("../../redux/subject/subjectApi", () => ({
  useGetSubjectsQuery: vi.fn(),
}));

const page = <T,>(results: T[]) => ({
  data: { count: results.length, next: null, previous: null, results },
  isLoading: false,
  error: undefined,
});

describe("ExamManagement", () => {
  beforeEach(() => {
    vi.mocked(examApi.useGetExamTypesQuery).mockReturnValue(
      page([
        {
          id: 1,
          name: "Final",
          start_date: "2026-08-01",
          end_date: "2026-08-10",
          batch: { id: 2, name: "Batch A" },
          is_active: true,
        },
      ]) as unknown as ReturnType<typeof examApi.useGetExamTypesQuery>,
    );
    vi.mocked(examApi.useGetExamsQuery).mockReturnValue(
      page([
        {
          id: 3,
          name: "Math final",
          date: "2026-08-05",
          pass_mark: 40,
          total_mark: 100,
          exam_type: { id: 1, name: "Final" },
          subject: { id: 4, name: "Math" },
          is_active: true,
        },
      ]) as unknown as ReturnType<typeof examApi.useGetExamsQuery>,
    );
    vi.mocked(useGetBatchesQuery).mockReturnValue(
      page([]) as unknown as ReturnType<typeof useGetBatchesQuery>,
    );
    vi.mocked(useGetSubjectsQuery).mockReturnValue(
      page([]) as unknown as ReturnType<typeof useGetSubjectsQuery>,
    );
    const mutationResult = {
      isSuccess: false,
      isError: false,
      isLoading: false,
    };
    vi.mocked(examApi.useCreateExamTypeMutation).mockReturnValue([
      vi.fn(),
      mutationResult,
    ] as unknown as ReturnType<typeof examApi.useCreateExamTypeMutation>);
    vi.mocked(examApi.useUpdateExamTypeMutation).mockReturnValue([
      vi.fn(),
      mutationResult,
    ] as unknown as ReturnType<typeof examApi.useUpdateExamTypeMutation>);
    vi.mocked(examApi.useDeleteExamTypeMutation).mockReturnValue([
      vi.fn(),
      mutationResult,
    ] as unknown as ReturnType<typeof examApi.useDeleteExamTypeMutation>);
    vi.mocked(examApi.useCreateExamMutation).mockReturnValue([
      vi.fn(),
      mutationResult,
    ] as unknown as ReturnType<typeof examApi.useCreateExamMutation>);
    vi.mocked(examApi.useUpdateExamMutation).mockReturnValue([
      vi.fn(),
      mutationResult,
    ] as unknown as ReturnType<typeof examApi.useUpdateExamMutation>);
    vi.mocked(examApi.useDeleteExamMutation).mockReturnValue([
      vi.fn(),
      mutationResult,
    ] as unknown as ReturnType<typeof examApi.useDeleteExamMutation>);
  });

  it("renders both exam-type and exam management views", () => {
    render(
      <MemoryRouter>
        <ExamManagement />
      </MemoryRouter>,
    );

    expect(screen.getByText("Batch A")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Exams" }));
    expect(screen.getByText("Math final")).toBeInTheDocument();
    expect(screen.getByText("40/100")).toBeInTheDocument();
  });
});
