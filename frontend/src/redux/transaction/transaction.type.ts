import { IEnroll } from "../enroll/enroll.type";

export interface ITransaction extends IEntityGenericProps {
  id: number;
  enroll: IEnroll;
  amount: number;
  remark: string;
}

export interface ITransactionCreateReqData {
  enroll: number;
  amount: number;
  remark?: string | null;
}

export interface ITransactionParams {
  limit: number;
  offset: number;
  search?: string;
  enroll?: number;
  ordering?: string;

  // Index signature for string keys
  [key: string]: string | number | boolean | undefined;
}

export interface ITransactionStats {
  month: number;
  total_amount: number;

  [key: string]: number;
}
