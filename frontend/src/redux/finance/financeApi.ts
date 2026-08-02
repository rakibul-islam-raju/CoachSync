import { apiSlice } from "../api/apiSlice";
import {
  FinanceListParams,
  ICashReconciliation,
  IExpense,
  IExpenseCategory,
  IFinanceSummary,
  IInstallment,
  IInvoice,
  IOverdueReminder,
  IPaymentMethod,
  IScholarship,
  IScholarshipAward,
} from "./finance.type";

export const financeApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getFinanceSummary: builder.query<IFinanceSummary, void>({
      query: () => ({ url: "/finance/summary", method: "GET" }),
      providesTags: ["FinanceSummary"],
    }),
    getInvoices: builder.query<IPaginatedData<IInvoice[]>, FinanceListParams>({
      query: params => ({ url: "/finance/invoices", method: "GET", params }),
      providesTags: ["Invoice"],
    }),
    updateInvoice: builder.mutation<
      IInvoice,
      { id: number; due_date: string; notes: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/finance/invoices/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Invoice", "FinanceSummary"],
    }),
    createInstallment: builder.mutation<
      IInstallment,
      Pick<
        IInstallment,
        "invoice" | "title" | "sequence" | "due_date" | "amount"
      >
    >({
      query: data => ({ url: "/finance/installments", method: "POST", data }),
      invalidatesTags: ["Invoice", "Installment"],
    }),
    getPaymentMethods: builder.query<
      IPaginatedData<IPaymentMethod[]>,
      FinanceListParams
    >({
      query: params => ({
        url: "/finance/payment-methods",
        method: "GET",
        params,
      }),
      providesTags: ["PaymentMethod"],
    }),
    createPaymentMethod: builder.mutation<
      IPaymentMethod,
      Pick<IPaymentMethod, "name" | "method_type" | "instructions">
    >({
      query: data => ({
        url: "/finance/payment-methods",
        method: "POST",
        data,
      }),
      invalidatesTags: ["PaymentMethod"],
    }),
    getScholarships: builder.query<
      IPaginatedData<IScholarship[]>,
      FinanceListParams
    >({
      query: params => ({
        url: "/finance/scholarships",
        method: "GET",
        params,
      }),
      providesTags: ["Scholarship"],
    }),
    createScholarship: builder.mutation<
      IScholarship,
      Pick<IScholarship, "name" | "discount_type" | "value" | "description">
    >({
      query: data => ({ url: "/finance/scholarships", method: "POST", data }),
      invalidatesTags: ["Scholarship"],
    }),
    getScholarshipAwards: builder.query<
      IPaginatedData<IScholarshipAward[]>,
      FinanceListParams
    >({
      query: params => ({
        url: "/finance/scholarship-awards",
        method: "GET",
        params,
      }),
      providesTags: ["ScholarshipAward"],
    }),
    createScholarshipAward: builder.mutation<
      IScholarshipAward,
      { scholarship: number; enroll: number; notes: string }
    >({
      query: data => ({
        url: "/finance/scholarship-awards",
        method: "POST",
        data,
      }),
      invalidatesTags: [
        "ScholarshipAward",
        "Invoice",
        "Student",
        "Enroll",
        "FinanceSummary",
      ],
    }),
    getExpenseCategories: builder.query<
      IPaginatedData<IExpenseCategory[]>,
      FinanceListParams
    >({
      query: params => ({
        url: "/finance/expense-categories",
        method: "GET",
        params,
      }),
      providesTags: ["ExpenseCategory"],
    }),
    createExpenseCategory: builder.mutation<
      IExpenseCategory,
      Pick<IExpenseCategory, "name" | "description">
    >({
      query: data => ({
        url: "/finance/expense-categories",
        method: "POST",
        data,
      }),
      invalidatesTags: ["ExpenseCategory"],
    }),
    getExpenses: builder.query<IPaginatedData<IExpense[]>, FinanceListParams>({
      query: params => ({ url: "/finance/expenses", method: "GET", params }),
      providesTags: ["Expense"],
    }),
    createExpense: builder.mutation<
      IExpense,
      Pick<
        IExpense,
        | "category"
        | "payment_method"
        | "expense_date"
        | "amount"
        | "vendor"
        | "description"
      >
    >({
      query: data => ({ url: "/finance/expenses", method: "POST", data }),
      invalidatesTags: ["Expense", "FinanceSummary", "Reconciliation"],
    }),
    voidExpense: builder.mutation<IExpense, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/finance/expenses/${id}/void`,
        method: "POST",
        data: { reason },
      }),
      invalidatesTags: ["Expense", "FinanceSummary", "Reconciliation"],
    }),
    getReconciliations: builder.query<
      IPaginatedData<ICashReconciliation[]>,
      FinanceListParams
    >({
      query: params => ({
        url: "/finance/reconciliations",
        method: "GET",
        params,
      }),
      providesTags: ["Reconciliation"],
    }),
    createReconciliation: builder.mutation<
      ICashReconciliation,
      Pick<
        ICashReconciliation,
        | "payment_method"
        | "business_date"
        | "opening_balance"
        | "counted_balance"
        | "notes"
      >
    >({
      query: data => ({
        url: "/finance/reconciliations",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Reconciliation"],
    }),
    createReminder: builder.mutation<
      IOverdueReminder,
      Pick<IOverdueReminder, "invoice" | "channel" | "message">
    >({
      query: data => ({ url: "/finance/reminders", method: "POST", data }),
      invalidatesTags: ["Reminder"],
    }),
    sendReminder: builder.mutation<IOverdueReminder, number>({
      query: id => ({
        url: `/finance/reminders/${id}/send`,
        method: "POST",
        data: {},
      }),
      invalidatesTags: ["Reminder"],
    }),
  }),
});

export const {
  useGetFinanceSummaryQuery,
  useGetInvoicesQuery,
  useUpdateInvoiceMutation,
  useCreateInstallmentMutation,
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useGetScholarshipsQuery,
  useCreateScholarshipMutation,
  useGetScholarshipAwardsQuery,
  useCreateScholarshipAwardMutation,
  useGetExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useVoidExpenseMutation,
  useGetReconciliationsQuery,
  useCreateReconciliationMutation,
  useCreateReminderMutation,
  useSendReminderMutation,
} = financeApi;
