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
import { FormInputText } from "../../components/forms/FormInputText";
import { CustomButton } from "../../components/CustomButton";
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Link as RouterLink } from "react-router-dom";

export default function Login() {
	const [showPass, setShowPass] = useState(false);

	const { control, handleSubmit } = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = (data: LoginFormValues) => {
		console.log(data);

		// TODO: login
		// login(data);
	};

	//   useEffect(() => {
	// 	if (isSuccess) {
	// 	  toast.success("Login successful");
	// 	  navigate("/");
	// 	}
	//   }, [isSuccess, navigate]);

	return (
		<Box component={"form"} onSubmit={handleSubmit(onSubmit)}>
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
						label="Email Address"
					/>
				</FormControl>
				<FormControl fullWidth>
					<FormInputText
						name="password"
						type={showPass ? "text" : "password"}
						control={control}
						label="Password"
						inputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={() => setShowPass((prev) => !prev)}>
										{showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
				</FormControl>
				<CustomButton type="submit">Submit</CustomButton>
				<Typography paragraph align="center">
					<Link component={RouterLink} underline="hover" to="/reset-password">
						Forgot Password?
					</Link>
				</Typography>
			</Stack>
		</Box>
	);
}
