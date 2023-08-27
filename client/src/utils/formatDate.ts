import { format } from "date-fns";

export const formatDate = (datatime: Date | string): string => {
  return format(new Date(datatime), "dd-MM-yyyy");
};
