import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, BoxProps, Divider, Grid, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ConfirmDialogue from "../../components/ConfirmDialogue/ConfirmDialogue";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal/Modal";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
  useDeleteStudentMutation,
  useGetStudentQuery,
} from "../../redux/student/studentApi";
import { formatDateTime } from "../../utils/formatDateTime";
import StudentForm from "./components/StudentForm/StudentForm";

const breadCrumbList = [
  {
    label: "Dashboard",
    path: "/",
  },
  {
    label: "Student",
    path: "/students",
  },
  {
    label: "Student Details",
    path: "/students",
  },
];

const ItemWrapper = styled(Box)<BoxProps>({
  display: "flex",
  columnGap: "10px",
  alignItems: "baseline",
});

const StudentDetails: FC = () => {
  const { studentId } = useParams();

  const {
    data: student,
    isLoading,
    isError,
    error,
  } = useGetStudentQuery(String(studentId), {
    skip: !studentId,
  });

  const [
    deleteStudent,
    { isLoading: deleteLoading, isError: isDeleteError, error: deleteError },
  ] = useDeleteStudentMutation();

  const [editStudent, setEditStudent] = useState<boolean>(false);
  const [deleteStudentModal, setDeleteStudentModal] = useState<boolean>(false);

  const handleOpenCreateModal = () => setEditStudent(true);

  const handleCloseCreateModal = () => setEditStudent(false);

  const handleCloseModal = () => setDeleteStudentModal(false);

  const handleDeleteStudent = () => {
    if (student?.id) deleteStudent(student?.id);
  };

  useEffect(() => {
    if (studentId) breadCrumbList[breadCrumbList.length - 1].label = studentId;
  }, [studentId]);

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
          <Typography variant="h4">
            {student?.user.first_name} {student?.user.last_name}
          </Typography>
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
              onClick={() => setDeleteStudentModal(true)}
            >
              <DeleteIcon sx={{ mr: 1 }} /> Delete
            </CustomButton>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Student Info
            </Typography>
            <ItemWrapper>
              <Typography>Name:</Typography>
              <Typography color={"GrayText"}>
                {student?.user.first_name} {student?.user.last_name}
              </Typography>
            </ItemWrapper>
            <ItemWrapper>
              <Typography>Email:</Typography>
              <Typography color={"GrayText"}>{student?.user.email}</Typography>
            </ItemWrapper>
            <ItemWrapper>
              <Typography>Phone:</Typography>
              <Typography color={"GrayText"}>{student?.user.phone}</Typography>
            </ItemWrapper>
            <ItemWrapper>
              <Typography>Emergency Contact:</Typography>
              <Typography color={"GrayText"}>
                {student?.emergency_contact_no}
              </Typography>
            </ItemWrapper>
            <ItemWrapper>
              <Typography>Blood Group:</Typography>
              <Typography color={"GrayText"}>
                {student?.blood_group ?? "-"}
              </Typography>
            </ItemWrapper>
            <ItemWrapper>
              <Typography>Address:</Typography>
              <Typography color={"GrayText"}>{student?.address}</Typography>
            </ItemWrapper>
            <ItemWrapper>
              <Typography>Description:</Typography>
              <Typography color={"GrayText"}>{student?.description}</Typography>
            </ItemWrapper>
            <ItemWrapper>
              <Typography>Created at:</Typography>
              <Typography color={"GrayText"}>
                {student?.created_at
                  ? formatDateTime(student?.created_at)
                  : "-"}
              </Typography>
            </ItemWrapper>
            <ItemWrapper>
              <Typography>Updated at:</Typography>
              <Typography color={"GrayText"}>
                {student?.updated_at
                  ? formatDateTime(student?.updated_at)
                  : "-"}
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
      {editStudent && student && (
        <Modal
          open={editStudent}
          onClose={handleCloseCreateModal}
          title="Edit Student"
          content={
            <StudentForm
              onClose={handleCloseCreateModal}
              defaultData={student}
            />
          }
          onConfirm={handleCloseCreateModal}
          onCancel={handleCloseCreateModal}
          maxWidth="sm"
          fullWidth
        />
      )}

      {/* delete confirm modal */}
      <ConfirmDialogue
        open={deleteStudentModal}
        title="Delete Student"
        message={"Are you want to delete this student?"}
        handleSubmit={handleDeleteStudent}
        handleClose={handleCloseModal}
      />
    </>
  );
};

export default StudentDetails;
