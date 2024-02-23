/* eslint-disable @typescript-eslint/no-unused-vars */
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Checkbox, FormControl, FormControlLabel } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import DateInput from "../../../../components/forms/DateInput";
import { FormInputText } from "../../../../components/forms/FormInputText";
import FormSelectInput from "../../../../components/forms/FormSelectInput";
import { IBatch } from "../../../../redux/batch/batch.type";
import {
  useCreateBatchMutation,
  useUpdateBatchMutation,
} from "../../../../redux/batch/batchApi";
import { useGetClassesQuery } from "../../../../redux/class/classApi";
import { getDirtyValues } from "../../../../utils/getDirtyValues";
import { IBatchCreateFormValues, batchCreateSchema } from "../batchSchema";

type BatchFormProps = {
  onClose: () => void;
  defaultData?: IBatch;
};

const BatchForm: FC<BatchFormProps> = ({ onClose, defaultData }) => {
  console.log("defaultData?.classs.id =>", defaultData);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, dirtyFields },
  } = useForm<IBatchCreateFormValues>({
    resolver: zodResolver(batchCreateSchema),
    defaultValues: {
      name: defaultData?.name,
      code: defaultData?.code,
      fee: defaultData?.fee,
      classs: defaultData?.classs.id,
      start_date: defaultData?.start_date,
      end_date: defaultData?.end_date,
      is_active: defaultData?.is_active,
    },
  });

  const [createBatch, { isLoading, isError, isSuccess, error }] =
    useCreateBatchMutation();

  const { data: clases } = useGetClassesQuery({ limit: 50, offset: 0 });

  const [addAnother, setAddAnother] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs(defaultData?.start_date),
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    dayjs(defaultData?.end_date),
  );

  const [
    updateBatch,
    {
      isLoading: isEditLoading,
      isError: isEditError,
      isSuccess: isEditSuccess,
      error: editError,
    },
  ] = useUpdateBatchMutation();

  const onSubmit = (data: IBatchCreateFormValues) => {
    if (defaultData) {
      if (isDirty) {
        const dirtyValues = getDirtyValues(dirtyFields, data);
        updateBatch({ id: defaultData.id, data: dirtyValues });
      }
    } else {
      createBatch(data);
    }
  };

  const dateChangeHandler = (
    date: Dayjs | null,
    field: "start_date" | "end_date",
  ) => {
    if (date) {
      const formattedDate = date.format("YYYY-MM-DD");
      if (field === "start_date") {
        setStartDate(dayjs(date));
        setValue("start_date", formattedDate);
      } else {
        setEndDate(dayjs(date));
        setValue("end_date", formattedDate);
      }
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Batch successfully created!");
      if (!addAnother) {
        onClose();
      }
      reset();
    }
    if (isEditSuccess) {
      toast.success("Batch successfully updated!");
      if (!addAnother) {
        onClose();
      }
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
      <FormControl fullWidth required>
        <FormInputText
          name="name"
          type="text"
          control={control}
          placeholder="Enter Batch Name"
          label="Batch Name"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          name="code"
          type="text"
          control={control}
          placeholder="Enter Batch Code"
          label="Code"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          name="fee"
          type="number"
          control={control}
          placeholder="Enter Batch Fee"
          label="Batch Fee"
        />
      </FormControl>
      <FormControl fullWidth>
        <DateInput
          label="Start Date"
          name={"start_date"}
          value={startDate}
          control={control}
          onChange={newDate => dateChangeHandler(newDate, "start_date")}
        />
      </FormControl>
      <FormControl fullWidth>
        <DateInput
          label="End Date"
          name={"end_date"}
          value={endDate}
          control={control}
          onChange={newDate => dateChangeHandler(newDate, "end_date")}
        />
      </FormControl>
      <FormSelectInput
        control={control}
        name="classs"
        label="Select Class"
        options={clases?.results.map(option => ({
          label: String(option.numeric),
          value: option.id,
        }))}
      />
      <FormControlLabel
        control={
          <Controller
            name={"is_active"}
            control={control}
            render={({ field: props }) => (
              <Checkbox
                {...props}
                checked={props.value}
                onChange={e => props.onChange(e.target.checked)}
              />
            )}
          />
        }
        label={"Active Status"}
      />
      <CustomButton
        onClick={() => setAddAnother(false)}
        type="submit"
        disabled={isLoading || isEditLoading}
      >
        Save
      </CustomButton>
      {!defaultData && (
        <CustomButton
          onClick={() => setAddAnother(true)}
          type="submit"
          variant="outlined"
          disabled={isLoading || isEditLoading}
        >
          Save and Add Another
        </CustomButton>
      )}

      {(isError || isEditError) && <ErrorDisplay error={error || editError} />}
    </Box>
  );
};

export default BatchForm;
