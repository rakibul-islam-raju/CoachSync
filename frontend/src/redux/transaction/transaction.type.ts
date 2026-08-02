import { IEnroll } from "../enroll/enroll.type";

export interface ITransaction extends IEntityGenericProps {
  id: number;
  enroll: IEnroll;
  amount: number;
  remark: string;
  payment_method?: number | null;
  payment_method_name?: string | null;
  installment?: number | null;
  reference_number: string;
  transaction_type: "payment" | "reversal";
  reversal_of?: number | null;
  is_reversed: boolean;
}

export interface ITransactionReversalReqData {
  enroll: number;
  transaction: number;
  remark: string;
  replacement_amount?: number;
}

export interface ITransactionCreateReqData {
  enroll: number;
  amount: number;
  remark?: string | null;
  payment_method?: number;
  installment?: number;
  reference_number?: string;
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
