import { format, parse } from "date-fns";

export const formatTime = (time: string, microSec: boolean = true): string => {
  let parsed;
  if (microSec) {
    parsed = parse(time, "HH:mm:ss.SSSSSS", new Date());
  } else {
    parsed = parse(time, "HH:mm:ss", new Date());
  }
  return format(parsed, "h:mm a");
};
