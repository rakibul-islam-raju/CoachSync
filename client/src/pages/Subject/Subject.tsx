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
import { useEffect, useState } from "react";
import Modal from "../../components/Modal/Modal";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import ConfirmDialogue from "../../components/ConfirmDialogue/ConfirmDialogue";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import { toast } from "react-toastify";
import { useDebounce } from "../../hooks/useDebounce";
import { useDeleteSubjectMutation } from "../../redux/subject/subjectApi";
import { selectSubject, setSearchTerm } from "../../redux/subject/subjectSlice";
import SubjectTable from "./components/SubjectTable/SubjectTable";
import SubjectForm from "./components/SubjectForm/SubjectForm";

const breadCrumbList = [
	{
		label: "Dashboard",
		path: "/",
	},
	{
		label: "Subject",
		path: "/subjects",
	},
];

export default function Subject() {
	const dispatch = useAppDispatch();

	const { selectedItem, action, params } = useAppSelector(
		(state) => state.subject
	);

	const [deleteSubject, { isError, isSuccess, error }] =
		useDeleteSubjectMutation();

	const [createSub, setCreateSub] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>(params.search ?? "");

	// get debounced search term
	const debouncedSearchTerm = useDebounce(searchText, 500);

	const handleOpenCreateModal = () => setCreateSub(true);

	const handleCloseCreateModal = () => setCreateSub(false);

	const handleCloseEditModal = () =>
		dispatch(selectSubject({ data: null, action: null }));

	const handleDelete = () => {
		if (selectedItem) deleteSubject(selectedItem?.id);
	};

	useEffect(() => {
		if (isSuccess) {
			toast.success("Subject successfully deleted");
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
					<Typography variant="h4">Subjects</Typography>
					<Stack
						direction={"row"}
						alignItems={"center"}
						gap={2}
						flexWrap={"wrap"}
					>
						<TextInput
							onChange={(e) => setSearchText(e.target.value)}
							label="Search Subject"
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							}}
						/>
						<Button variant="contained" onClick={handleOpenCreateModal}>
							Add Subject
						</Button>
					</Stack>
				</Stack>
				<Divider sx={{ my: 3 }} />
				<SubjectTable />
			</PageContainer>

			{/* create modal */}
			{createSub && (
				<Modal
					open={createSub}
					onClose={handleCloseCreateModal}
					title="Create New Subject"
					content={<SubjectForm onClose={handleCloseCreateModal} />}
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
					title="Edit Subject"
					content={
						<SubjectForm
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
					title="Delete Subject"
					message={"Are you want to delete this subject?"}
					handleSubmit={handleDelete}
					handleClose={handleCloseEditModal}
				/>
			)}
		</>
	);
}
