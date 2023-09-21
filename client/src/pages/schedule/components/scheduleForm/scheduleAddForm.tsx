import { zodResolver } from "@hookform/resolvers/zod";
import { Box, FormControl } from "@mui/material";
import { parse } from "date-fns";
import dayjs, { Dayjs } from "dayjs";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import DateInput from "../../../../components/forms/DateInput";
import { FormInputText } from "../../../../components/forms/FormInputText";
import FormSelectInput from "../../../../components/forms/FormSelectInput";
import TimeInput from "../../../../components/forms/TimeInput";
import { IBatch } from "../../../../redux/batch/batch.type";
import { useGetBatchesQuery } from "../../../../redux/batch/batchApi";
import { IExam } from "../../../../redux/exam/exam.type";
import { useAppDispatch } from "../../../../redux/hook";
import {
  ISchedule,
  IScheduleDemoData,
} from "../../../../redux/schedule/schedule.type";
import { useUpdateScheduleMutation } from "../../../../redux/schedule/scheduleApi";
import { addDraftSchedule } from "../../../../redux/schedule/scheduleSlice";
import { ISubject } from "../../../../redux/subject/subject.type";
import { useGetSubjectsQuery } from "../../../../redux/subject/subjectApi";
import { ITeacher } from "../../../../redux/teacher/teacher.type";
import { useGetTeachersQuery } from "../../../../redux/teacher/teacherApi";
import {
  IScheduleCreateFormValues,
  scheduleCreateSchema,
} from "../scheduleSchema";

function isSchedule(value: IScheduleDemoData | ISchedule): ISchedule {
  return value as ISchedule;
}

type Props = {
  editData?: IScheduleDemoData | ISchedule | null;
  handleRemoveFromEdit?: () => void;
  onClose?: () => void;
  edit?: boolean;
};

const ScheduleAddForm: FC<Props> = ({
  editData,
  handleRemoveFromEdit,
  onClose,
  edit = false,
}) => {
  const dispatch = useAppDispatch();

  // Use the useForm hook with default values
  const { control, handleSubmit, setValue, watch, reset } =
    useForm<IScheduleCreateFormValues>({
      resolver: zodResolver(scheduleCreateSchema),
      defaultValues: {
        // Initialize default values based on editData
        title: editData?.title || "",
        batch: editData?.batch?.id || undefined,
        subject: editData?.subject?.id || undefined,
        teacher: editData?.teacher?.id || undefined,
        exam: editData?.exam?.id || undefined,
        duration: editData?.duration || undefined,
        date: editData?.date || undefined,
        time: editData?.time || undefined,
      },
    });

  const { data: batches } = useGetBatchesQuery({ limit: 50, offset: 0 });
  const { data: subjects } = useGetSubjectsQuery({ limit: 50, offset: 0 });
  const { data: teachers } = useGetTeachersQuery({ limit: 50, offset: 0 });
  const [updateSchedule, { isLoading, isError, error, isSuccess }] =
    useUpdateScheduleMutation();

  const [selectedSub, setSelectedSub] = useState<ISubject | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<IBatch | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<ITeacher | null>(null);
  const [selectedExam, setSelectedExam] = useState<IExam | null>(null);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<Dayjs | null>(null);

  const [batch, subject, teacher, exam] = watch([
    "batch",
    "subject",
    "teacher",
    "exam",
  ]);

  const onSubmit = (data: IScheduleCreateFormValues) => {
    if (edit && editData && isSchedule(editData)) {
      updateSchedule({ id: isSchedule(editData).id, data });
    } else {
      if (selectedBatch && selectedSub) {
        const newData = {
          uuid: crypto.randomUUID(),
          batch: selectedBatch,
          subject: selectedSub,
          teacher: selectedTeacher,
          exam: selectedExam,
          date: data.date,
          time: data.time,
          title: data.title,
          duration: data.duration,
        };

        dispatch(addDraftSchedule(newData));
        if (editData && handleRemoveFromEdit) handleRemoveFromEdit();
      }
    }
  };

  const dateChangeHandler = (d: Dayjs | null) => {
    if (d) {
      const formattedDate = d.format("YYYY-MM-DD");
      setDate(dayjs(d));
      setValue("date", formattedDate);
    }
  };

  const timeChangeHandler = (t: Dayjs | null) => {
    if (t) {
      const formattedTime = t.format("HH:mm:ss.SSSSSS");
      setTime(dayjs(t));
      setValue("time", formattedTime);
    }
  };

  // Initialize the form with default values
  useEffect(() => {
    if (editData?.time && editData?.date) {
      const parseTime = parse(editData?.time, "HH:mm:ss", new Date());
      setDate(dayjs(editData?.date));
      setTime(dayjs(parseTime));
    }

    reset({
      title: editData?.title || "",
      batch: editData?.batch?.id || undefined,
      subject: editData?.subject?.id || undefined,
      teacher: editData?.teacher?.id || undefined,
      exam: editData?.exam?.id || undefined,
      duration: editData?.duration || undefined,
      date: editData?.date || undefined,
      time: editData?.time || undefined,
    });
  }, [editData, reset]);

  useEffect(() => {
    if (batch) {
      const nbatch = batches?.results.find(b => b.id === batch);
      setSelectedBatch(nbatch || null);
    }
    if (subject) {
      const sub = subjects?.results.find(b => b.id === subject);
      setSelectedSub(sub || null);
    }
    if (teacher) {
      const nteacher = teachers?.results.find(b => b.id === teacher);
      setSelectedTeacher(nteacher || null);
    }
    if (exam) {
      // const xm = teachers?.results.find(b => b.id === teacher);
      // setSelectedExam(xm ?? null);
    }
  }, [
    batch,
    subject,
    teacher,
    exam,
    batches?.results,
    subjects?.results,
    teachers?.results,
  ]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Schedule successfully updated!");
      onClose && onClose();
    }
  }, [isSuccess]);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      gap={2}
      component={"form"}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormSelectInput
        control={control}
        name="batch"
        label="Select Batch"
        options={batches?.results.map(option => ({
          label: String(option.name),
          value: option.id,
        }))}
      />
      <FormSelectInput
        control={control}
        name="subject"
        label="Select Subject"
        options={subjects?.results.map(option => ({
          label: String(option.name),
          value: option.id,
        }))}
      />
      <FormSelectInput
        control={control}
        name="teacher"
        label="Select Teacher"
        options={teachers?.results.map(option => ({
          label: String(option.user.first_name + " " + option.user.last_name),
          value: option.id,
        }))}
      />
      <FormControl fullWidth>
        <DateInput
          label="Date"
          name={"date"}
          value={date}
          control={control}
          onChange={newDate => dateChangeHandler(newDate)}
        />
      </FormControl>
      <FormControl fullWidth>
        <TimeInput
          label="Time"
          name={"time"}
          value={time}
          control={control}
          onChange={newTime => timeChangeHandler(newTime)}
        />
      </FormControl>
      <FormControl fullWidth required>
        <FormInputText
          name="duration"
          type="number"
          control={control}
          placeholder="Enter Duration"
          label="Duration"
        />
      </FormControl>
      <FormControl fullWidth required>
        <FormInputText
          name="title"
          type="text"
          control={control}
          placeholder="Enter Title"
          label="Title"
        />
      </FormControl>

      <CustomButton type="submit" disabled={isLoading}>
        Save
      </CustomButton>

      {isError && <ErrorDisplay error={error} />}
    </Box>
  );
};

export default ScheduleAddForm;
