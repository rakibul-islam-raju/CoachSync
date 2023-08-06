import { FC } from "react";
import { Button, ButtonProps, styled } from "@mui/material";

type CustomButtonProps = ButtonProps & {
	variant?: "contained" | "outlined" | "text";
	color?: string;
};

const StyledButton = styled(Button)<CustomButtonProps>(
	({ theme, variant }) => ({
		borderRadius: "4px",

		...(variant === "contained" && {}),
		...(variant === "outlined" && {
			border: `1px solid ${theme.palette.primary.main}`,
			color: theme.palette.primary.main,
		}),
	})
);

export const CustomButton: FC<CustomButtonProps> = ({
	variant = "contained",
	children,
	...rest
}) => {
	return (
		<StyledButton {...rest} variant={variant}>
			{children}
		</StyledButton>
	);
};
