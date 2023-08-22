import CloseIcon from "@mui/icons-material/Close";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { FC, ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  image?: string;
  content: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  fullWidth?: boolean;
}

const Modal: FC<Props> = ({
  open,
  onClose,
  title,
  subtitle,
  image,
  content,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  maxWidth = "lg",
  ...rest
}) => {
  return (
    <Dialog {...rest} open={open} onClose={onClose} maxWidth={maxWidth}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display={"flex"} gap={2} alignItems={"center"}>
          {image ? <img src={image} alt={title} /> : <DriveFolderUploadIcon />}
          <Box display={"flex"} flexDirection={"column"}>
            {title}
            {subtitle && (
              <Typography sx={{ display: "block" }}>{subtitle}</Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} color="error">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color="primary">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Modal;
