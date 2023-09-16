import { zodResolver } from "@hookform/resolvers/zod";
import { Box, FormControl } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import DateInput from "../../../../components/forms/DateInput";
import { FormInputText } from "../../../../components/forms/FormInputText";
import FormSelectInput from "../../../../components/forms/FormSelectInput";
import TimeInput from "../../../../components/forms/TimeInput";
import { IBatch } from "../../../../redux/batch/batch.type";
import { useGetBatchesQuery } from "../../../../redux/batch/batchApi";
import { IExam } from "../../../../redux/exam/exam.type";
import { useAppDispatch } from "../../../../redux/hook";
import { addNewSchedule } from "../../../../redux/schedule/scheduleSlice";
import { ISubject } from "../../../../redux/subject/subject.type";
import { useGetSubjectsQuery } from "../../../../redux/subject/subjectApi";
import { ITeacher } from "../../../../redux/teacher/teacher.type";
import { useGetTeachersQuery } from "../../../../redux/teacher/teacherApi";
import {
  IScheduleCreateFormValues,
  scheduleCreateSchema,
} from "../scheduleSchema";

const ScheduleAddForm: FC = () => {
  const dispatch = useAppDispatch();

  const { control, handleSubmit, setValue, watch } =
    useForm<IScheduleCreateFormValues>({
      resolver: zodResolver(scheduleCreateSchema),
    });

  const { data: batches } = useGetBatchesQuery({ limit: 50, offset: 0 });
  const { data: subjects } = useGetSubjectsQuery({ limit: 50, offset: 0 });
  const { data: teachers } = useGetTeachersQuery({ limit: 50, offset: 0 });

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

      dispatch(addNewSchedule(newData));
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
      const formattedDate = t.format("hh:mm:a");
      setTime(dayjs(date));
      setValue("time", formattedDate);
    }
  };

  useEffect(() => {
    if (batch) {
      const nbatch = batches?.results.find(b => b.id === batch);
      setSelectedBatch(nbatch ?? null);
    }
    if (subject) {
      const sub = subjects?.results.find(b => b.id === subject);
      setSelectedSub(sub ?? null);
    }
    if (teacher) {
      const nteacher = teachers?.results.find(b => b.id === teacher);
      setSelectedTeacher(nteacher ?? null);
    }
    if (exam) {
      // const xm = teachers?.results.find(b => b.id === teacher);
      // setSelectedExam(xm ?? null);
    }
  }, [batch, subject, teacher, exam]);

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

      <CustomButton type="submit">Save</CustomButton>
    </Box>
  );
};

export default ScheduleAddForm;
