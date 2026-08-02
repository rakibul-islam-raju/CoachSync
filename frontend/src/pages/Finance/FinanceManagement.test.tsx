import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as financeApi from "../../redux/finance/financeApi";
import FinanceManagement from "./FinanceManagement";

vi.mock("../../redux/finance/financeApi");

describe("FinanceManagement", () => {
  beforeEach(() => {
    vi.mocked(financeApi.useGetFinanceSummaryQuery).mockReturnValue({
      data: {
        invoiced: "1000.00",
        collected: "400.00",
        outstanding: "600.00",
        expenses: "100.00",
        net_cash: "300.00",
        overdue_invoices: 1,
      },
      isLoading: false,
      isError: false,
      error: undefined,
    } as unknown as ReturnType<typeof financeApi.useGetFinanceSummaryQuery>);
    vi.mocked(financeApi.useGetInvoicesQuery).mockReturnValue({
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            invoice_number: "INV-0001-000001",
            enroll: 1,
            issue_date: "2026-07-01",
            due_date: "2026-07-31",
            notes: "",
            total: 1000,
            paid: 400,
            balance: 600,
            status: "overdue",
            student_id: "ST1",
            student_name: "Test Student",
            student_email: "student@example.com",
            batch_name: "Batch A",
            installments: [],
            is_active: true,
            created_by: 1,
            created_at: "2026-07-01T00:00:00Z",
            updated_at: "2026-07-01T00:00:00Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: undefined,
    } as unknown as ReturnType<typeof financeApi.useGetInvoicesQuery>);
    const mutation = [vi.fn(), {}];
    vi.mocked(financeApi.useUpdateInvoiceMutation).mockReturnValue(
      mutation as unknown as ReturnType<
        typeof financeApi.useUpdateInvoiceMutation
      >,
    );
    vi.mocked(financeApi.useCreateInstallmentMutation).mockReturnValue(
      mutation as unknown as ReturnType<
        typeof financeApi.useCreateInstallmentMutation
      >,
    );
    vi.mocked(financeApi.useCreateReminderMutation).mockReturnValue(
      mutation as unknown as ReturnType<
        typeof financeApi.useCreateReminderMutation
      >,
    );
    vi.mocked(financeApi.useSendReminderMutation).mockReturnValue(
      mutation as unknown as ReturnType<
        typeof financeApi.useSendReminderMutation
      >,
    );
  });

  it("shows the no-gateway summary and invoice workflow", () => {
    render(
      <MemoryRouter>
        <FinanceManagement />
      </MemoryRouter>,
    );

    expect(screen.getByText("Manual payments only")).toBeInTheDocument();
    expect(screen.getByText("600.00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Invoices" }));
    expect(screen.getByText("INV-0001-000001")).toBeInTheDocument();
    expect(screen.getByText("Test Student")).toBeInTheDocument();
  });
});
