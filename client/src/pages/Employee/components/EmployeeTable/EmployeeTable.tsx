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
import { FC } from "react";
import CustomPagination from "../../../../components/CustomPagination/CustomPagination";
import CustomTableContainer from "../../../../components/CustomTable/CustomTableContainer";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../../components/Loader";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { setPage } from "../../../../redux/subject/subjectSlice";
import { useGetUsersQuery } from "../../../../redux/user/userApi";
import { formatDateTime } from "../../../../utils/formatDateTime";

const columns = [
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Active",
  "Action",
];

const EmployeeTable: FC = () => {
  const dispatch = useAppDispatch();
  const { params, page } = useAppSelector(state => state.subject);

  const { data, isLoading, isError, error } = useGetUsersQuery({
    ...params,
  });

  // const [
  //   deleteSubject,
  //   {
  //     isLoading: deleteLoading,
  //     isError: isDeleteError,
  //     error: deleteError,
  //     isSuccess: deleteSuccess,
  //   },
  // ] = useDeleteSubjectMutation();

  // const [itemToEdit, setItemToEdit] = useState<ISubject | undefined>();
  // const [itemToDelete, setItemToDelete] = useState<ISubject | undefined>();

  // const handleOpenEditModal = (data: ISubject) => setItemToEdit(data);

  // const handleCloseEditModal = () => setItemToEdit(undefined);

  // const handleCloseDeleteModal = () => setItemToDelete(undefined);

  // const handleOpenDeleteModal = (data: ISubject) => setItemToDelete(data);

  // const handleDelete = () => {
  //   if (itemToDelete) {
  //     deleteSubject(itemToDelete?.id);
  //   }
  // };

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  // useEffect(() => {
  //   if (deleteSuccess) {
  //     toast.success("Subject successfully deleted!");
  //     handleCloseDeleteModal();
  //   }
  // }, [deleteSuccess]);

  return isLoading ? (
    <Loader />
  ) : isError ? (
    <ErrorDisplay error={error} />
  ) : data?.results && data?.results.length > 0 ? (
    <Box>
      {/* {isDeleteError && <ErrorDisplay error={deleteError} />} */}

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
              <TableCell>{formatDateTime(row.created_at)}</TableCell>
              <TableCell>{formatDateTime(row.updated_at)}</TableCell>
              <TableCell>
                {row.is_active ? <DoneIcon /> : <CloseIcon />}
              </TableCell>
              <TableCell>
                <ButtonGroup>
                  <Tooltip title="Edit">
                    <IconButton
                    // onClick={() => handleOpenEditModal(row)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                    // onClick={() => handleOpenDeleteModal(row)}
                    // disabled={deleteLoading}
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
      {/* {itemToEdit && (
        <Modal
          open={!!itemToEdit}
          onClose={handleCloseEditModal}
          title="Edit Batch"
          content={
            <SubjectForm
              onClose={handleCloseEditModal}
              defaultData={itemToEdit}
            />
          }
          onConfirm={handleCloseEditModal}
          onCancel={handleCloseEditModal}
          maxWidth="sm"
          fullWidth
        />
      )} */}

      {/* delete confirm modal */}
      {/* {itemToDelete && (
        <ConfirmDialogue
          open={!!itemToDelete}
          title="Delete Batch"
          message={"Are you want to delete this Subject?"}
          handleSubmit={handleDelete}
          handleClose={handleCloseDeleteModal}
        />
      )} */}
    </Box>
  ) : (
    <ErrorDisplay severity="warning" error={"No data found!"} />
  );
};

export default EmployeeTable;
