export type ILoginReqData = {
  email: string;
  password: string;
};

export type ILoginResData = {
  access: string;
  refresh: string;
};
