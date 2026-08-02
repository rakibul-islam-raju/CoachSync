import { createZodResolver } from "../../../../utils/formResolver";
import { Box, FormControl } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { FormInputText } from "../../../../components/forms/FormInputText";
import FormSelectInput from "../../../../components/forms/FormSelectInput";
import {
  useGetInvoicesQuery,
  useGetPaymentMethodsQuery,
} from "../../../../redux/finance/financeApi";
import { IEnroll } from "../../../../redux/enroll/enroll.type";
import { IEnrollsForStudentDetails } from "../../../../redux/student/student.type";
import { ITransactionCreateReqData } from "../../../../redux/transaction/transaction.type";
import { useCreategetTransactionMutation } from "../../../../redux/transaction/transactionApi";
import { ITransactionFormValues, TransactionSchema } from "../StudentSchema";

function isEnrollsForStudentDetails(
  data: IEnroll | IEnrollsForStudentDetails,
): data is IEnrollsForStudentDetails {
  return (
    typeof data === "object" && "total_amount" in data && "total_paid" in data
  );
}

type TransactionFormProps = {
  onClose: () => void;
  enrollData?: IEnroll | IEnrollsForStudentDetails;
};

const TransactionForm: FC<TransactionFormProps> = ({ onClose, enrollData }) => {
  const methods = useForm<ITransactionCreateReqData>({
    resolver: createZodResolver<ITransactionCreateReqData>(TransactionSchema),
    defaultValues: {
      enroll: enrollData?.id,
      amount: 0,
      remark: null,
      payment_method: 0,
      installment: 0,
      reference_number: "",
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const transactionAmount = watch("amount");

  const [createTransaction, { isLoading, isError, isSuccess, error }] =
    useCreategetTransactionMutation();

  const [dueAmount, setDueAmount] = useState<number | undefined>();
  const { data: paymentMethods } = useGetPaymentMethodsQuery({
    limit: 100,
    is_active: true,
  });
  const { data: invoices } = useGetInvoicesQuery(
    { limit: 1, enroll: enrollData?.id },
    { skip: !enrollData?.id },
  );
  const installments = invoices?.results[0]?.installments ?? [];

  const onSubmit = (data: ITransactionFormValues) => {
    createTransaction({
      ...data,
      payment_method: data.payment_method || undefined,
      installment: data.installment || undefined,
    });
  };

  useEffect(() => {
    if (paymentMethods?.results[0]) {
      setValue("payment_method", paymentMethods.results[0].id);
    }
  }, [paymentMethods, setValue]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction Successfull!");
      onClose();
      reset();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (
      enrollData &&
      isEnrollsForStudentDetails(enrollData) &&
      enrollData?.net_payable !== undefined &&
      enrollData?.total_paid !== undefined
    ) {
      const amount =
        enrollData.net_payable -
        (transactionAmount + (enrollData.total_paid ?? 0));

      setDueAmount(amount);
    }
  }, [enrollData, transactionAmount]);

  return (
    <FormProvider {...methods}>
      <Box
        component={"form"}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <FormControl fullWidth required>
          <FormInputText
            name="amount"
            type="number"
            placeholder="Enter Amount"
            label="Amount"
            error={!!errors.amount || (!!dueAmount && dueAmount < 0)}
            helperText={errors.amount?.message || `Total Due: ${dueAmount}`}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormSelectInput
            name="payment_method"
            label="Payment Method"
            options={paymentMethods?.results.map(method => ({
              value: method.id,
              label: method.name,
            }))}
          />
        </FormControl>
        {installments.length > 0 && (
          <FormControl fullWidth>
            <FormSelectInput
              name="installment"
              label="Installment (optional)"
              options={[
                { value: 0, label: "No specific installment" },
                ...installments
                  .filter(installment => installment.balance > 0)
                  .map(installment => ({
                    value: installment.id,
                    label: `${installment.title} — due ${installment.balance}`,
                  })),
              ]}
            />
          </FormControl>
        )}
        <FormControl fullWidth>
          <FormInputText
            name="reference_number"
            type="text"
            placeholder="Receipt, bank, or mobile reference"
            label="Reference Number"
            error={!!errors.reference_number}
            helperText={errors.reference_number?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormInputText
            name="remark"
            type="text"
            placeholder="Enter Remark"
            label="Remark"
            error={!!errors.remark}
            helperText={errors.remark?.message}
          />
        </FormControl>

        <CustomButton type="submit" disabled={isLoading}>
          Save
        </CustomButton>

        {isError && <ErrorDisplay error={error} />}
      </Box>
    </FormProvider>
  );
};

export default TransactionForm;
