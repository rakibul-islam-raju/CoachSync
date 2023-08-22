import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LoginFormValues, loginSchema } from "./components/LoginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FormInputText } from "../../components/forms/FormInputText";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useLoginMutation } from "../../redux/auth/authApi";
import { toast } from "react-toastify";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";

export default function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const [login, { isLoading, isError, isSuccess, error }] = useLoginMutation();

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Login successful");
      navigate("/");
    }
  }, [isSuccess, navigate]);

  return (
    <>
      <Box component={"form"} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <Divider />
        <Stack rowGap={3} mt={4}>
          <FormControl fullWidth>
            <FormInputText
              name="email"
              type="email"
              control={control}
              placeholder="Enter Email Address"
              label="Email Address"
            />
          </FormControl>
          <FormControl fullWidth>
            <FormInputText
              name="password"
              type={showPass ? "text" : "password"}
              control={control}
              label="Password"
              placeholder="Enter Password"
              inputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPass(prev => !prev)}
                      data-testid="visibility-button"
                    >
                      {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <CustomButton type="submit" disabled={isLoading}>
            Submit
          </CustomButton>
          <Typography paragraph align="center">
            <Link component={RouterLink} underline="hover" to="/reset-password">
              Forgot Password?
            </Link>
          </Typography>
        </Stack>
      </Box>

      {isError && <ErrorDisplay error={error} />}
    </>
  );
}
