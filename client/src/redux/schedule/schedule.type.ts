import { IBatch } from "../batch/batch.type";
import { IExam } from "../exam/exam.type";
import { ISubject } from "../subject/subject.type";
import { ITeacher } from "../teacher/teacher.type";

export interface ISchedule extends IEntityGenericProps {
  id: number;
  title: string;
  subject: ISubject;
  teacher?: ITeacher;
  batch: IBatch;
  duration: number;
  date: string;
  time: string;
  exam?: IExam;
}

export interface IScheduleCreateReqData {
  title: string;
  subject: number;
  teacher?: number | null;
  batch: number;
  duration: number;
  date: string;
  time: string;
  exam?: number | null;
}

export interface IScheduleDemoData {
  uuid: string;
  title: string;
  subject: ISubject;
  teacher?: ITeacher | null;
  batch: IBatch;
  duration: number;
  date: string;
  time: string;
  exam?: IExam | null;
}

export interface IScheduleUpdateReqData {
  id: number;
  data: Partial<IScheduleCreateReqData>;
}

export interface IScheduleParams {
  limit: number;
  offset: number;
  search?: string;
  name?: boolean;
  code?: boolean;
  is_active?: boolean;
  ordering?: string;

  // Index signature for string keys
  [key: string]: string | number | boolean | undefined;
}
