import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Divider,
  FormControl,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import { Link as RouterLink } from "react-router-dom";
import { createZodResolver } from "../../utils/formResolver";
import * as z from "zod";
import { FormInputText } from "../../components/forms/FormInputText";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import { useForgetPasswordMutation } from "../../redux/auth/authApi";
import { toast } from "react-toastify";

const schema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email")
    .nonempty("Email is required"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgetPassword() {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: createZodResolver<FormValues>(schema),
  });

  const [forgetPassword, { isLoading, isError, isSuccess, error }] =
    useForgetPasswordMutation();

  const onSubmit = (data: FormValues) => {
    forgetPassword(data);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Password reset instructions have been sent.");
    }
  }, [isSuccess]);

  return (
    <Box component={"form"} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h4" gutterBottom>
        Reset Password
      </Typography>
      <Divider />
      <Stack
        sx={{
          rowGap: 3,
          mt: 4,
        }}
      >
        <FormControl fullWidth>
          <FormInputText
            name="email"
            type="email"
            control={control}
            label="Email Address"
            placeholder="Enter Email Address"
          />
        </FormControl>

        <CustomButton type="submit" disabled={isLoading}>
          Submit
        </CustomButton>
        {isError && <ErrorDisplay error={error} />}
        <Typography component="p" align="center" sx={{ mb: 2 }}>
          <Link component={RouterLink} underline="hover" to="/login">
            Remembered password?
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
}
