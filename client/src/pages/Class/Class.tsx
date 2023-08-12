import {
	Button,
	Divider,
	InputAdornment,
	Stack,
	Typography,
} from "@mui/material";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import TextInput from "../../components/forms/TextInput";
import SearchIcon from "@mui/icons-material/Search";
import PageContainer from "../../components/PageContainer/PageContainer";
import ClassTable from "./components/ClassTable/ClassTable";
import { useState } from "react";
import Modal from "../../components/Modal/Modal";
import ClassForm from "./components/ClassForm/ClassForm";

const breadCrumbList = [
	{
		label: "Dashboard",
		path: "/",
	},
	{
		label: "Class",
		path: "/classes",
	},
];

export default function Class() {
	const [createClass, setCreateClass] = useState<boolean>(false);

	const handleOpenCreateModal = () => setCreateClass(true);

	const handleCloseCreateModal = () => setCreateClass(false);

	return (
		<>
			<CustomBreadcrumb list={breadCrumbList} />
			<PageContainer>
				<Stack
					direction={"row"}
					justifyContent={"space-between"}
					alignItems={"center"}
					flexWrap={"wrap"}
					gap={2}
				>
					<Typography variant="h4">Classes</Typography>
					<Stack
						direction={"row"}
						alignItems={"center"}
						gap={2}
						flexWrap={"wrap"}
					>
						<TextInput
							label="Search Class"
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							}}
						/>
						<Button variant="contained" onClick={handleOpenCreateModal}>
							Add Class
						</Button>
					</Stack>
				</Stack>
				<Divider sx={{ my: 3 }} />
				<ClassTable />
			</PageContainer>

			{createClass && (
				<Modal
					open={createClass}
					onClose={handleCloseCreateModal}
					title="Create New Class"
					content={<ClassForm />}
					confirmText="Save"
					cancelText="Cancel"
					onConfirm={handleCloseCreateModal}
					onCancel={handleCloseCreateModal}
					maxWidth="sm"
					fullWidth
				/>
			)}
		</>
	);
}
