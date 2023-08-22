export interface ISubject extends IEntityGenericProps {
  id: number;
  name: string;
  code: string;
}

export interface ISubjectCreateReqData {
  name: string;
  code: string;
}

export interface ISubjectUpdateReqData {
  id: number;
  data: {
    name?: string;
    code?: string;
    is_Active?: boolean;
  };
}

export interface ISubjectParams {
  limit?: number;
  offset?: number;
  search?: string;
  name?: boolean;
  code?: boolean;
  is_active?: boolean;
  ordering?: string;
}
