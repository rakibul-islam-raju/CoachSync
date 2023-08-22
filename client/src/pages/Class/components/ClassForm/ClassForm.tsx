import { Box, Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { FormInputText } from "../../../../components/forms/FormInputText";
import { IClassCreateFormValues, classCreateSchema } from "../classSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import {
  useCreateClassMutation,
  useUpdateClassMutation,
} from "../../../../redux/class/classApi";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { FC, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { IClass } from "../../../../redux/class/class.type";

type ClassFormProps = {
  onClose: () => void;
  defaultData?: IClass;
};

const ClassForm: FC<ClassFormProps> = ({ onClose, defaultData }) => {
  const { control, handleSubmit, reset } = useForm<IClassCreateFormValues>({
    resolver: zodResolver(classCreateSchema),
    defaultValues: {
      name: defaultData?.name ?? "",
      numeric: defaultData?.numeric ?? 0,
      is_active: defaultData?.is_active ?? true,
    },
  });

  const [createClass, { isLoading, isError, isSuccess, error }] =
    useCreateClassMutation();

  const [addAnother, setAddAnother] = useState<boolean>(false);

  const [
    updateClass,
    {
      isLoading: isEditLoading,
      isError: isEditError,
      isSuccess: isEditSuccess,
      error: editError,
    },
  ] = useUpdateClassMutation();

  const onSubmit = (data: IClassCreateFormValues) => {
    if (defaultData) {
      updateClass({ id: defaultData.id, data });
    } else {
      createClass(data);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Class successfully created!");
      if (!addAnother) {
        onClose();
      }
      reset();
    }
    if (isEditSuccess) {
      toast.success("Class successfully updated!");
      if (!addAnother) {
        onClose();
      }
      reset();
    }
  }, [isSuccess, isEditSuccess, onClose, addAnother, reset]);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      gap={2}
      component={"form"}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormControl fullWidth>
        <FormInputText
          name="name"
          type="text"
          control={control}
          placeholder="Enter Class Name"
          label="Class Name"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          name="numeric"
          type="number"
          control={control}
          placeholder="Enter Class in numeruc"
          label="Numeric"
        />
      </FormControl>
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
      <CustomButton
        onClick={() => setAddAnother(true)}
        type="submit"
        variant="outlined"
        disabled={isLoading || isEditLoading}
      >
        Save and Add Another
      </CustomButton>

      {(isError || isEditError) && <ErrorDisplay error={error || editError} />}
    </Box>
  );
};

export default ClassForm;
