import { zodResolver } from "@hookform/resolvers/zod";
import { Box, FormControl } from "@mui/material";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { FormInputText } from "../../../../components/forms/FormInputText";
import { IEnroll } from "../../../../redux/enroll/enroll.type";
import { ITransactionCreateReqData } from "../../../../redux/transaction/transaction.type";
import { useCreategetTransactionMutation } from "../../../../redux/transaction/transactionApi";
import { ITransactionFormValues, TransactionSchema } from "../StudentSchema";

type TransactionFormProps = {
  onClose: () => void;
  enrollData?: IEnroll;
};

const TransactionForm: FC<TransactionFormProps> = ({ onClose, enrollData }) => {
  const { control, handleSubmit, reset, watch } =
    useForm<ITransactionCreateReqData>({
      resolver: zodResolver(TransactionSchema),
      defaultValues: {
        enroll: enrollData?.id,
        amount: 0,
        remark: null,
      },
    });

  const [createTransaction, { isLoading, isError, isSuccess, error }] =
    useCreategetTransactionMutation();

  //   const [due, setDue] = useState<number | null>(null);

  const [amount] = watch(["amount"]);

  console.log("amount =>", amount);

  const onSubmit = (data: ITransactionFormValues) => {
    console.log("data=>", data);

    createTransaction(data);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction Successfull!");
      onClose();
      reset();
    }
  }, [isSuccess]);

  return (
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
          control={control}
          placeholder="Enter Amount"
          label="Amount"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          name="remark"
          type="text"
          control={control}
          placeholder="Enter Remark"
          label="Remark"
        />
      </FormControl>

      <CustomButton type="submit" disabled={isLoading}>
        Save
      </CustomButton>

      {isError && <ErrorDisplay error={error} />}
    </Box>
  );
};

export default TransactionForm;
