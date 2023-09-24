/* eslint-disable @typescript-eslint/no-explicit-any */

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import PreviewIcon from "@mui/icons-material/Preview";
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
import { useNavigate } from "react-router-dom";
import CustomPagination from "../../../../components/CustomPagination/CustomPagination";
import CustomTableContainer from "../../../../components/CustomTable/CustomTableContainer";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../../components/Loader";
import { useGetBatchesQuery } from "../../../../redux/batch/batchApi";
import { setPage } from "../../../../redux/batch/batchSlice";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { formatDate } from "../../../../utils/formatDate";

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

const BatchTable: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { params, page } = useAppSelector(state => state.batch);

  const { data, isLoading, isError, error } = useGetBatchesQuery({
    ...params,
  });

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

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
                        onClick={() =>
                          navigate(`/batches/${row.id}/${row.name}`)
                        }
                      >
                        <PreviewIcon />
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
    )
  );
};

export default BatchTable;
