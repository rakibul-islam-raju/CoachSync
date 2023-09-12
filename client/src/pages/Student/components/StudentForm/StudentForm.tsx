import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Checkbox, FormControl, FormControlLabel } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { FC, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
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
  StudentCreateSchema,
} from "../StudentSchema";

type StudentFormProps = {
  onClose: () => void;
  defaultData?: IStudent;
};

const StudentForm: FC<StudentFormProps> = ({ onClose, defaultData }) => {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields, errors },
    setValue,
  } = useForm<IStudentCreateFormValues>({
    resolver: zodResolver(StudentCreateSchema),
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

  console.log("errors =>", errors);

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
          control={control}
          placeholder="Enter First Name"
          label="First Name"
        />
      </FormControl>
      <FormControl fullWidth required>
        <FormInputText
          name="user.last_name"
          type="text"
          control={control}
          placeholder="Enter Last Name"
          label="Last Name"
        />
      </FormControl>
      <FormControl fullWidth required>
        <FormInputText
          name="user.email"
          type="email"
          control={control}
          placeholder="Enter Email Address"
          label="Email Address"
        />
      </FormControl>
      <FormControl fullWidth required>
        <FormInputText
          name="user.phone"
          type="text"
          control={control}
          placeholder="Enter Phone Number"
          label="Phone Number"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          name="emergency_contact_no"
          type="text"
          control={control}
          placeholder="Enter Emergency Phone Number"
          label="Emergency Phone Number"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormSelectInput
          name="blood_group"
          control={control}
          label="Blood Group"
          options={BLOOD_GROUPS.map(i => ({ label: i, value: i }))}
        />
      </FormControl>
      <FormControl fullWidth>
        <DateInput
          name="date_of_birth"
          label="Date of Birth"
          control={control}
          value={dob}
          onChange={newVal => dateChangeHandler(newVal)}
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          multiline
          name="address"
          type="text"
          control={control}
          placeholder="Enter Address"
          label="Address"
        />
      </FormControl>
      <FormControl fullWidth>
        <FormInputText
          multiline
          name="description"
          type="text"
          control={control}
          placeholder="Enter Description"
          label="Description"
        />
      </FormControl>
      <FormControlLabel
        control={
          <Controller
            name={"is_active"}
            control={control}
            defaultValue={defaultData?.is_active ?? true}
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
      <CustomButton type="submit" disabled={isLoading || isEditLoading}>
        Save
      </CustomButton>

      {(isError || isEditError) && <ErrorDisplay error={error || editError} />}
    </Box>
  );
};

export default StudentForm;
