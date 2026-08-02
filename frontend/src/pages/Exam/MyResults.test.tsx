import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as assessmentApi from "../../redux/assessment/assessmentApi";
import { setUserInfo, userLoggedOut } from "../../redux/auth/authSlice";
import store from "../../redux/store";
import MyResults from "./MyResults";

vi.mock("../../redux/assessment/assessmentApi");

describe("MyResults", () => {
  beforeEach(() => {
    store.dispatch(
      setUserInfo({
        id: 10,
        first_name: "Student",
        last_name: "One",
        full_name: "Student One",
        phone: "01700000010",
        email: "student@example.com",
        is_active: true,
        is_staff: false,
        is_superuser: false,
        role: "student",
        created_at: new Date(),
        updated_at: new Date(),
      }),
    );
    vi.mocked(assessmentApi.useGetMyChildrenQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof assessmentApi.useGetMyChildrenQuery>);
    vi.mocked(assessmentApi.useGetChildOutcomesQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof assessmentApi.useGetChildOutcomesQuery>);
    vi.mocked(assessmentApi.useGetMyOutcomesQuery).mockReturnValue({
      data: [
        {
          id: 1,
          publication: {
            id: 2,
            exam_type: 3,
            exam_type_name: "Final 2026",
            batch_name: "Ten A",
            version: 1,
            status: "published",
            message: "Well done",
            show_rank: true,
            published_at: "2026-08-02T10:00:00Z",
            published_by: 1,
          },
          student: {
            id: 4,
            student_id: "ST-4",
            first_name: "Student",
            last_name: "One",
          },
          total_obtained: "80.00",
          total_possible: "100.00",
          percentage: "80.00",
          grade: "A+",
          grade_point: "5.00",
          has_passed: true,
          rank: 1,
          created_at: "2026-08-02T10:00:00Z",
          lines: [
            {
              id: 5,
              exam: 6,
              exam_name: "Math final",
              subject: "Mathematics",
              subject_code: "MATH",
              attendance_status: "present",
              obtained_mark: "80.00",
              total_mark: "100.00",
              pass_mark: "40.00",
              percentage: "80.00",
              grade: "A+",
              grade_point: "5.00",
              has_passed: true,
            },
          ],
        },
      ],
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof assessmentApi.useGetMyOutcomesQuery>);
  });

  afterEach(() => store.dispatch(userLoggedOut()));

  it("renders only published outcome details returned for the student", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <MyResults />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText("Final 2026")).toBeInTheDocument();
    expect(screen.getByText("Mathematics (MATH)")).toBeInTheDocument();
    expect(screen.getByText("Rank 1")).toBeInTheDocument();
    expect(screen.getByText("Well done")).toBeInTheDocument();
  });
});
