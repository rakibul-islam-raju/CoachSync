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
import FormSelectInput from "../../../../components/forms/FormSelectInput";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../../../redux/user/userApi";
import { getDirtyValues } from "../../../../utils/getDirtyValues";
import {
  EmployeeCreateSchema,
  EmployeeUpdateSchema,
  IEmployeeCreateFormValues,
} from "../EmployeeSchema";

type EmployeeFormProps = {
  onClose: () => void;
  defaultData?: IUser;
};

const EmployeeForm: FC<EmployeeFormProps> = ({ onClose, defaultData }) => {
  const methods = useForm<IEmployeeCreateFormValues>({
    resolver: zodResolver(
      defaultData ? EmployeeUpdateSchema : EmployeeCreateSchema,
    ),
    defaultValues: {
      first_name: defaultData?.first_name,
      last_name: defaultData?.last_name,
      email: defaultData?.email,
      phone: defaultData?.phone,
      role: defaultData?.role,
      is_active: defaultData?.is_active,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields, errors },
  } = methods;

  const [createUser, { isLoading, isError, isSuccess, error }] =
    useCreateUserMutation();

  const [addAnother, setAddAnother] = useState<boolean>(false);

  const [
    updateUser,
    {
      isLoading: isEditLoading,
      isError: isEditError,
      isSuccess: isEditSuccess,
      error: editError,
    },
  ] = useUpdateUserMutation();

  const onSubmit = (data: IEmployeeCreateFormValues) => {
    if (defaultData) {
      if (isDirty) {
        const dirtyValues = getDirtyValues(dirtyFields, data);
        updateUser({ id: defaultData.id, user: dirtyValues });
      }
    } else {
      createUser(data);
    }
  };

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "admin_staff", label: "Admin Staff" },
    { value: "org_admin", label: "Organization Admin" },
    { value: "org_staff", label: "Organization Staff" },
  ];

  useEffect(() => {
    if (isSuccess) {
      toast.success("User successfully created!");
      if (!addAnother) {
        onClose();
      }
      reset();
    }
    if (isEditSuccess) {
      toast.success("User successfully updated!");
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
            name="first_name"
            type="text"
            placeholder="Enter First Name"
            label="First Name"
            error={!!errors.first_name}
            helperText={errors.first_name?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormInputText
            name="last_name"
            type="text"
            placeholder="Enter Last Name"
            label="Last Name"
            error={!!errors.last_name}
            helperText={errors.last_name?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormInputText
            name="email"
            type="email"
            placeholder="Enter Email Address"
            label="Email Address"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormInputText
            name="phone"
            type="text"
            placeholder="Enter Phone Number"
            label="Phone Number"
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormSelectInput
            name="role"
            label="Role"
            options={roleOptions}
            error={!!errors.role}
            helperText={errors.role?.message}
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

export default EmployeeForm;
