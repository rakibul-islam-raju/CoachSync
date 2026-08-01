import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Calender from "./Calender";
import { useGetSchedulesQuery } from "../../redux/schedule/scheduleApi";

vi.mock("../../redux/schedule/scheduleApi", () => ({
  useGetSchedulesQuery: vi.fn(),
}));

describe("Calender", () => {
  beforeEach(() => {
    vi.mocked(useGetSchedulesQuery).mockReturnValue({
      data: { count: 0, next: null, previous: null, results: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useGetSchedulesQuery>);
  });

  it("renders an explicit empty state when the month has no schedules", () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <Calender />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("calendar-empty-state")).toHaveTextContent(
      "No schedules for this month.",
    );
  });
});
