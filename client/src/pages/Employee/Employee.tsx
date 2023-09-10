import AddIcon from "@mui/icons-material/Add";
import TuneIcon from "@mui/icons-material/Tune";
import { Button, Divider, Stack, Typography } from "@mui/material";
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
import EmployeeForm from "./components/EmployeeForm/EmployeeForm";
import EmployeeTable from "./components/EmployeeTable/EmployeeTable";
import EmployeeFilterForm from "./components/FilterForm/EmployeeFilterForm";

const breadCrumbList = [
  {
    label: "Dashboard",
    path: "/",
  },
  {
    label: "Employee",
    path: "/employees",
  },
];

export default function Employee() {
  const dispatch = useAppDispatch();

  const { params } = useAppSelector(state => state.user);

  const [createEmp, setCreateEmp] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>(params.search ?? "");
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  // get debounced search term
  const debouncedSearchTerm = useDebounce(searchText, 500);

  const handleOpenDrawer = () => setOpenDrawer(true);

  const handleCloseDrawer = () => setOpenDrawer(false);

  const handleOpenCreateModal = () => setCreateEmp(true);

  const handleCloseCreateModal = () => setCreateEmp(false);

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
          <Typography variant="h4">Employees</Typography>
          <Stack
            direction={"row"}
            alignItems={"center"}
            gap={1}
            flexWrap={"wrap"}
          >
            <SearchInput
              label="Search Employee"
              value={searchText}
              handleChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchText(e.target.value)
              }
              handleCancelSearch={handleCancelSearch}
            />
            <Button variant="contained" onClick={handleOpenCreateModal}>
              <AddIcon />
            </Button>
            <CustomButton variant="contained" onClick={handleOpenDrawer}>
              <TuneIcon />
            </CustomButton>
          </Stack>
        </Stack>
        <Divider sx={{ my: 3 }} />

        <EmployeeTable />
      </PageContainer>

      {/* create modal */}
      {createEmp && (
        <Modal
          open={createEmp}
          onClose={handleCloseCreateModal}
          title="Create New Subject"
          content={<EmployeeForm onClose={handleCloseCreateModal} />}
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
          content={<EmployeeFilterForm />}
          onClose={handleCloseDrawer}
          onOpen={handleOpenDrawer}
        />
      )}
    </>
  );
}
