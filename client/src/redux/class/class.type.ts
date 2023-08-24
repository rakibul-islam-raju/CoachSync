export interface IClass extends IEntityGenericProps {
  id: number;
  name: string;
  numeric: number;
}

export interface IClassCreateReqData {
  name: string;
  numeric: number;
}

export interface IClassUpdateReqData {
  id: number;
  data: {
    name?: string;
    numeric?: number;
    is_Active?: boolean;
  };
}

export interface IClassParams {
  limit: number;
  offset: number;
  search?: string;
  is_active?: boolean;
  ordering?: string;

  // Index signature for string keys
  [key: string]: string | number | boolean | undefined;
}
