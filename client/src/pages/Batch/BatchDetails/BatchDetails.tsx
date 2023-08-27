import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, BoxProps, Divider, Grid, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ConfirmDialogue from "../../../components/ConfirmDialogue/ConfirmDialogue";
import CustomBreadcrumb from "../../../components/CustomBreadcrumb";
import { CustomButton } from "../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../components/Loader";
import Modal from "../../../components/Modal/Modal";
import PageContainer from "../../../components/PageContainer/PageContainer";
import {
  useDeleteBatchMutation,
  useGetBatchQuery,
} from "../../../redux/batch/batchApi";
import { formatDate } from "../../../utils/formatDate";
import BatchForm from "../components/BatchForm/BatchForm";

const breadCrumbList = [
  {
    label: "Dashboard",
    path: "/",
  },
  {
    label: "Batch",
    path: "/batches",
  },
  {
    label: "Batch Details",
    path: "/batches",
  },
];

const ItemWrapper = styled(Box)<BoxProps>({
  display: "flex",
  columnGap: "10px",
  alignItems: "baseline",
});

const BatchDetails: FC = () => {
  const { batchId, batchName } = useParams();

  const {
    data: batch,
    isLoading,
    isError,
    error,
  } = useGetBatchQuery(Number(batchId), {
    skip: !batchId,
  });

  const [
    deleteBatch,
    { isLoading: deleteLoading, isError: isDeleteError, error: deleteError },
  ] = useDeleteBatchMutation();

  const [editBatch, setEditBatch] = useState<boolean>(false);
  const [deleteBatchModal, setDeleteBatchModal] = useState<boolean>(false);

  const handleOpenCreateModal = () => setEditBatch(true);

  const handleCloseCreateModal = () => setEditBatch(false);

  const handleCloseModal = () => setDeleteBatchModal(false);

  const handleDeleteBatch = () => {
    if (batch?.id) deleteBatch(batch?.id);
  };

  useEffect(() => {
    if (batchName) breadCrumbList[breadCrumbList.length - 1].label = batchName;
  }, [batchName]);

  return (
    <>
      <CustomBreadcrumb list={breadCrumbList} />
      <PageContainer>
        {isLoading && <Loader />}
        {(isError || isDeleteError) && (
          <ErrorDisplay error={error || deleteError} />
        )}

        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"baseline"}
        >
          <Typography variant="h4">{batch?.name}</Typography>
          <Stack direction={"row"} justifyContent={"flex-end"} gap={1}>
            <CustomButton
              size="small"
              variant="outlined"
              onClick={handleOpenCreateModal}
            >
              <EditIcon sx={{ mr: 1 }} /> Edit
            </CustomButton>
            <CustomButton
              size="small"
              variant="outlined"
              color="error"
              disabled={deleteLoading}
              onClick={() => setDeleteBatchModal(true)}
            >
              <DeleteIcon sx={{ mr: 1 }} /> Delete
            </CustomButton>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Batch Info
            </Typography>
            <ItemWrapper>
              <Typography>Name:</Typography>
              <Typography color={"GrayText"}>{batch?.name}</Typography>
            </ItemWrapper>
            <ItemWrapper>
              <Typography>Class:</Typography>
              <Typography color={"GrayText"}>
                {batch?.classs.name}({batch?.classs.numeric})
              </Typography>
            </ItemWrapper>
            <ItemWrapper>
              <Typography>Fee:</Typography>
              <Typography color={"GrayText"}>{batch?.fee ?? "-"}</Typography>
            </ItemWrapper>
            <ItemWrapper>
              <Typography>Start Date:</Typography>
              <Typography color={"GrayText"}>
                {batch?.start_date ? formatDate(batch?.start_date) : "-"}
              </Typography>
            </ItemWrapper>
            <ItemWrapper>
              <Typography>Start Date:</Typography>
              <Typography color={"GrayText"}>
                {batch?.end_date ? formatDate(batch?.end_date) : "-"}
              </Typography>
            </ItemWrapper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Students
            </Typography>
          </Grid>
        </Grid>
      </PageContainer>

      {/* create modal */}
      {editBatch && batch && (
        <Modal
          open={editBatch}
          onClose={handleCloseCreateModal}
          title="Edit Batch"
          content={
            <BatchForm onClose={handleCloseCreateModal} defaultData={batch} />
          }
          onConfirm={handleCloseCreateModal}
          onCancel={handleCloseCreateModal}
          maxWidth="sm"
          fullWidth
        />
      )}

      {/* delete confirm modal */}
      <ConfirmDialogue
        open={deleteBatchModal}
        title="Delete Batch"
        message={"Are you want to delete this batch?"}
        handleSubmit={handleDeleteBatch}
        handleClose={handleCloseModal}
      />
    </>
  );
};

export default BatchDetails;
