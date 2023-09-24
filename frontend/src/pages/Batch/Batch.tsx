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
import { removeParam, setParams } from "../../redux/batch/batchSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import BatchForm from "./components/BatchForm/BatchForm";
import BatchTable from "./components/BatchTable/BatchTable";
import BatchFilterForm from "./components/FilterForm/BatchFilterForm";

const breadCrumbList = [
  {
    label: "Dashboard",
    path: "/",
  },
  {
    label: "Batch",
    path: "/batches",
  },
];

export default function Batch() {
  const dispatch = useAppDispatch();

  const { params } = useAppSelector(state => state.batch);

  const [createBatch, setCreateBatch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>(params.search ?? "");
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  // get debounced search term
  const debouncedSearchTerm = useDebounce(searchText, 500);

  const handleOpenDrawer = () => setOpenDrawer(true);

  const handleCloseDrawer = () => setOpenDrawer(false);

  const handleOpenCreateModal = () => setCreateBatch(true);

  const handleCloseCreateModal = () => setCreateBatch(false);

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
          <Typography variant="h4">Batches</Typography>
          <Stack
            direction={"row"}
            alignItems={"center"}
            gap={1}
            flexWrap={"wrap"}
          >
            <SearchInput
              label="Search Batch"
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
        <BatchTable />
      </PageContainer>

      {/* create modal */}
      {createBatch && (
        <Modal
          open={createBatch}
          onClose={handleCloseCreateModal}
          title="Create New Batch"
          content={<BatchForm onClose={handleCloseCreateModal} />}
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
          content={<BatchFilterForm />}
          onClose={handleCloseDrawer}
          onOpen={handleOpenDrawer}
        />
      )}
    </>
  );
}
