import { IBatch } from "../batch/batch.type";
import { IStudent } from "../student/student.type";

export interface IEnroll extends IEntityGenericProps {
  id: number;
  student: IStudent;
  batch: IBatch;
  total_amount: number;
  discount_amount: number;
  paid_amount: number;
  reference_by: IUser;
}

export interface IEnrollCreateReqData {
  student: number;
  batch: number;
  total_amount: number;
  discount_amount?: number | null;
  paid_amount: number;
  reference_by?: number | null;
}

export interface IEnrollUpdateReqData {
  id: number;
  data: Partial<IEnrollCreateReqData>;
}

export interface IEnrollParams {
  limit: number;
  offset: number;
  search?: string;
  batch?: string;
  ordering?: string;

  // Index signature for string keys
  [key: string]: string | number | boolean | undefined;
}
