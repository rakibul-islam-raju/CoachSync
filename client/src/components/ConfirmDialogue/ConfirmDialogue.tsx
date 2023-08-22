import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { FC } from "react";

type ConfirmDialogueProps = {
	title: string;
	message?: string;
	confirmBtnText?: string;
	calcelBtnText?: string;
	open: boolean;
	handleSubmit?: () => void;
	handleClose?: () => void;
};

const ConfirmDialogue: FC<ConfirmDialogueProps> = ({
	title,
	message,
	open = false,
	confirmBtnText = "Yes",
	calcelBtnText = "No",
	handleClose,
	handleSubmit,
}) => {
	return (
		<Dialog
			open={open}
			onClose={handleClose}
			aria-labelledby={title}
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id={title}>{title}</DialogTitle>
			{message && (
				<DialogContent dividers>
					<DialogContentText id="alert-dialog-description">
						{message}
					</DialogContentText>
				</DialogContent>
			)}
			<DialogActions>
				<Button onClick={handleClose} color="error">
					{calcelBtnText}
				</Button>
				<Button onClick={handleSubmit} color="primary" autoFocus>
					{confirmBtnText}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmDialogue;
