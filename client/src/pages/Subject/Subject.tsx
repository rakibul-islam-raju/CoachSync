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
import { useDebounce } from "../../hooks/useDebounce";
import { setSearchTerm } from "../../redux/subject/subjectSlice";
import SubjectForm from "./components/SubjectForm/SubjectForm";
import SubjectTable from "./components/SubjectTable/SubjectTable";

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

  const { search } = useAppSelector(state => state.subject);

  const [createSub, setCreateSub] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>(search ?? "");

  // get debounced search term
  const debouncedSearchTerm = useDebounce(searchText, 500);

  const handleOpenCreateModal = () => setCreateSub(true);

  const handleCloseCreateModal = () => setCreateSub(false);

  useEffect(() => {
    dispatch(setSearchTerm(debouncedSearchTerm));
  }, [debouncedSearchTerm, dispatch]);

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
          <Typography variant="h4">Subjects</Typography>
          <Stack
            direction={"row"}
            alignItems={"center"}
            gap={2}
            flexWrap={"wrap"}
          >
            <TextInput
              onChange={e => setSearchText(e.target.value)}
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
    </>
  );
}
