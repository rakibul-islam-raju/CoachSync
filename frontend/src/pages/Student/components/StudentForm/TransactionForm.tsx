/* eslint-disable react-hooks/exhaustive-deps */
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, FormControl } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { FormInputText } from "../../../../components/forms/FormInputText";
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
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      enroll: enrollData?.id,
      amount: 0,
      remark: null,
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const transactionAmount = watch("amount");

  console.log("transactionAmount =>", transactionAmount);

  const [createTransaction, { isLoading, isError, isSuccess, error }] =
    useCreategetTransactionMutation();

  const [dueAmount, setDueAmount] = useState<number | undefined>();

  const onSubmit = (data: ITransactionFormValues) => {
    createTransaction(data);
  };

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
      enrollData?.total_amount &&
      enrollData?.total_paid
    ) {
      const amount =
        enrollData?.total_amount - (transactionAmount + enrollData?.total_paid);

      setDueAmount(amount);
    }
  }, [enrollData, transactionAmount]);

  return (
    <FormProvider {...methods}>
      <Box
        display={"flex"}
        flexDirection={"column"}
        gap={2}
        component={"form"}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
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
