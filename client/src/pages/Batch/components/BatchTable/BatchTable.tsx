/* eslint-disable @typescript-eslint/no-explicit-any */

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
import CustomTableContainer from "../../../../components/CustomTable/CustomTableContainer";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../../components/Loader";
import { useGetBatchesQuery } from "../../../../redux/batch/batchApi";
import { useAppSelector } from "../../../../redux/hook";
import { formatDate } from "../../../../utils/formatDate";

const columns = [
  "Name",
  "Code",
  "Fee",
  "Class",
  "Start Date",
  "End Date",
  "Action",
];

const BatchTable: FC = () => {
  // const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { params } = useAppSelector(state => state.batch);

  const { data, isLoading, isError, error } = useGetBatchesQuery({
    ...params,
  });

  // const handlePaginationModelChange = (pageModel: GridPaginationModel) => {
  //   const limit = pageModel.pageSize;
  //   const offset = pageModel.page * pageModel.pageSize;
  //   dispatch(setParams({ limit, offset }));
  // };

  return isLoading ? (
    <Loader />
  ) : (
    <Box>
      {isError && <ErrorDisplay error={error} />}

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
                {row?.start_date ? formatDate(row.start_date) : "-"}
              </TableCell>
              <TableCell>
                {row?.end_date ? formatDate(row.end_date) : "-"}
              </TableCell>
              <TableCell>
                <ButtonGroup>
                  <Tooltip title="Preview">
                    <IconButton
                      onClick={() => navigate(`/batches/${row.id}/${row.name}`)}
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
    </Box>
  );
};

export default BatchTable;
