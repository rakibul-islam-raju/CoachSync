import { format } from "date-fns";

export const formatDateTime = (datatime: Date | string): string => {
  return format(new Date(datatime), "dd-MM-yyyy, p");
};
