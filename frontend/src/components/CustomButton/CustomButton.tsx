 
import { Button, ButtonProps, styled } from "@mui/material";
import { FC } from "react";

type CustomButtonProps = ButtonProps & {
  variant?: "contained" | "outlined" | "text";
};

const StyledButton = styled(Button)<CustomButtonProps>(
  ({ variant }) => ({
    borderRadius: "4px",

    ...(variant === "contained" && {}),
    ...(variant === "outlined" && {}),
  }),
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
