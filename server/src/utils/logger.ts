import path from "path";
import { createLogger, format, transports } from "winston";
const { combine, timestamp, label, printf } = format;
import DailyRotateFile from "winston-daily-rotate-file";

const myFormat = printf(({ level, message, label, timestamp }) => {
  const date = new Date(timestamp);
  return `${date.toLocaleString()} [${label}] ${level}: ${message}`;
});

export const logger = createLogger({
  level: "info",
  format: combine(label({ label: "info" }), timestamp(), myFormat),
  defaultMeta: { service: "auth-service" },
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        "logs",
        "winston",
        "info",
        "%DATE%.log"
      ),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
});

export const errorLogger = createLogger({
  level: "error",
  format: combine(label({ label: "error" }), timestamp(), myFormat),
  defaultMeta: { service: "auth-service" },
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        "logs",
        "winston",
        "error",
        "%DATE%.log"
      ),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
});
