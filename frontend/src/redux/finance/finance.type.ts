export type FinanceListParams = {
  limit?: number;
  offset?: number;
  search?: string;
  ordering?: string;
  enroll?: number;
  invoice?: number;
  is_active?: boolean;
};

export interface IFinanceSummary {
  invoiced: string;
  collected: string;
  outstanding: string;
  expenses: string;
  net_cash: string;
  overdue_invoices: number;
}

export interface IPaymentMethod extends IEntityGenericProps {
  id: number;
  name: string;
  method_type: "cash" | "bank" | "mobile" | "other";
  instructions: string;
}

export interface IInstallment extends IEntityGenericProps {
  id: number;
  invoice: number;
  title: string;
  sequence: number;
  due_date: string;
  amount: number;
  paid: number;
  balance: number;
  status: "pending" | "partial" | "paid" | "overdue";
}

export interface IInvoice extends IEntityGenericProps {
  id: number;
  invoice_number: string;
  enroll: number;
  issue_date: string;
  due_date: string;
  notes: string;
  total: number;
  paid: number;
  balance: number;
  status: "unpaid" | "partial" | "paid" | "overdue" | "cancelled";
  student_id: string;
  student_name: string;
  student_email: string;
  batch_name: string;
  installments: IInstallment[];
}

export interface IScholarship extends IEntityGenericProps {
  id: number;
  name: string;
  discount_type: "fixed" | "percentage";
  value: number;
  valid_from: string | null;
  valid_until: string | null;
  description: string;
}

export interface IScholarshipAward extends IEntityGenericProps {
  id: number;
  scholarship: number;
  scholarship_name: string;
  enroll: number;
  student_id: string;
  student_name: string;
  batch_name: string;
  amount: number;
  awarded_on: string;
  notes: string;
}

export interface IExpenseCategory extends IEntityGenericProps {
  id: number;
  name: string;
  description: string;
}

export interface IExpense extends IEntityGenericProps {
  id: number;
  expense_number: string;
  category: number;
  category_name: string;
  payment_method: number;
  payment_method_name: string;
  expense_date: string;
  amount: number;
  vendor: string;
  description: string;
  status: "posted" | "void";
  void_reason: string;
}

export interface ICashReconciliation extends IEntityGenericProps {
  id: number;
  payment_method: number;
  payment_method_name: string;
  business_date: string;
  opening_balance: number;
  collections: number;
  expenses: number;
  expected_balance: number;
  counted_balance: number;
  variance: number;
  notes: string;
  closed_at: string;
}

export interface IOverdueReminder extends IEntityGenericProps {
  id: number;
  invoice: number;
  invoice_number: string;
  student_name: string;
  channel: "email" | "manual";
  message: string;
  status: "pending" | "sent" | "failed";
  sent_at: string | null;
}
