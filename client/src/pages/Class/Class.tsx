import { Button, Divider, Stack, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import Modal from "../../components/Modal/Modal";
import PageContainer from "../../components/PageContainer/PageContainer";
import SearchInput from "../../components/forms/SearchInput";
import { useDebounce } from "../../hooks/useDebounce";
import { removeParam, setParams } from "../../redux/class/classSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import ClassForm from "./components/ClassForm/ClassForm";
import ClassTable from "./components/ClassTable/ClassTable";

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

  const { params } = useAppSelector(state => state.class);

  const [createClass, setCreateClass] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>(params.search ?? "");

  // get debounced search term
  const debouncedSearchTerm = useDebounce(searchText, 500);

  const handleOpenCreateModal = () => setCreateClass(true);

  const handleCloseCreateModal = () => setCreateClass(false);

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
          <Typography variant="h4">Classes</Typography>
          <Stack
            direction={"row"}
            alignItems={"center"}
            gap={2}
            flexWrap={"wrap"}
          >
            <SearchInput
              label="Search Class"
              value={searchText}
              handleChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchText(e.target.value)
              }
              handleCancelSearch={handleCancelSearch}
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
    </>
  );
}
