import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { FormInputText } from "../../../../components/forms/FormInputText";
import { ISubject } from "../../../../redux/subject/subject.type";
import {
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
} from "../../../../redux/subject/subjectApi";
import { getDirtyValues } from "../../../../utils/getDirtyValues";
import {
  ISubjectCreateFormValues,
  subjectCreateSchema,
  subjectUpdateSchema,
} from "../subjectSchema";

type SubjectFormProps = {
  onClose: () => void;
  defaultData?: ISubject;
};

const SubjectForm: FC<SubjectFormProps> = ({ onClose, defaultData }) => {
  const methods = useForm<ISubjectCreateFormValues>({
    resolver: zodResolver(
      defaultData ? subjectUpdateSchema : subjectCreateSchema,
    ),
    defaultValues: {
      name: defaultData?.name,
      code: defaultData?.code,
      is_active: defaultData?.is_active ?? true,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields, errors },
  } = methods;

  console.log("errors =>", methods.formState.errors);

  const [createSubject, { isLoading, isError, isSuccess, error }] =
    useCreateSubjectMutation();

  const [addAnother, setAddAnother] = useState<boolean>(false);

  const [
    updateSubject,
    {
      isLoading: isEditLoading,
      isError: isEditError,
      isSuccess: isEditSuccess,
      error: editError,
    },
  ] = useUpdateSubjectMutation();

  const onSubmit = (data: ISubjectCreateFormValues) => {
    if (defaultData) {
      if (isDirty) {
        const dirtyValues = getDirtyValues(dirtyFields, data);
        updateSubject({ id: defaultData.id, data: dirtyValues });
      }
    } else {
      console.log("data =>", data);

      return;
      createSubject(data);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Subject successfully created!");
      if (!addAnother) {
        onClose();
      }
      reset();
    }
    if (isEditSuccess) {
      toast.success("Subject successfully updated!");
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
            placeholder="Enter Subject Name"
            label="Subject Name"
            error={!!errors?.name}
            helperText={errors?.name?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormInputText
            name="code"
            type="text"
            placeholder="Enter Subject Code"
            label="Code"
            error={!!errors?.code}
            helperText={errors?.code?.message}
          />
        </FormControl>
        <FormControlLabel
          control={
            <Controller
              name={"is_active"}
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

        {(isError || isEditError) && (
          <ErrorDisplay error={error || editError} />
        )}
      </Box>
    </FormProvider>
  );
};

export default SubjectForm;
