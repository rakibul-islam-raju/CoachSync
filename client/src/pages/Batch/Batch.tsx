import SearchIcon from "@mui/icons-material/Search";
import {
  Button,
  Divider,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import Modal from "../../components/Modal/Modal";
import PageContainer from "../../components/PageContainer/PageContainer";
import TextInput from "../../components/forms/TextInput";
import { useDebounce } from "../../hooks/useDebounce";
import { setParams } from "../../redux/batch/batchSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import BatchForm from "./components/BatchForm/BatchForm";
import BatchTable from "./components/BatchTable/BatchTable";

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

  // get debounced search term
  const debouncedSearchTerm = useDebounce(searchText, 500);

  const handleOpenCreateModal = () => setCreateBatch(true);

  const handleCloseCreateModal = () => setCreateBatch(false);

  useEffect(() => {
    dispatch(setParams({ search: debouncedSearchTerm }));
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
            gap={2}
            flexWrap={"wrap"}
          >
            <TextInput
              onChange={e => setSearchText(e.target.value)}
              label="Search Batch"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="contained" onClick={handleOpenCreateModal}>
              Add Batch
            </Button>
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
    </>
  );
}
