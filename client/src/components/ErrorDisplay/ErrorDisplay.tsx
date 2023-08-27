/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertTitle } from "@mui/material";
import React from "react";

interface IErrorDisplayProps {
  error: any;
  severity?: "error" | "warning";
}

const ErrorDisplay: React.FC<IErrorDisplayProps> = ({
  error,
  severity = "error",
}) => {
  let errorMessage: string = "";
  if (typeof error === "string") {
    errorMessage = error;
  } else if (error?.data?.detail) {
    errorMessage = error.data.detail;
  } else if (error?.data?.non_field_errors) {
    errorMessage = error.data.non_field_errors;
  } else if (typeof error.data === "object") {
    const errors = [];
    for (const key in error.data) {
      errors.push(`${key.toUpperCase()}: ${error.data[key][0]}`);
    }
    errorMessage = errors[0];
  } else if (error.originalStatus === 500) {
    errorMessage = "Internal server error";
  } else {
    errorMessage = "Something went wrong";
  }

  return (
    <Alert severity={severity} sx={{ my: 2 }}>
      <AlertTitle>{errorMessage}</AlertTitle>
    </Alert>
  );
};

export default ErrorDisplay;
