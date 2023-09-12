import { IBatch } from "../batch/batch.type";

export interface IStudent extends IEntityGenericProps {
  id: number;
  user: IUser;
  student_id: string;
  emergency_contact_no: string;
  date_of_birth: string;
  blood_group: string;
  address: string;
  description: string;
}

export interface IEnrollsForStudentDetails extends IEntityGenericProps {
  id: number;
  student: number;
  batch: IBatch;
  total_amount: number;
  discount_amount: number;
  paid_amount: number;
  reference_by: IUser;
}

export interface IStudentDetails extends IStudent {
  enrolls: IEnrollsForStudentDetails[];
}

export interface IStudentCreateReqData {
  user: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  emergency_contact_no: string;
  date_of_birth: string;
  blood_group?: string | null;
  address: string;
  description: string;
  is_active: boolean;
}

export interface IStudentUpdateReqData {
  id: number;
  data: Partial<IStudentCreateReqData>;
}

export interface IStudentParams {
  limit: number;
  offset: number;
  search?: string;
  blood_group?: string;
  is_active?: boolean;
  ordering?: string;

  // Index signature for string keys
  [key: string]: string | number | boolean | undefined;
}
