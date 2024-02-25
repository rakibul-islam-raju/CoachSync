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
import { ITeacher } from "../../../../redux/teacher/teacher.type";
import {
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
} from "../../../../redux/teacher/teacherApi";
import { getDirtyValues } from "../../../../utils/getDirtyValues";
import {
  ITeacherCreateFormValues,
  teacherCreateSchema,
  teacherUpdateSchema,
} from "../TeacherSchema";

type TeacherFormProps = {
  onClose: () => void;
  defaultData?: ITeacher;
};

const TeacherForm: FC<TeacherFormProps> = ({ onClose, defaultData }) => {
  const methods = useForm<ITeacherCreateFormValues>({
    resolver: zodResolver(
      defaultData ? teacherUpdateSchema : teacherCreateSchema,
    ),
    defaultValues: {
      user: {
        first_name: defaultData?.user.first_name,
        last_name: defaultData?.user.last_name,
        email: defaultData?.user.email,
        phone: defaultData?.user.phone,
      },
      is_active: defaultData?.is_active,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields, errors },
  } = methods;

  const [createTeacher, { isLoading, isError, isSuccess, error }] =
    useCreateTeacherMutation();

  const [addAnother, setAddAnother] = useState<boolean>(false);

  const [
    updateTeacher,
    {
      isLoading: isEditLoading,
      isError: isEditError,
      isSuccess: isEditSuccess,
      error: editError,
    },
  ] = useUpdateTeacherMutation();

  const onSubmit = (data: ITeacherCreateFormValues) => {
    if (defaultData) {
      if (isDirty) {
        const dirtyValues = getDirtyValues(dirtyFields, data);
        updateTeacher({ id: defaultData.id, data: dirtyValues });
      }
    } else {
      createTeacher(data);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Teacher successfully created!");
      if (!addAnother) {
        onClose();
      }
      reset();
    }
    if (isEditSuccess) {
      toast.success("Teacher successfully updated!");
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
            name="user.first_name"
            type="text"
            placeholder="Enter First Name"
            label="First Name"
            error={!!errors.user?.first_name}
            helperText={errors.user?.first_name?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormInputText
            name="user.last_name"
            type="text"
            placeholder="Enter Last Name"
            label="Last Name"
            error={!!errors.user?.last_name}
            helperText={errors.user?.last_name?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormInputText
            name="user.email"
            type="email"
            placeholder="Enter Email Address"
            label="Email Address"
            error={!!errors.user?.email}
            helperText={errors.user?.email?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormInputText
            name="user.phone"
            type="text"
            placeholder="Enter Phone Number"
            label="Phone Number"
            error={!!errors.user?.phone}
            helperText={errors.user?.phone?.message}
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

export default TeacherForm;
