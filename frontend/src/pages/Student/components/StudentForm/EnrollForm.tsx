import { zodResolver } from "@hookform/resolvers/zod";
import { Box, FormControl } from "@mui/material";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { FormInputText } from "../../../../components/forms/FormInputText";
import FormSelectInput from "../../../../components/forms/FormSelectInput";
import { useGetBatchesQuery } from "../../../../redux/batch/batchApi";
import { IEnroll } from "../../../../redux/enroll/enroll.type";
import {
  useCreateEnrollMutation,
  useUpdateEnrollMutation,
} from "../../../../redux/enroll/enrollApi";
import { IStudent } from "../../../../redux/student/student.type";
import { useGetUsersQuery } from "../../../../redux/user/userApi";
import { getDirtyValues } from "../../../../utils/getDirtyValues";
import {
  IStudentEnrollFormValues,
  StudentEnrollSchema,
} from "../StudentSchema";

type EnrollFormProps = {
  studentData?: IStudent;
  defaultData?: IEnroll;
  onClose?: () => void;
  handleShowTransaction?: () => void;
  handleSetEnroll?: (data: IEnroll) => void;
};

const EnrollForm: FC<EnrollFormProps> = ({
  onClose,
  studentData,
  defaultData,
  handleSetEnroll,
  handleShowTransaction,
}) => {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields },
    setValue,
    watch,
  } = useForm<IStudentEnrollFormValues>({
    resolver: zodResolver(StudentEnrollSchema),
    defaultValues: {
      student: studentData?.id,
      batch: defaultData?.batch.id,
      total_amount: defaultData?.total_amount,
      discount_amount: defaultData?.discount_amount,
      reference_by: defaultData?.reference_by.id,
    },
  });

  const [
    createEnroll,
    { data: createdData, isLoading, isError, isSuccess, error },
  ] = useCreateEnrollMutation();

  const [
    updateEnroll,
    {
      isLoading: isEditLoading,
      isError: isEditError,
      isSuccess: isEditSuccess,
      error: editError,
    },
  ] = useUpdateEnrollMutation();

  const { data: batches } = useGetBatchesQuery({ limit: 50, offset: 0 });
  const { data: users } = useGetUsersQuery({ limit: 50, offset: 0 });
  // const [due, setDue] = useState<number | null>(null);

  const [batch] = watch(["batch", "total_amount", "discount_amount"]);

  const onSubmit = (data: IStudentEnrollFormValues) => {
    if (defaultData) {
      if (isDirty) {
        const dirtyValues = getDirtyValues(dirtyFields, data);
        updateEnroll({ id: defaultData.id, data: dirtyValues });
      }
    } else {
      createEnroll(data);
    }
  };

  useEffect(() => {
    // get batch fee and set to total amout
    if (batch) {
      const selectedBatch = batches?.results.find(i => i.id === batch);
      if (selectedBatch) {
        setValue("total_amount", Number(selectedBatch.fee), {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    }
  }, [setValue, batch]);

  useEffect(() => {
    if (isSuccess && studentData) {
      if (createdData && handleSetEnroll && handleShowTransaction) {
        handleSetEnroll(createdData);
        handleShowTransaction();
      }
      toast.success("Student successfully enrolled!");
      navigate(`/students/${studentData.student_id}`);
      onClose && onClose();
      reset();
    }

    if (isEditSuccess) {
      toast.success("Enroll successfully updated!");
      onClose && onClose();
      reset();
    }
  }, [isSuccess, isEditSuccess]);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      gap={2}
      component={"form"}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* TODO:autocomplete */}
      <FormControl fullWidth>
        <FormSelectInput
          name="batch"
          control={control}
          label="Batch"
          options={batches?.results.map(i => ({ label: i.name, value: i.id }))}
        />
      </FormControl>
      <FormControl fullWidth required>
        <FormInputText
          name="total_amount"
          type="number"
          control={control}
          placeholder="Enter Total Amount"
          label="Total Amount"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          name="discount_amount"
          type="number"
          control={control}
          placeholder="Enter Discount Amount"
          label="Discount Amount"
        />
      </FormControl>
      {/* TODO: autocomplete */}
      <FormControl fullWidth>
        <FormSelectInput
          name="reference_by"
          control={control}
          label="Reference By"
          options={users?.results.map(i => ({
            label: `${i.first_name} ${i.last_name}`,
            value: i.id,
          }))}
        />
      </FormControl>

      <CustomButton type="submit" disabled={isLoading || isEditLoading}>
        Save
      </CustomButton>

      {(isError || isEditError) && <ErrorDisplay error={error || editError} />}
    </Box>
  );
};

export default EnrollForm;
