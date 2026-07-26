import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as z from "zod";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import { FormInputText } from "../../components/forms/FormInputText";
import { useSetPasswordMutation } from "../../redux/auth/authApi";
import { createZodResolver } from "../../utils/formResolver";

const schema = z
  .object({
    password: z.string().min(8, "Password must contain at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine(data => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export default function SetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const methods = useForm<FormValues>({
    resolver: createZodResolver<FormValues>(schema),
  });
  const {
    handleSubmit,
    formState: { errors },
  } = methods;
  const [setPassword, { isLoading, isError, isSuccess, error }] =
    useSetPasswordMutation();

  const onSubmit = ({ password }: FormValues) => {
    if (token) setPassword({ token, password });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Password set successfully. You can now log in.");
      navigate("/login", { replace: true });
    }
  }, [isSuccess, navigate]);

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography variant="h4" gutterBottom>
          Set Password
        </Typography>
        <Divider />
        <Stack sx={{ rowGap: 3, mt: 4 }}>
          <FormControl fullWidth>
            <FormInputText
              name="password"
              type={showPassword ? "text" : "password"}
              label="New Password"
              error={!!errors.password}
              helperText={errors.password?.message}
              inputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(value => !value)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <FormInputText
              name="confirm_password"
              type={showPassword ? "text" : "password"}
              label="Confirm Password"
              error={!!errors.confirm_password}
              helperText={errors.confirm_password?.message}
            />
          </FormControl>
          <CustomButton type="submit" disabled={isLoading || !token}>
            Save Password
          </CustomButton>
          {!token && <ErrorDisplay error="Invalid password reset link." />}
          {isError && <ErrorDisplay error={error} />}
        </Stack>
      </Box>
    </FormProvider>
  );
}
