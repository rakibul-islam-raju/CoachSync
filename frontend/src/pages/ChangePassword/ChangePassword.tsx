import { Box, Divider, FormControl, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as z from "zod";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import PageContainer from "../../components/PageContainer/PageContainer";
import { FormInputText } from "../../components/forms/FormInputText";
import { useChangePasswordMutation } from "../../redux/auth/authApi";
import { createZodResolver } from "../../utils/formResolver";

const schema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must contain at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine(data => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

const breadcrumb = [
  { label: "Dashboard", path: "/" },
  { label: "Change Password", path: "/change-password" },
];

export default function ChangePassword() {
  const methods = useForm<FormValues>({
    resolver: createZodResolver<FormValues>(schema),
  });
  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;
  const [changePassword, { isLoading, isError, isSuccess, error }] =
    useChangePasswordMutation();

  const onSubmit = ({ old_password, new_password }: FormValues) => {
    changePassword({ old_password, new_password });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Password changed successfully.");
      reset();
    }
  }, [isSuccess, reset]);

  return (
    <>
      <CustomBreadcrumb list={breadcrumb} />
      <PageContainer>
        <FormProvider {...methods}>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ maxWidth: 560 }}
          >
            <Typography variant="h4" gutterBottom>
              Change Password
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={3}>
              <FormControl fullWidth>
                <FormInputText
                  name="old_password"
                  type="password"
                  label="Current Password"
                  error={!!errors.old_password}
                  helperText={errors.old_password?.message}
                />
              </FormControl>
              <FormControl fullWidth>
                <FormInputText
                  name="new_password"
                  type="password"
                  label="New Password"
                  error={!!errors.new_password}
                  helperText={errors.new_password?.message}
                />
              </FormControl>
              <FormControl fullWidth>
                <FormInputText
                  name="confirm_password"
                  type="password"
                  label="Confirm New Password"
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password?.message}
                />
              </FormControl>
              <CustomButton type="submit" disabled={isLoading}>
                Change Password
              </CustomButton>
              {isError && <ErrorDisplay error={error} />}
            </Stack>
          </Box>
        </FormProvider>
      </PageContainer>
    </>
  );
}
