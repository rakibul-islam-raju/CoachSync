import { ErrorRequestHandler } from "express";
import { handleValidationError } from "../errors/handleValidationError";
import { IGenericErrorMessage } from "../interfaces/error";
import ApiError from "../errors/ApiError";
import config from "../config";
import { errorLogger } from "../utils/logger";
import { ZodError } from "zod";
import handleZodError from "../errors/handleZodError";
import handleCastError from "../errors/handleCastError";

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  config.NODE_ENV === "development"
    ? console.log("global error handler =>", error)
    : errorLogger.error("global error handler =>", error);

  let statusCode = 500;
  let message = "Something went wrong!";
  let errorMessages: IGenericErrorMessage[] = [];

  if (error?.name === "ValidationError") {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (error?.name === "CastError") {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (error instanceof ApiError) {
    statusCode = error?.statusCode;
    message = error?.message;
    errorMessages = error?.message
      ? [{ path: "", message: error.message }]
      : [];
  } else if (error instanceof Error) {
    message = error?.message;
    errorMessages = error?.message
      ? [{ path: "", message: error.message }]
      : [];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.NODE_ENV === "production" ? error?.stack : undefined,
  });

  next();
};

export default globalErrorHandler;
