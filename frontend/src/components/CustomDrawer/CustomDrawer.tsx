import CloseIcon from "@mui/icons-material/Close";
import { Paper } from "@mui/material";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { FC, Fragment, ReactNode } from "react";
import { DrawerHeader } from "../layouts/RootLayout/RootLayout";

type Anchor = "top" | "left" | "bottom" | "right";

type CustomDrawerProps = {
  content: ReactNode;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  position?: Anchor;
  drawerWidth?: number;
};

const CustomDrawer: FC<CustomDrawerProps> = ({
  content,
  open,
  onClose,
  onOpen,
  position = "right",
  drawerWidth = 300,
}) => {
  return (
    <Fragment>
      <SwipeableDrawer
        anchor={position}
        open={open}
        onClose={onClose}
        onOpen={onOpen}
      >
        <DrawerHeader />
        <Box
          sx={{
            width:
              position === "top" || position === "bottom"
                ? "auto"
                : drawerWidth,
            padding: 2,
          }}
          role="presentation"
        >
          <Paper
            elevation={0}
            onClick={onClose}
            sx={{
              cursor: "pointer",
              background: "#ddd",
              display: "inline-block",
              pt: 1,
              px: 2,
              mb: 2,
            }}
          >
            <CloseIcon />
          </Paper>
          {content}
        </Box>
      </SwipeableDrawer>
    </Fragment>
  );
};

export default CustomDrawer;
