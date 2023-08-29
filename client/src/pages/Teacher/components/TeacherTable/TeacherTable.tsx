/* eslint-disable @typescript-eslint/no-explicit-any */

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  ButtonGroup,
  IconButton,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";
import { FC, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ConfirmDialogue from "../../../../components/ConfirmDialogue/ConfirmDialogue";
import CustomPagination from "../../../../components/CustomPagination/CustomPagination";
import CustomTableContainer from "../../../../components/CustomTable/CustomTableContainer";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../../components/Loader";
import Modal from "../../../../components/Modal/Modal";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { ITeacher } from "../../../../redux/teacher/teacher.type";
import {
  useDeleteTeacherMutation,
  useGetTeachersQuery,
} from "../../../../redux/teacher/teacherApi";
import { setPage } from "../../../../redux/teacher/teacherSlice";
import { formatDate } from "../../../../utils/formatDate";
import TeacherForm from "../TeacherForm/TeacherForm";

const columns = [
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Created At",
  "Updated At",
  "Active",
  "Action",
];

const TeacherTable: FC = () => {
  const dispatch = useAppDispatch();
  const { params, page } = useAppSelector(state => state.teacher);

  const { data, isLoading, isError, error } = useGetTeachersQuery({
    ...params,
  });

  const [
    deleteTeacher,
    {
      isLoading: deleteLoading,
      isError: isDeleteError,
      error: deleteError,
      isSuccess: deleteSuccess,
    },
  ] = useDeleteTeacherMutation();

  const [itemToEdit, setItemToEdit] = useState<ITeacher | undefined>();
  const [itemToDelete, setItemToDelete] = useState<ITeacher | undefined>();

  const handleOpenEditModal = (data: ITeacher) => setItemToEdit(data);

  const handleCloseEditModal = () => setItemToEdit(undefined);

  const handleCloseDeleteModal = () => setItemToDelete(undefined);

  const handleOpenDeleteModal = (data: ITeacher) => setItemToDelete(data);

  const handleDelete = () => {
    if (itemToDelete) {
      deleteTeacher(itemToDelete?.id);
    }
  };

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  useEffect(() => {
    if (deleteSuccess) {
      toast.success("Teacher successfully deleted!");
      handleCloseDeleteModal();
    }
  }, [deleteSuccess]);

  return isLoading ? (
    <Loader />
  ) : isError ? (
    <ErrorDisplay error={error} />
  ) : data?.results && data?.results.length > 0 ? (
    <>
      <Box>
        {isDeleteError && <ErrorDisplay error={deleteError} />}

        <CustomTableContainer columns={columns}>
          <TableBody>
            {data?.results.map(row => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.user.first_name}
                </TableCell>
                <TableCell>{row.user.last_name}</TableCell>
                <TableCell>{row.user.email}</TableCell>
                <TableCell>{row.user.phone}</TableCell>
                <TableCell>{formatDate(row.created_at)}</TableCell>
                <TableCell>{formatDate(row.updated_at)}</TableCell>
                <TableCell>{row.is_active ? "yes" : "No"}</TableCell>
                <TableCell>
                  <ButtonGroup>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenEditModal(row)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleOpenDeleteModal(row)}
                        disabled={deleteLoading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </CustomTableContainer>

        <CustomPagination
          page={page}
          handleChange={handleChange}
          count={Math.ceil(data.count / params.limit)}
        />
      </Box>

      {/* edit modal */}
      {itemToEdit && (
        <Modal
          open={!!itemToEdit}
          onClose={handleCloseEditModal}
          title="Edit Batch"
          content={
            <TeacherForm
              onClose={handleCloseEditModal}
              defaultData={itemToEdit}
            />
          }
          onConfirm={handleCloseEditModal}
          onCancel={handleCloseEditModal}
          maxWidth="sm"
          fullWidth
        />
      )}

      {/* delete confirm modal */}
      {itemToDelete && (
        <ConfirmDialogue
          open={!!itemToDelete}
          title="Delete Batch"
          message={"Are you want to delete this Teacher?"}
          handleSubmit={handleDelete}
          handleClose={handleCloseDeleteModal}
        />
      )}
    </>
  ) : (
    <ErrorDisplay severity="warning" error={"No data found!"} />
  );
};

export default TeacherTable;
