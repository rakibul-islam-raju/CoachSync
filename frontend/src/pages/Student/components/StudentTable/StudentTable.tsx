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
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { useGetStudentsQuery } from "../../../../redux/student/studentApi";
import { setPage } from "../../../../redux/student/studentSlice";
import { formatDate } from "../../../../utils/formatDate";

const columns = [
  "Student ID",
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Created At",
  "Updated At",
  "Active",
  "Action",
];

const StudentTable: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { params, page } = useAppSelector(state => state.student);

  console.log("params  ===>", { ...params });

  const { data, isLoading, isError, error } = useGetStudentsQuery({
    ...params,
  });

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  return isLoading ? (
    <Loader />
  ) : isError ? (
    <ErrorDisplay error={error} />
  ) : data?.results && data?.results.length > 0 ? (
    <>
      <Box>
        <CustomTableContainer columns={columns}>
          <TableBody>
            {data?.results.map(row => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.student_id}
                </TableCell>
                <TableCell>{row.user.first_name}</TableCell>
                <TableCell>{row.user.last_name}</TableCell>
                <TableCell>{row.user.email}</TableCell>
                <TableCell>{row.user.phone}</TableCell>
                <TableCell>{formatDate(row.created_at)}</TableCell>
                <TableCell>{formatDate(row.updated_at)}</TableCell>
                <TableCell>
                  {row.is_active ? <DoneIcon /> : <CloseIcon />}
                </TableCell>
                <TableCell>
                  <ButtonGroup>
                    <Tooltip title="Details">
                      <IconButton
                        onClick={() => navigate(`/students/${row.student_id}`)}
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
    </>
  ) : (
    <ErrorDisplay severity="warning" error={"No data found!"} />
  );
};

export default StudentTable;
