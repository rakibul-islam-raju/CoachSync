export interface ITeacher extends IEntityGenericProps {
  id: number;
  user: IUser;
}

export interface ITeacherCreateReqData {
  user: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    is_active?: boolean;
  };
}
export interface ITeacherUpdateReqData {
  id: number;
  data: Partial<ITeacherCreateReqData>;
}

export interface ITeacherParams {
  limit?: number;
  offset?: number;
  search?: string;
  user__first_name?: boolean;
  user__last_name?: string;
  is_active?: boolean;
  ordering?: string;

  // Index signature for string keys
  [key: string]: string | number | boolean | undefined;
}
