import { IBatch } from "../batch/batch.type";
import { ISubject } from "../subject/subject.type";

export interface IExamType extends IEntityGenericProps {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  batch: IBatch;
}

export interface IExamTypeWrite {
  name: string;
  start_date: string;
  end_date: string;
  batch: number;
  is_active?: boolean;
}

export interface IExam extends IEntityGenericProps {
  id: number;
  exam_type: IExamType;
  subject: ISubject;
  name: string;
  date: string;
  pass_mark: number;
  total_mark: number;
  is_required: boolean;
}

export interface IExamWrite {
  exam_type: number;
  subject: number;
  name: string;
  date: string;
  pass_mark: number;
  total_mark: number;
  is_required?: boolean;
  is_active?: boolean;
}

export interface IExamParams {
  limit?: number;
  offset?: number;
  search?: string;
  ordering?: string;
  exam_type?: number;
  subject?: number;
  date?: string;
  is_active?: boolean;
  [key: string]: string | number | boolean | undefined;
}
