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
import { setSearchTerm } from "../../redux/class/classSlice";
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

  const { search } = useAppSelector(state => state.class);

  const [createClass, setCreateClass] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>(search ?? "");

  // get debounced search term
  const debouncedSearchTerm = useDebounce(searchText, 500);

  const handleOpenCreateModal = () => setCreateClass(true);

  const handleCloseCreateModal = () => setCreateClass(false);

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
          <Typography variant="h4">Classes</Typography>
          <Stack
            direction={"row"}
            alignItems={"center"}
            gap={2}
            flexWrap={"wrap"}
          >
            <TextInput
              onChange={e => setSearchText(e.target.value)}
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
    </>
  );
}
