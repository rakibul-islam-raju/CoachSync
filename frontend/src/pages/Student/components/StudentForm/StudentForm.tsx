/* eslint-disable react-hooks/exhaustive-deps */
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, FormControl } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { FC, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import CheckboxField from "../../../../components/forms/CheckboxField";
import DateInput from "../../../../components/forms/DateInput";
import { FormInputText } from "../../../../components/forms/FormInputText";
import FormSelectInput from "../../../../components/forms/FormSelectInput";
import { BLOOD_GROUPS } from "../../../../constants/student.constants";
import { IStudent } from "../../../../redux/student/student.type";
import {
  useCreateStudentMutation,
  useUpdateStudentMutation,
} from "../../../../redux/student/studentApi";
import { getDirtyValues } from "../../../../utils/getDirtyValues";
import {
  IStudentCreateFormValues,
  studentCreateSchema,
} from "../StudentSchema";

type StudentFormProps = {
  onClose: () => void;
  defaultData?: IStudent;
};

const StudentForm: FC<StudentFormProps> = ({ onClose, defaultData }) => {
  const navigate = useNavigate();
  const methods = useForm<IStudentCreateFormValues>({
    resolver: zodResolver(
      defaultData ? studentCreateSchema : studentCreateSchema,
    ),
    defaultValues: {
      user: {
        first_name: defaultData?.user.first_name,
        last_name: defaultData?.user.last_name,
        email: defaultData?.user.email,
        phone: defaultData?.user.phone,
      },
      emergency_contact_no: defaultData?.emergency_contact_no,
      date_of_birth: defaultData?.date_of_birth,
      blood_group: defaultData?.blood_group,
      address: defaultData?.blood_group,
      description: defaultData?.description,
      is_active: defaultData?.is_active,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields, errors },
    setValue,
  } = methods;

  const [
    createStudent,
    { data: createdData, isLoading, isError, isSuccess, error },
  ] = useCreateStudentMutation();

  const [dob, setDob] = useState<Dayjs | null>(
    dayjs(defaultData?.date_of_birth),
  );

  const [
    updateStudent,
    {
      isLoading: isEditLoading,
      isError: isEditError,
      isSuccess: isEditSuccess,
      error: editError,
    },
  ] = useUpdateStudentMutation();

  const dateChangeHandler = (date: Dayjs | null) => {
    if (date) {
      const formattedDate = date.format("YYYY-MM-DD");
      setDob(dayjs(date));
      setValue("date_of_birth", formattedDate);
    }
  };

  const onSubmit = (data: IStudentCreateFormValues) => {
    if (defaultData) {
      if (isDirty) {
        const dirtyValues = getDirtyValues(dirtyFields, data);
        updateStudent({ id: defaultData.id, data: dirtyValues });
      }
    } else {
      createStudent(data);
    }
  };

  useEffect(() => {
    if (isSuccess && createdData) {
      toast.success("Student successfully created!");
      navigate(`/students/${createdData.student_id}`);
      onClose();
      reset();
    }
    if (isEditSuccess) {
      toast.success("Student successfully updated!");
      onClose();
      reset();
    }
  }, [isSuccess, isEditSuccess, createdData]);

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
        <FormControl fullWidth required>
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

        <FormControl fullWidth>
          <FormInputText
            name="emergency_contact_no"
            type="text"
            placeholder="Enter Emergency Phone Number"
            label="Emergency Phone Number"
            error={!!errors.emergency_contact_no}
            helperText={errors.emergency_contact_no?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormSelectInput
            name="blood_group"
            label="Blood Group"
            options={BLOOD_GROUPS.map(i => ({ label: i, value: i }))}
            error={!!errors.blood_group}
            helperText={errors.blood_group?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <DateInput
            name="date_of_birth"
            label="Date of Birth"
            value={dob}
            onChange={newVal => dateChangeHandler(newVal)}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormInputText
            multiline
            name="address"
            type="text"
            placeholder="Enter Address"
            label="Address"
            error={!!errors.address}
            helperText={errors.address?.message}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormInputText
            multiline
            rows={3}
            name="description"
            type="text"
            placeholder="Enter Description"
            label="Description"
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        </FormControl>
        <CheckboxField name="is_active" label="Active Status" />

        <CustomButton type="submit" disabled={isLoading || isEditLoading}>
          Save
        </CustomButton>

        {(isError || isEditError) && (
          <ErrorDisplay error={error || editError} />
        )}
      </Box>
    </FormProvider>
  );
};

export default StudentForm;
