/* eslint-disable @typescript-eslint/no-explicit-any */
import PreviewIcon from "@mui/icons-material/Preview";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import {
  ButtonGroup,
  IconButton,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";
import CustomPagination from "../../../../components/CustomPagination/CustomPagination";
import CustomTableContainer from "../../../../components/CustomTable/CustomTableContainer";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../../components/Loader";
import { useGetBatchesQuery } from "../../../../redux/batch/batchApi";
import { setPage } from "../../../../redux/batch/batchSlice";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { formatDate } from "../../../../utils/formatDate";
import { useNavigate } from "react-router-dom";

const columns = [
  "Name",
  "Code",
  "Fee",
  "Class",
  "Start Date",
  "End Date",
  "Active",
  "Action",
];

const BatchTable: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { params, page } = useAppSelector(state => state.batch);

  const { data, isLoading, isError, error } = useGetBatchesQuery({
    ...params,
  });

  // const [
  //   deleteBatch,
  //   { isError: isDeleteError, error: deleteError, isSuccess: deleteSuccess },
  // ] = useDeleteBatchMutation();

  // const [itemToEdit, setItemToEdit] = useState<IBatch | undefined>();
  // const [itemToDelete, setItemToDelete] = useState<IBatch | undefined>();

  // const handleOpenEditModal = (data: IBatch) => setItemToEdit(data);

  // const handleCloseEditModal = () => setItemToEdit(undefined);

  // const handleCloseDeleteModal = () => setItemToDelete(undefined);

  // const handleOpenDeleteModal = (data: IBatch) => setItemToDelete(data);

  // const handleDelete = () => {
  //   if (itemToDelete) {
  //     deleteBatch(itemToDelete?.id);
  //   }
  // };

  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  // useEffect(() => {
  //   if (deleteSuccess) {
  //     toast.success("Batch successfully deleted!");
  //     handleCloseDeleteModal();
  //   }
  // }, [deleteSuccess]);

  return isLoading ? (
    <Loader />
  ) : isError ? (
    <ErrorDisplay error={error} />
  ) : (
    data?.results &&
    data?.results.length > 0 && (
      <Box>
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
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.fee}</TableCell>
                <TableCell>{row.classs.name}</TableCell>
                <TableCell>
                  {row?.start_date ? formatDate(row.start_date) : ""}
                </TableCell>
                <TableCell>
                  {row?.end_date ? formatDate(row.end_date) : ""}
                </TableCell>
                <TableCell>
                  {row.is_active ? <DoneIcon /> : <CloseIcon />}
                </TableCell>
                <TableCell>
                  <ButtonGroup>
                    <Tooltip title="Preview">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          navigate(`/batches/${row.id}/${row.name}`)
                        }
                      >
                        <PreviewIcon />
                      </IconButton>
                    </Tooltip>
                    {/* <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEditModal(row)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteModal(row)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip> */}
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
            title="Edit Employee"
            content={
              <BatchForm
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
            message={"Are you want to delete this batch?"}
            handleSubmit={handleDelete}
            handleClose={handleCloseDeleteModal}
          />
        )} */}
      </Box>
    )
  );
};

export default BatchTable;
