import AddIcon from "@mui/icons-material/Add";
import TuneIcon from "@mui/icons-material/Tune";
import { Divider, Stack, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import CustomDrawer from "../../components/CustomDrawer/CustomDrawer";
import Modal from "../../components/Modal/Modal";
import PageContainer from "../../components/PageContainer/PageContainer";
import SearchInput from "../../components/forms/SearchInput";
import { useDebounce } from "../../hooks/useDebounce";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { removeParam, setParams } from "../../redux/subject/subjectSlice";
import SubjectFilterForm from "./components/FilterForm/SubjectFilterForm";
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
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  // get debounced search term
  const debouncedSearchTerm = useDebounce(searchText, 500);

  const handleOpenDrawer = () => setOpenDrawer(true);

  const handleCloseDrawer = () => setOpenDrawer(false);

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
            gap={1}
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
            <CustomButton variant="contained" onClick={handleOpenCreateModal}>
              <AddIcon />
            </CustomButton>
            <CustomButton variant="contained" onClick={handleOpenDrawer}>
              <TuneIcon />
            </CustomButton>
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

      {/* Drawer */}
      {openDrawer && (
        <CustomDrawer
          open={openDrawer}
          content={<SubjectFilterForm />}
          onClose={handleCloseDrawer}
          onOpen={handleOpenDrawer}
        />
      )}
    </>
  );
}
