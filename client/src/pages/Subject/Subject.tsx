import { Button, Divider, Stack, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import Modal from "../../components/Modal/Modal";
import PageContainer from "../../components/PageContainer/PageContainer";
import SearchInput from "../../components/forms/SearchInput";
import { useDebounce } from "../../hooks/useDebounce";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { removeParam, setParams } from "../../redux/subject/subjectSlice";
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

  const { params } = useAppSelector(state => state.subject);

  const [createSub, setCreateSub] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>(params.search ?? "");

  // get debounced search term
  const debouncedSearchTerm = useDebounce(searchText, 500);

  const handleOpenCreateModal = () => setCreateSub(true);

  const handleCloseCreateModal = () => setCreateSub(false);

  const handleCancelSearch = () => {
    setSearchText("");
    dispatch(removeParam("search"));
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      dispatch(setParams({ search: debouncedSearchTerm }));
    } else {
      dispatch(removeParam("search"));
    }
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
            <SearchInput
              label="Search Subject"
              value={searchText}
              handleChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchText(e.target.value)
              }
              handleCancelSearch={handleCancelSearch}
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
