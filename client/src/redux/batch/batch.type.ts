import { IClass } from "../class/class.type";

export interface IBatch extends IEntityGenericProps {
  id: number;
  classs: IClass;
  name: string;
  code: string;
  start_date?: string;
  end_date?: string;
  fee?: number;
}

export interface IBatchCreateReqData {
  name: string;
  classs: number;
  fee?: number | null;
  code?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}

export interface IBatchUpdateReqData {
  id: number;
  data: Partial<IBatchCreateReqData>;
}

export interface IBatchParams {
  limit?: number;
  offset?: number;
  search?: string;
  name?: boolean;
  code?: boolean;
  classs?: boolean;
  is_active?: boolean;
  ordering?: string;

  // Index signature for string keys
  [key: string]: string | number | boolean | undefined;
}
