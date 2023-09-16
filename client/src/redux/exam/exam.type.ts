import { IBatch } from "../batch/batch.type";
import { ISubject } from "../subject/subject.type";

export interface IExamType extends IEntityGenericProps {
  id: number;
  start_date: string;
  end_date: string;
  batch: IBatch;
}

export interface IExam extends IEntityGenericProps {
  id: number;
  exam_type: IExamType;
  subject: ISubject;
  name: string;
  date: string;
  pass_mark: number;
  total_mark: number;
}
