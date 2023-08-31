/* eslint-disable @typescript-eslint/no-explicit-any */

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
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
import { mapRole } from "../../../../helpers/mapRoles";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { setPage } from "../../../../redux/subject/subjectSlice";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from "../../../../redux/user/userApi";
import EmployeeForm from "../EmployeeForm/EmployeeForm";

const columns = [
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Role",
  "Active",
  "Action",
];

const EmployeeTable: FC = () => {
  const dispatch = useAppDispatch();
  const { params, page } = useAppSelector(state => state.subject);

  const { data, isLoading, isError, error } = useGetUsersQuery({
    ...params,
  });

  const [
    deleteUser,
    {
      isLoading: deleteLoading,
      isError: isDeleteError,
      error: deleteError,
      isSuccess: deleteSuccess,
    },
  ] = useDeleteUserMutation();

  const [itemToEdit, setItemToEdit] = useState<IUser | undefined>();
  const [itemToDelete, setItemToDelete] = useState<IUser | undefined>();

  const handleOpenEditModal = (data: IUser) => setItemToEdit(data);

  const handleCloseEditModal = () => setItemToEdit(undefined);

  const handleCloseDeleteModal = () => setItemToDelete(undefined);

  const handleOpenDeleteModal = (data: IUser) => setItemToDelete(data);

  const handleDelete = () => {
    if (itemToDelete) {
      deleteUser(itemToDelete?.id);
    }
  };

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  useEffect(() => {
    if (deleteSuccess) {
      toast.success("User successfully deleted!");
      handleCloseDeleteModal();
    }
  }, [deleteSuccess]);

  return isLoading ? (
    <Loader />
  ) : isError ? (
    <ErrorDisplay error={error} />
  ) : data?.results && data?.results.length > 0 ? (
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
                {row.first_name}
              </TableCell>
              <TableCell>{row.last_name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell>{row.role ? mapRole(row.role) : ""}</TableCell>
              <TableCell>
                {row.is_active ? <DoneIcon /> : <CloseIcon />}
              </TableCell>
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

      {/* edit modal */}
      {itemToEdit && (
        <Modal
          open={!!itemToEdit}
          onClose={handleCloseEditModal}
          title="Edit Batch"
          content={
            <EmployeeForm
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
          title="Delete Employee"
          message={"Are you want to delete this Employee?"}
          handleSubmit={handleDelete}
          handleClose={handleCloseDeleteModal}
        />
      )}
    </Box>
  ) : (
    <ErrorDisplay severity="warning" error={"No data found!"} />
  );
};

export default EmployeeTable;
