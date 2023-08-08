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
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInputText } from "../../components/forms/FormInputText";

const schema = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.email()
		.nonempty("Email is required"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgetPassword() {
	const { control, handleSubmit } = useForm<FormValues>({
		resolver: zodResolver(schema),
	});

	const onSubmit = (data: FormValues) => {
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
		<Box component={"form"} onSubmit={handleSubmit(onSubmit)} noValidate>
			<Typography variant="h4" gutterBottom>
				Reset Password
			</Typography>
			<Divider />
			<Stack rowGap={3} mt={4}>
				<FormControl fullWidth>
					<FormInputText
						name="email"
						type="email"
						control={control}
						label="Email Address"
						placeholder="Enter Email Address"
					/>
				</FormControl>

				<CustomButton type="submit">Submit</CustomButton>
				<Typography paragraph align="center">
					<Link component={RouterLink} underline="hover" to="/login">
						Remembered password?
					</Link>
				</Typography>
			</Stack>
		</Box>
	);
}
