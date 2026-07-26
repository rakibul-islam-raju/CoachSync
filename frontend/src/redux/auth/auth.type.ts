export type ILoginReqData = {
  email: string;
  password: string;
};

export type ILoginResData = {
  access: string;
  refresh: string;
};

export type IForgetPasswordReqData = {
  email: string;
};

export type ISetPasswordReqData = {
  token: string;
  password: string;
};

export type IChangePasswordReqData = {
  old_password: string;
  new_password: string;
};

export type IMessageResponse = {
  message: string;
};
