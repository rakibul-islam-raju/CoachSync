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
import { useEffect, useState } from "react";
import Modal from "../../components/Modal/Modal";
import ClassForm from "./components/ClassForm/ClassForm";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { selectClass, setSearchTerm } from "../../redux/class/classSlice";
import ConfirmDialogue from "../../components/ConfirmDialogue/ConfirmDialogue";
import { useDeleteClassMutation } from "../../redux/class/classApi";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import { toast } from "react-toastify";
import { useDebounce } from "../../hooks/useDebounce";

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
	const dispatch = useAppDispatch();

	const { selectedItem, action, params } = useAppSelector(
		(state) => state.class
	);

	const [deleteClass, { isError, isSuccess, error }] = useDeleteClassMutation();

	const [createClass, setCreateClass] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>(params.search ?? "");

	// get debounced search term
	const debouncedSearchTerm = useDebounce(searchText, 500);

	const handleOpenCreateModal = () => setCreateClass(true);

	const handleCloseCreateModal = () => setCreateClass(false);

	const handleCloseEditModal = () =>
		dispatch(selectClass({ data: null, action: null }));

	const handleDelete = () => {
		if (selectedItem) deleteClass(selectedItem?.id);
	};

	useEffect(() => {
		if (isSuccess) {
			toast.success("Class successfully deleted");
		}
	}, [isSuccess]);

	useEffect(() => {
		dispatch(setSearchTerm(debouncedSearchTerm));
	}, [debouncedSearchTerm, dispatch]);

	return (
		<>
			<CustomBreadcrumb list={breadCrumbList} />

			{isError && <ErrorDisplay error={error} />}

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
							onChange={(e) => setSearchText(e.target.value)}
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

			{/* create modal */}
			{createClass && (
				<Modal
					open={createClass}
					onClose={handleCloseCreateModal}
					title="Create New Class"
					content={<ClassForm onClose={handleCloseCreateModal} />}
					onConfirm={handleCloseCreateModal}
					onCancel={handleCloseCreateModal}
					maxWidth="sm"
					fullWidth
				/>
			)}

			{/* edit modal */}
			{selectedItem && action === "edit" && (
				<Modal
					open={action === "edit"}
					onClose={handleCloseEditModal}
					title="Edit Class"
					content={
						<ClassForm
							defaultData={selectedItem}
							onClose={handleCloseCreateModal}
						/>
					}
					onConfirm={handleCloseCreateModal}
					onCancel={handleCloseCreateModal}
					maxWidth="sm"
					fullWidth
				/>
			)}

			{/* delete dialogue */}
			{selectedItem && action === "delete" && (
				<ConfirmDialogue
					open={action === "delete"}
					title="Delete Class"
					message={"Are you want to delete this class?"}
					handleSubmit={handleDelete}
					handleClose={handleCloseEditModal}
				/>
			)}
		</>
	);
}
