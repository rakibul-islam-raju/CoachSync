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
import { ISchedule } from "../../../../redux/schedule/schedule.type";
import {
  useDeleteScheduleMutation,
  useGetSchedulesQuery,
} from "../../../../redux/schedule/scheduleApi";
import { setPage } from "../../../../redux/schedule/scheduleSlice";
import { formatDate } from "../../../../utils/formatDate";
import ScheduleAddForm from "../scheduleForm/scheduleAddForm";

const columns = [
  "Title",
  "Subject",
  "Batch",
  "Teacher",
  "Duration",
  "Time",
  "Date",
  "Action",
];

const ScheduleTable: FC = () => {
  const dispatch = useAppDispatch();
  const { params, page } = useAppSelector(state => state.schedule);

  const { data, isLoading, isError, error } = useGetSchedulesQuery({
    ...params,
  });

  const [
    deleteSubject,
    {
      isLoading: deleteLoading,
      isError: isDeleteError,
      error: deleteError,
      isSuccess: deleteSuccess,
    },
  ] = useDeleteScheduleMutation();

  const [itemToEdit, setItemToEdit] = useState<ISchedule | undefined>();
  const [itemToDelete, setItemToDelete] = useState<ISchedule | undefined>();

  const handleOpenEditModal = (data: ISchedule) => setItemToEdit(data);

  const handleCloseEditModal = () => setItemToEdit(undefined);

  const handleCloseDeleteModal = () => setItemToDelete(undefined);

  const handleOpenDeleteModal = (data: ISchedule) => setItemToDelete(data);

  const handleDelete = () => {
    if (itemToDelete) {
      deleteSubject(itemToDelete?.id);
    }
  };

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  useEffect(() => {
    if (deleteSuccess) {
      toast.success("Schedule successfully deleted!");
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
                {row.title}
              </TableCell>
              <TableCell>{row.subject.name}</TableCell>
              <TableCell>{row.batch.name}</TableCell>
              <TableCell>
                {row?.teacher?.user.first_name +
                  " " +
                  row?.teacher?.user.last_name}
              </TableCell>
              <TableCell>
                <TableCell>{row.duration}</TableCell>
              </TableCell>
              <TableCell>
                <TableCell>{row.time}</TableCell>
              </TableCell>
              <TableCell>{formatDate(row.date)}</TableCell>

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
          content={<ScheduleAddForm />}
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
          message={"Are you want to delete this Subject?"}
          handleSubmit={handleDelete}
          handleClose={handleCloseDeleteModal}
        />
      )}
    </Box>
  ) : (
    <ErrorDisplay severity="warning" error={"No data found!"} />
  );
};

export default ScheduleTable;
