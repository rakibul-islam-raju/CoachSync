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
import { IClass } from "../../../../redux/class/class.type";
import {
  useDeleteClassMutation,
  useGetClassesQuery,
} from "../../../../redux/class/classApi";
import { setPage } from "../../../../redux/class/classSlice";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { formatDate } from "../../../../utils/formatDate";
import ClassForm from "../ClassForm/ClassForm";

const columns = [
  "Class Name",
  "Numeric",
  "Created At",
  "Updated At",
  "Active",
  "Action",
];

const ClassTable: FC = () => {
  const dispatch = useAppDispatch();
  const { params, page } = useAppSelector(state => state.class);

  const { data, isLoading, isError, error } = useGetClassesQuery({
    ...params,
  });

  const [
    deleteClass,
    {
      isLoading: deleteLoading,
      isError: isDeleteError,
      error: deleteError,
      isSuccess: deleteSuccess,
    },
  ] = useDeleteClassMutation();

  const [itemToEdit, setItemToEdit] = useState<IClass | undefined>();
  const [itemToDelete, setItemToDelete] = useState<IClass | undefined>();

  const handleOpenEditModal = (data: IClass) => setItemToEdit(data);

  const handleCloseEditModal = () => setItemToEdit(undefined);

  const handleCloseDeleteModal = () => setItemToDelete(undefined);

  const handleOpenDeleteModal = (data: IClass) => setItemToDelete(data);

  const handleDelete = () => {
    if (itemToDelete) {
      deleteClass(itemToDelete?.id);
    }
  };

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  useEffect(() => {
    if (deleteSuccess) {
      toast.success("Class successfully deleted!");
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
                {row.name}
              </TableCell>
              <TableCell>{row.numeric}</TableCell>
              <TableCell>{formatDate(row.created_at)}</TableCell>
              <TableCell>{formatDate(row.updated_at)}</TableCell>
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
            <ClassForm
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
          title="Delete Class"
          message={"Are you want to delete this Class?"}
          handleSubmit={handleDelete}
          handleClose={handleCloseDeleteModal}
        />
      )}
    </Box>
  ) : (
    <ErrorDisplay severity="warning" error={"No data found!"} />
  );
};

export default ClassTable;
