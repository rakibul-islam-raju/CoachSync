import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { FormInputText } from "../../../../components/forms/FormInputText";
import FormSelectInput from "../../../../components/forms/FormSelectInput";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../../../redux/user/userApi";
import { getDirtyValues } from "../../../../utils/getDirtyValues";
import {
  EmployeeCreateSchema,
  IEmployeeCreateFormValues,
} from "../EmployeeSchema";

type EmployeeFormProps = {
  onClose: () => void;
  defaultData?: IUser;
};

const EmployeeForm: FC<EmployeeFormProps> = ({ onClose, defaultData }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields },
  } = useForm<IEmployeeCreateFormValues>({
    resolver: zodResolver(EmployeeCreateSchema),
    defaultValues: {
      first_name: defaultData?.first_name,
      last_name: defaultData?.last_name,
      email: defaultData?.email,
      phone: defaultData?.phone,
      role: defaultData?.role,
      is_active: defaultData?.is_active,
    },
  });

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
          control={control}
          placeholder="Enter First Name"
          label="First Name"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          name="last_name"
          type="text"
          control={control}
          placeholder="Enter Last Name"
          label="Last Name"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          name="email"
          type="email"
          control={control}
          placeholder="Enter Email Address"
          label="Email Address"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          name="phone"
          type="text"
          control={control}
          placeholder="Enter Phone Number"
          label="Phone Number"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormSelectInput
          name="role"
          control={control}
          label="Role"
          options={roleOptions}
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

export default EmployeeForm;
