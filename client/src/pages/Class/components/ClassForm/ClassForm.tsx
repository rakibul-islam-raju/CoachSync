import { Box, FormControl, Stack } from "@mui/material";
import { FormInputText } from "../../../../components/forms/FormInputText";
import { IClassCreateFormValues, classCreateSchema } from "../classSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";

const ClassForm = () => {
	const { control, handleSubmit } = useForm<IClassCreateFormValues>({
		resolver: zodResolver(classCreateSchema),
	});

	// const [login, { isLoading, isError, isSuccess, error }] = useLoginMutation();

	const onSubmit = (data: IClassCreateFormValues) => {
		console.log(data);

		// login(data);
	};

	// useEffect(() => {
	// 	if (isSuccess) {
	// 		toast.success("Login successful");
	// 		navigate("/");
	// 	}
	// }, [isSuccess, navigate]);

	return (
		<Box component={"form"} noValidate onSubmit={handleSubmit(onSubmit)}>
			<Stack direction={"column"} gap={2}>
				<FormControl fullWidth>
					<FormInputText
						name="name"
						type="text"
						control={control}
						placeholder="Enter Class Name"
						label="Class Name"
					/>
					<FormInputText
						name="numeric"
						type="number"
						control={control}
						placeholder="Enter Class in numeruc"
						label="Numeric"
					/>
				</FormControl>
				<CustomButton type="submit">Save</CustomButton>
			</Stack>
		</Box>
	);
};

export default ClassForm;
