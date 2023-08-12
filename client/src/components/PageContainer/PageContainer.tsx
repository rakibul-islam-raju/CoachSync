import { Paper } from "@mui/material";
import { FC, ReactNode } from "react";

type PageContainerProps = {
	children: ReactNode;
};

const PageContainer: FC<PageContainerProps> = ({ children }) => {
	return (
		<Paper variant="elevation" elevation={1} sx={{ p: 2, my: 4 }}>
			{children}
		</Paper>
	);
};

export default PageContainer;
