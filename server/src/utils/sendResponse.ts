type IApiResponse<T> = {
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  } | null;
  data: T | null;
};

type IApiResponseArgs<T> = IApiResponse<T> & {
  statusCode: number;
};

import { Response } from "express";

const sendResponse = <T>(res: Response, data: IApiResponseArgs<T>): void => {
  const responseData: IApiResponse<T> = {
    success: data.success,
    message: data.message ?? null,
    meta: data?.meta ?? null ?? undefined,
    data: data?.data ?? null,
  };

  res.status(data.statusCode).json(responseData);
};

export default sendResponse;
