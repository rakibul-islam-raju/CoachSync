import { Box, Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { FormInputText } from "../../../../components/forms/FormInputText";
import {
  ITeacherCreateFormValues,
  TeacherCreateSchema,
} from "../TeacherSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { FC, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ITeacher } from "../../../../redux/teacher/teacher.type";
import {
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
} from "../../../../redux/teacher/teacherApi";

type TeacherFormProps = {
  onClose: () => void;
  defaultData?: ITeacher;
};

const TeacherForm: FC<TeacherFormProps> = ({ onClose, defaultData }) => {
  const { control, handleSubmit, reset } = useForm<ITeacherCreateFormValues>({
    resolver: zodResolver(TeacherCreateSchema),
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
      updateTeacher({ id: defaultData.id, data });
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
          name="user.first_name"
          type="text"
          control={control}
          placeholder="Enter First Name"
          label="First Name"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          name="user.last_name"
          type="text"
          control={control}
          placeholder="Enter Last Name"
          label="Last Name"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          name="user.email"
          type="email"
          control={control}
          placeholder="Enter Email Address"
          label="Email Address"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          name="user.phone"
          type="text"
          control={control}
          placeholder="Enter Phone Number"
          label="Phone Number"
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

export default TeacherForm;
