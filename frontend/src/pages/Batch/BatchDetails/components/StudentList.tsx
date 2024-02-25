/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState } from "react";
import { useGetEnrollsQuery } from "../../../../redux/enroll/enrollApi";
import Loader from "../../../../components/Loader";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { Box, ListItemButton, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import CustomPagination from "../../../../components/CustomPagination/CustomPagination";

const RESULTS_PER_PAGE: number = 10;

type Props = {
  batchId?: number;
};

const StudentList: React.FC<Props> = ({ batchId }) => {
  const [page, setPage] = useState(1);

  const offset: number = (Number(page) - 1) * Number(RESULTS_PER_PAGE);

  const {
    data: enrolls,
    isLoading,
    isError,
    error,
  } = useGetEnrollsQuery(
    { batch: batchId, limit: RESULTS_PER_PAGE, offset },
    { skip: !batchId },
  );

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (isLoading) return <Loader />;

  if (isError) <ErrorDisplay severity="error" error={error} />;

  if (enrolls && enrolls.results.length < 1)
    return <ErrorDisplay severity="warning" error={"No student found"} />;

  return (
    enrolls && (
      <>
        <Typography variant="h5" gutterBottom>
          Enrolled Students ({enrolls?.count})
        </Typography>

        <Box>
          {enrolls?.results?.map(enroll => (
            <ListItemButton
              dense
              key={enroll.id}
              component={Link}
              to={`/students/${enroll.student.id}`}
            >
              <ListItemText
                primary={`${enroll.student.user.full_name} (${enroll.student.student_id})`}
              />
            </ListItemButton>
          ))}
        </Box>

        <CustomPagination
          page={page}
          handleChange={handlePageChange}
          count={Math.ceil(enrolls?.count / RESULTS_PER_PAGE)}
        />
      </>
    )
  );
};

export default StudentList;
