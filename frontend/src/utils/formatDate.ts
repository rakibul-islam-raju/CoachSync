import { format } from "date-fns";

export const formatDate = (
  datatime: Date | string,
  dateFormat: "dd-MM-yyy" | "yyy-MM-dd" = "dd-MM-yyy",
): string => {
  return format(new Date(datatime), dateFormat);
};
