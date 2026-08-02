import AddIcon from "@mui/icons-material/Add";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import EmailIcon from "@mui/icons-material/Email";
import PaymentsIcon from "@mui/icons-material/Payments";
import PrintIcon from "@mui/icons-material/Print";
import UndoIcon from "@mui/icons-material/Undo";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { FormEvent, ReactNode, useState } from "react";
import { toast } from "react-toastify";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import CustomPagination from "../../components/CustomPagination/CustomPagination";
import CustomTableContainer from "../../components/CustomTable/CustomTableContainer";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal/Modal";
import PageContainer from "../../components/PageContainer/PageContainer";
import { useGetEnrollsQuery } from "../../redux/enroll/enrollApi";
import {
  useCreateExpenseCategoryMutation,
  useCreateExpenseMutation,
  useCreateInstallmentMutation,
  useCreatePaymentMethodMutation,
  useCreateReconciliationMutation,
  useCreateReminderMutation,
  useCreateScholarshipAwardMutation,
  useCreateScholarshipMutation,
  useGetExpenseCategoriesQuery,
  useGetExpensesQuery,
  useGetFinanceSummaryQuery,
  useGetInvoicesQuery,
  useGetPaymentMethodsQuery,
  useGetReconciliationsQuery,
  useGetScholarshipAwardsQuery,
  useGetScholarshipsQuery,
  useSendReminderMutation,
  useUpdateInvoiceMutation,
  useVoidExpenseMutation,
} from "../../redux/finance/financeApi";
import { IInvoice } from "../../redux/finance/finance.type";
import { formatDate } from "../../utils/formatDate";

const today = () => new Date().toISOString().slice(0, 10);

function failureMessage(error: unknown) {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string") return data;
    if (typeof data === "object" && data) {
      return Object.values(data as Record<string, unknown>)
        .flat()
        .join(" ");
    }
  }
  return "The finance record could not be saved.";
}

async function submitMutation<T>(
  promise: { unwrap: () => Promise<T> },
  success: string,
) {
  try {
    const result = await promise.unwrap();
    toast.success(success);
    return result;
  } catch (error) {
    toast.error(failureMessage(error));
    return null;
  }
}

function EmptyRows({
  message = "No finance records found.",
}: {
  message?: string;
}) {
  return <ErrorDisplay severity="warning" error={message} />;
}

function FinanceModal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      content={children}
      maxWidth="sm"
      fullWidth
    />
  );
}

function SubmitForm({
  children,
  onSubmit,
  label = "Save",
}: {
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  label?: string;
}) {
  return (
    <Stack component="form" onSubmit={onSubmit} spacing={2}>
      {children}
      <CustomButton type="submit">{label}</CustomButton>
    </Stack>
  );
}

function SummaryCards() {
  const { data, isLoading, isError, error } = useGetFinanceSummaryQuery();
  if (isLoading) return <Loader />;
  if (isError || !data) return <ErrorDisplay error={error} />;
  const cards = [
    ["Invoiced", data.invoiced],
    ["Collected", data.collected],
    ["Outstanding", data.outstanding],
    ["Expenses", data.expenses],
    ["Net cash", data.net_cash],
    ["Overdue invoices", data.overdue_invoices],
  ];
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap: 2,
      }}
    >
      {cards.map(([label, value]) => (
        <Card variant="outlined" key={label}>
          <CardContent>
            <Typography color="text.secondary" variant="body2">
              {label}
            </Typography>
            <Typography variant="h5">{value}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

function printInvoice(invoice: IInvoice) {
  const popup = window.open("", "_blank", "width=700,height=800");
  if (!popup) return;
  popup.opener = null;
  const values = [
    "CoachSync invoice",
    invoice.invoice_number,
    `${invoice.student_name} (${invoice.student_id})`,
    `Batch: ${invoice.batch_name}`,
    `Issued: ${formatDate(invoice.issue_date)}`,
    `Due: ${formatDate(invoice.due_date)}`,
    `Total: ${invoice.total}`,
    `Paid: ${invoice.paid}`,
    `Balance: ${invoice.balance}`,
    `Status: ${invoice.status}`,
  ];
  values.forEach((value, index) => {
    const node = popup.document.createElement(index === 0 ? "h1" : "p");
    node.textContent = String(value);
    popup.document.body.appendChild(node);
  });
  popup.print();
}

function InvoicesPanel() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading, isError, error } = useGetInvoicesQuery({
    limit,
    offset: (page - 1) * limit,
  });
  const [selected, setSelected] = useState<IInvoice | null>(null);
  const [dialog, setDialog] = useState<
    "invoice" | "installment" | "reminder" | null
  >(null);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [sequence, setSequence] = useState(1);
  const [amount, setAmount] = useState(0);
  const [channel, setChannel] = useState<"email" | "manual">("email");
  const [message, setMessage] = useState("");
  const [updateInvoice] = useUpdateInvoiceMutation();
  const [createInstallment] = useCreateInstallmentMutation();
  const [createReminder] = useCreateReminderMutation();
  const [sendReminder] = useSendReminderMutation();

  const close = () => {
    setDialog(null);
    setSelected(null);
  };
  const openInvoice = (invoice: IInvoice) => {
    setSelected(invoice);
    setDueDate(invoice.due_date);
    setNotes(invoice.notes);
    setDialog("invoice");
  };
  const openInstallment = (invoice: IInvoice) => {
    setSelected(invoice);
    setTitle("");
    setSequence(invoice.installments.length + 1);
    setAmount(0);
    setDueDate(invoice.due_date);
    setDialog("installment");
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorDisplay error={error} />;
  return (
    <>
      {!data?.results.length ? (
        <EmptyRows />
      ) : (
        <CustomTableContainer
          columns={[
            "Invoice",
            "Student",
            "Batch",
            "Due",
            "Total",
            "Paid",
            "Balance",
            "Status",
            "Actions",
          ]}
        >
          <TableBody>
            {data.results.map(invoice => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>
                  {invoice.student_name}
                  <Typography variant="caption" sx={{ display: "block" }}>
                    {invoice.student_id}
                  </Typography>
                </TableCell>
                <TableCell>{invoice.batch_name}</TableCell>
                <TableCell>{formatDate(invoice.due_date)}</TableCell>
                <TableCell>{invoice.total}</TableCell>
                <TableCell>{invoice.paid}</TableCell>
                <TableCell>{invoice.balance}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={invoice.status}
                    color={
                      invoice.status === "paid"
                        ? "success"
                        : invoice.status === "overdue"
                          ? "error"
                          : "warning"
                    }
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Print invoice">
                    <IconButton onClick={() => printInvoice(invoice)}>
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit due date">
                    <IconButton onClick={() => openInvoice(invoice)}>
                      <EditCalendarIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add installment">
                    <IconButton onClick={() => openInstallment(invoice)}>
                      <PaymentsIcon />
                    </IconButton>
                  </Tooltip>
                  {invoice.status === "overdue" && (
                    <Tooltip title="Record or send reminder">
                      <IconButton
                        onClick={() => {
                          setSelected(invoice);
                          setMessage("");
                          setDialog("reminder");
                        }}
                      >
                        <EmailIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </CustomTableContainer>
      )}
      {data && data.count > limit && (
        <CustomPagination
          page={page}
          count={Math.ceil(data.count / limit)}
          handleChange={(_, value) => setPage(value)}
        />
      )}
      <FinanceModal
        title="Update invoice"
        open={dialog === "invoice"}
        onClose={close}
      >
        <SubmitForm
          onSubmit={async event => {
            event.preventDefault();
            if (!selected) return;
            const saved = await submitMutation(
              updateInvoice({ id: selected.id, due_date: dueDate, notes }),
              "Invoice updated.",
            );
            if (saved) close();
          }}
        >
          <TextField
            label="Due date"
            type="date"
            value={dueDate}
            onChange={event => setDueDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            required
          />
          <TextField
            label="Notes"
            value={notes}
            onChange={event => setNotes(event.target.value)}
            multiline
            rows={3}
          />
        </SubmitForm>
      </FinanceModal>
      <FinanceModal
        title="Add installment"
        open={dialog === "installment"}
        onClose={close}
      >
        <SubmitForm
          onSubmit={async event => {
            event.preventDefault();
            if (!selected) return;
            const saved = await submitMutation(
              createInstallment({
                invoice: selected.id,
                title,
                sequence,
                due_date: dueDate,
                amount,
              }),
              "Installment added.",
            );
            if (saved) close();
          }}
        >
          <TextField
            label="Title"
            value={title}
            onChange={event => setTitle(event.target.value)}
            required
          />
          <TextField
            label="Sequence"
            type="number"
            value={sequence}
            onChange={event => setSequence(Number(event.target.value))}
            required
          />
          <TextField
            label="Due date"
            type="date"
            value={dueDate}
            onChange={event => setDueDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            required
          />
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={event => setAmount(Number(event.target.value))}
            required
          />
        </SubmitForm>
      </FinanceModal>
      <FinanceModal
        title="Overdue reminder"
        open={dialog === "reminder"}
        onClose={close}
      >
        <SubmitForm
          label={channel === "email" ? "Queue reminder" : "Record contact"}
          onSubmit={async event => {
            event.preventDefault();
            if (!selected) return;
            const reminder = await submitMutation(
              createReminder({ invoice: selected.id, channel, message }),
              "Reminder created.",
            );
            if (reminder) {
              const sent = await submitMutation(
                sendReminder(reminder.id),
                channel === "email" ? "Reminder queued." : "Contact recorded.",
              );
              if (sent) close();
            }
          }}
        >
          <TextField
            select
            label="Channel"
            value={channel}
            onChange={event =>
              setChannel(event.target.value as "email" | "manual")
            }
          >
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="manual">Manual contact</MenuItem>
          </TextField>
          <TextField
            label="Message or contact note"
            value={message}
            onChange={event => setMessage(event.target.value)}
            multiline
            rows={4}
          />
        </SubmitForm>
      </FinanceModal>
    </>
  );
}

function ExpensesPanel() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading, isError, error } = useGetExpensesQuery({
    limit,
    offset: (page - 1) * limit,
  });
  const { data: categories } = useGetExpenseCategoriesQuery({
    limit: 100,
    is_active: true,
  });
  const { data: methods } = useGetPaymentMethodsQuery({
    limit: 100,
    is_active: true,
  });
  const [dialog, setDialog] = useState<"expense" | "category" | null>(null);
  const [category, setCategory] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(0);
  const [expenseDate, setExpenseDate] = useState(today());
  const [amount, setAmount] = useState(0);
  const [vendor, setVendor] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [createExpense] = useCreateExpenseMutation();
  const [createCategory] = useCreateExpenseCategoryMutation();
  const [voidExpense] = useVoidExpenseMutation();
  const close = () => setDialog(null);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorDisplay error={error} />;
  return (
    <>
      <Stack direction="row" sx={{ justifyContent: "flex-end", gap: 1, mb: 2 }}>
        <CustomButton onClick={() => setDialog("category")}>
          Add category
        </CustomButton>
        <CustomButton onClick={() => setDialog("expense")}>
          <AddIcon /> Expense
        </CustomButton>
      </Stack>
      {!data?.results.length ? (
        <EmptyRows message="No expenses recorded." />
      ) : (
        <CustomTableContainer
          columns={[
            "Expense",
            "Date",
            "Category",
            "Method",
            "Vendor",
            "Description",
            "Amount",
            "Status",
            "Action",
          ]}
        >
          <TableBody>
            {data.results.map(expense => (
              <TableRow key={expense.id}>
                <TableCell>{expense.expense_number}</TableCell>
                <TableCell>{formatDate(expense.expense_date)}</TableCell>
                <TableCell>{expense.category_name}</TableCell>
                <TableCell>{expense.payment_method_name}</TableCell>
                <TableCell>{expense.vendor || "—"}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.amount}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={expense.status}
                    color={expense.status === "posted" ? "success" : "default"}
                  />
                </TableCell>
                <TableCell>
                  {expense.status === "posted" && (
                    <Tooltip title="Void expense">
                      <IconButton
                        onClick={async () => {
                          const reason = window.prompt(
                            "Reason for voiding this expense",
                          );
                          if (reason)
                            await submitMutation(
                              voidExpense({ id: expense.id, reason }),
                              "Expense voided.",
                            );
                        }}
                      >
                        <UndoIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </CustomTableContainer>
      )}
      {data && data.count > limit && (
        <CustomPagination
          page={page}
          count={Math.ceil(data.count / limit)}
          handleChange={(_, value) => setPage(value)}
        />
      )}
      <FinanceModal
        title="Record expense"
        open={dialog === "expense"}
        onClose={close}
      >
        <SubmitForm
          onSubmit={async event => {
            event.preventDefault();
            const saved = await submitMutation(
              createExpense({
                category,
                payment_method: paymentMethod,
                expense_date: expenseDate,
                amount,
                vendor,
                description,
              }),
              "Expense recorded.",
            );
            if (saved) close();
          }}
        >
          <TextField
            select
            label="Category"
            value={category || ""}
            onChange={event => setCategory(Number(event.target.value))}
            required
          >
            {categories?.results.map(item => (
              <MenuItem value={item.id} key={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Payment method"
            value={paymentMethod || ""}
            onChange={event => setPaymentMethod(Number(event.target.value))}
            required
          >
            {methods?.results.map(item => (
              <MenuItem value={item.id} key={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Expense date"
            type="date"
            value={expenseDate}
            onChange={event => setExpenseDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            required
          />
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={event => setAmount(Number(event.target.value))}
            required
          />
          <TextField
            label="Vendor"
            value={vendor}
            onChange={event => setVendor(event.target.value)}
          />
          <TextField
            label="Description"
            value={description}
            onChange={event => setDescription(event.target.value)}
            required
          />
        </SubmitForm>
      </FinanceModal>
      <FinanceModal
        title="Add expense category"
        open={dialog === "category"}
        onClose={close}
      >
        <SubmitForm
          onSubmit={async event => {
            event.preventDefault();
            const saved = await submitMutation(
              createCategory({ name: categoryName, description }),
              "Category added.",
            );
            if (saved) close();
          }}
        >
          <TextField
            label="Name"
            value={categoryName}
            onChange={event => setCategoryName(event.target.value)}
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={event => setDescription(event.target.value)}
          />
        </SubmitForm>
      </FinanceModal>
    </>
  );
}

function ScholarshipsPanel() {
  const [awardPage, setAwardPage] = useState(1);
  const awardLimit = 20;
  const { data: scholarships, isLoading } = useGetScholarshipsQuery({
    limit: 100,
  });
  const { data: awards } = useGetScholarshipAwardsQuery({
    limit: awardLimit,
    offset: (awardPage - 1) * awardLimit,
  });
  const { data: enrollments } = useGetEnrollsQuery({ limit: 100 });
  const [dialog, setDialog] = useState<"scholarship" | "award" | null>(null);
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">(
    "fixed",
  );
  const [value, setValue] = useState(0);
  const [description, setDescription] = useState("");
  const [scholarship, setScholarship] = useState(0);
  const [enroll, setEnroll] = useState(0);
  const [createScholarship] = useCreateScholarshipMutation();
  const [createAward] = useCreateScholarshipAwardMutation();
  if (isLoading) return <Loader />;
  return (
    <>
      <Stack direction="row" sx={{ justifyContent: "flex-end", gap: 1, mb: 2 }}>
        <CustomButton onClick={() => setDialog("scholarship")}>
          Define scholarship
        </CustomButton>
        <CustomButton onClick={() => setDialog("award")}>
          <AddIcon /> Award
        </CustomButton>
      </Stack>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Scholarship programs
      </Typography>
      {!scholarships?.results.length ? (
        <EmptyRows message="No scholarship programs defined." />
      ) : (
        <CustomTableContainer
          columns={["Name", "Type", "Value", "Description"]}
        >
          <TableBody>
            {scholarships.results.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.discount_type}</TableCell>
                <TableCell>
                  {item.value}
                  {item.discount_type === "percentage" ? "%" : ""}
                </TableCell>
                <TableCell>{item.description || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </CustomTableContainer>
      )}
      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Awards
      </Typography>
      {!awards?.results.length ? (
        <EmptyRows message="No scholarships awarded." />
      ) : (
        <CustomTableContainer
          columns={["Student", "Batch", "Scholarship", "Amount", "Awarded"]}
        >
          <TableBody>
            {awards.results.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.student_name}
                  <Typography variant="caption" sx={{ display: "block" }}>
                    {item.student_id}
                  </Typography>
                </TableCell>
                <TableCell>{item.batch_name}</TableCell>
                <TableCell>{item.scholarship_name}</TableCell>
                <TableCell>{item.amount}</TableCell>
                <TableCell>{formatDate(item.awarded_on)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </CustomTableContainer>
      )}
      {awards && awards.count > awardLimit && (
        <CustomPagination
          page={awardPage}
          count={Math.ceil(awards.count / awardLimit)}
          handleChange={(_, value) => setAwardPage(value)}
        />
      )}
      <FinanceModal
        title="Define scholarship"
        open={dialog === "scholarship"}
        onClose={() => setDialog(null)}
      >
        <SubmitForm
          onSubmit={async event => {
            event.preventDefault();
            const saved = await submitMutation(
              createScholarship({
                name,
                discount_type: discountType,
                value,
                description,
              }),
              "Scholarship created.",
            );
            if (saved) setDialog(null);
          }}
        >
          <TextField
            label="Name"
            value={name}
            onChange={event => setName(event.target.value)}
            required
          />
          <TextField
            select
            label="Discount type"
            value={discountType}
            onChange={event =>
              setDiscountType(event.target.value as "fixed" | "percentage")
            }
          >
            <MenuItem value="fixed">Fixed amount</MenuItem>
            <MenuItem value="percentage">Percentage</MenuItem>
          </TextField>
          <TextField
            label={discountType === "percentage" ? "Percentage" : "Amount"}
            type="number"
            value={value}
            onChange={event => setValue(Number(event.target.value))}
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={event => setDescription(event.target.value)}
          />
        </SubmitForm>
      </FinanceModal>
      <FinanceModal
        title="Award scholarship"
        open={dialog === "award"}
        onClose={() => setDialog(null)}
      >
        <SubmitForm
          onSubmit={async event => {
            event.preventDefault();
            const saved = await submitMutation(
              createAward({ scholarship, enroll, notes: description }),
              "Scholarship awarded.",
            );
            if (saved) setDialog(null);
          }}
        >
          <TextField
            select
            label="Scholarship"
            value={scholarship || ""}
            onChange={event => setScholarship(Number(event.target.value))}
            required
          >
            {scholarships?.results
              .filter(item => item.is_active)
              .map(item => (
                <MenuItem value={item.id} key={item.id}>
                  {item.name}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            select
            label="Enrollment"
            value={enroll || ""}
            onChange={event => setEnroll(Number(event.target.value))}
            required
          >
            {enrollments?.results
              .filter(item => item.status === "active")
              .map(item => (
                <MenuItem value={item.id} key={item.id}>
                  {item.student.user.full_name} — {item.batch.name}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            label="Notes"
            value={description}
            onChange={event => setDescription(event.target.value)}
          />
        </SubmitForm>
      </FinanceModal>
    </>
  );
}

function ReconciliationPanel() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading, isError, error } = useGetReconciliationsQuery({
    limit,
    offset: (page - 1) * limit,
  });
  const { data: methods } = useGetPaymentMethodsQuery({
    limit: 100,
    is_active: true,
  });
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState(0);
  const [businessDate, setBusinessDate] = useState(today());
  const [opening, setOpening] = useState(0);
  const [counted, setCounted] = useState(0);
  const [notes, setNotes] = useState("");
  const [createReconciliation] = useCreateReconciliationMutation();
  if (isLoading) return <Loader />;
  if (isError) return <ErrorDisplay error={error} />;
  return (
    <>
      <Stack direction="row" sx={{ justifyContent: "flex-end", mb: 2 }}>
        <CustomButton onClick={() => setOpen(true)}>
          <AddIcon /> Close day
        </CustomButton>
      </Stack>
      {!data?.results.length ? (
        <EmptyRows message="No reconciliations completed." />
      ) : (
        <CustomTableContainer
          columns={[
            "Date",
            "Method",
            "Opening",
            "Collections",
            "Expenses",
            "Expected",
            "Counted",
            "Variance",
          ]}
        >
          <TableBody>
            {data.results.map(item => (
              <TableRow key={item.id}>
                <TableCell>{formatDate(item.business_date)}</TableCell>
                <TableCell>{item.payment_method_name}</TableCell>
                <TableCell>{item.opening_balance}</TableCell>
                <TableCell>{item.collections}</TableCell>
                <TableCell>{item.expenses}</TableCell>
                <TableCell>{item.expected_balance}</TableCell>
                <TableCell>{item.counted_balance}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={item.variance}
                    color={Number(item.variance) === 0 ? "success" : "error"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </CustomTableContainer>
      )}
      {data && data.count > limit && (
        <CustomPagination
          page={page}
          count={Math.ceil(data.count / limit)}
          handleChange={(_, value) => setPage(value)}
        />
      )}
      <FinanceModal
        title="Cash reconciliation"
        open={open}
        onClose={() => setOpen(false)}
      >
        <SubmitForm
          label="Close and reconcile"
          onSubmit={async event => {
            event.preventDefault();
            const saved = await submitMutation(
              createReconciliation({
                payment_method: method,
                business_date: businessDate,
                opening_balance: opening,
                counted_balance: counted,
                notes,
              }),
              "Reconciliation completed.",
            );
            if (saved) setOpen(false);
          }}
        >
          <TextField
            select
            label="Payment method"
            value={method || ""}
            onChange={event => setMethod(Number(event.target.value))}
            required
          >
            {methods?.results.map(item => (
              <MenuItem value={item.id} key={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Business date"
            type="date"
            value={businessDate}
            onChange={event => setBusinessDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            required
          />
          <TextField
            label="Opening balance"
            type="number"
            value={opening}
            onChange={event => setOpening(Number(event.target.value))}
            required
          />
          <TextField
            label="Counted balance"
            type="number"
            value={counted}
            onChange={event => setCounted(Number(event.target.value))}
            required
          />
          <TextField
            label="Notes"
            value={notes}
            onChange={event => setNotes(event.target.value)}
          />
        </SubmitForm>
      </FinanceModal>
    </>
  );
}

function PaymentMethodsPanel() {
  const { data, isLoading, isError, error } = useGetPaymentMethodsQuery({
    limit: 100,
  });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [methodType, setMethodType] = useState<
    "cash" | "bank" | "mobile" | "other"
  >("cash");
  const [instructions, setInstructions] = useState("");
  const [createMethod] = useCreatePaymentMethodMutation();
  if (isLoading) return <Loader />;
  if (isError) return <ErrorDisplay error={error} />;
  return (
    <>
      <Stack direction="row" sx={{ justifyContent: "flex-end", mb: 2 }}>
        <CustomButton onClick={() => setOpen(true)}>
          <AddIcon /> Payment method
        </CustomButton>
      </Stack>
      {!data?.results.length ? (
        <EmptyRows message="No payment methods configured." />
      ) : (
        <CustomTableContainer
          columns={["Name", "Type", "Instructions", "Active"]}
        >
          <TableBody>
            {data.results.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.method_type}</TableCell>
                <TableCell>{item.instructions || "—"}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={item.is_active ? "Active" : "Inactive"}
                    color={item.is_active ? "success" : "default"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </CustomTableContainer>
      )}
      <FinanceModal
        title="Add payment method"
        open={open}
        onClose={() => setOpen(false)}
      >
        <SubmitForm
          onSubmit={async event => {
            event.preventDefault();
            const saved = await submitMutation(
              createMethod({ name, method_type: methodType, instructions }),
              "Payment method added.",
            );
            if (saved) setOpen(false);
          }}
        >
          <TextField
            label="Name"
            value={name}
            onChange={event => setName(event.target.value)}
            required
          />
          <TextField
            select
            label="Type"
            value={methodType}
            onChange={event =>
              setMethodType(event.target.value as typeof methodType)
            }
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="bank">Bank transfer</MenuItem>
            <MenuItem value="mobile">Mobile banking</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField
            label="Instructions"
            value={instructions}
            onChange={event => setInstructions(event.target.value)}
          />
        </SubmitForm>
      </FinanceModal>
    </>
  );
}

const panels = [
  { label: "Overview", content: <SummaryCards /> },
  { label: "Invoices", content: <InvoicesPanel /> },
  { label: "Expenses", content: <ExpensesPanel /> },
  { label: "Scholarships", content: <ScholarshipsPanel /> },
  { label: "Reconciliation", content: <ReconciliationPanel /> },
  { label: "Payment methods", content: <PaymentMethodsPanel /> },
];

export default function FinanceManagement() {
  const [tab, setTab] = useState(0);
  return (
    <>
      <CustomBreadcrumb
        list={[
          { label: "Dashboard", path: "/" },
          { label: "Finance", path: "/finance" },
        ]}
      />
      <PageContainer>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: { sm: "center" },
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="h4">Finance</Typography>
            <Typography color="text.secondary">
              Invoices, offline collections, scholarships, expenses and daily
              cash control
            </Typography>
          </Box>
          <Chip
            label="Manual payments only"
            color="primary"
            variant="outlined"
          />
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          {panels.map(panel => (
            <Tab label={panel.label} key={panel.label} />
          ))}
        </Tabs>
        {panels[tab].content}
      </PageContainer>
    </>
  );
}
