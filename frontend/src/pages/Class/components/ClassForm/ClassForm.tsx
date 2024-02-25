/* eslint-disable react-hooks/exhaustive-deps */
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, FormControl } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import CheckboxField from "../../../../components/forms/CheckboxField";
import { FormInputText } from "../../../../components/forms/FormInputText";
import { IClass } from "../../../../redux/class/class.type";
import {
  useCreateClassMutation,
  useUpdateClassMutation,
} from "../../../../redux/class/classApi";
import { getDirtyValues } from "../../../../utils/getDirtyValues";
import {
  IClassCreateFormValues,
  classCreateSchema,
  classUpdateSchema,
} from "../classSchema";

type ClassFormProps = {
  onClose: () => void;
  defaultData?: IClass;
};

const ClassForm: FC<ClassFormProps> = ({ onClose, defaultData }) => {
  const methods = useForm<IClassCreateFormValues>({
    resolver: zodResolver(defaultData ? classUpdateSchema : classCreateSchema),
    defaultValues: {
      name: defaultData?.name,
      numeric: defaultData?.numeric,
      is_active: defaultData?.is_active ?? true,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields, errors },
  } = methods;

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
      if (isDirty) {
        const dirtyValues = getDirtyValues(dirtyFields, data);
        updateClass({ id: defaultData.id, data: dirtyValues });
      }
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
  }, [isSuccess, isEditSuccess]);

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
        <FormControl fullWidth>
          <FormInputText
            name="name"
            type="text"
            placeholder="Enter Class Name"
            label="Class Name"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormInputText
            name="numeric"
            type="number"
            placeholder="Enter Class in numeruc"
            label="Numeric"
            error={!!errors.numeric}
            helperText={errors.numeric?.message}
          />
        </FormControl>
        <CheckboxField name="is_active" label="Active Status" />

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

        {(isError || isEditError) && (
          <ErrorDisplay error={error || editError} />
        )}
      </Box>
    </FormProvider>
  );
};

export default ClassForm;
