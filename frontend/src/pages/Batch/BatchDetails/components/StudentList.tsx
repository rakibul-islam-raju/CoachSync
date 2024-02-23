import React from "react";
import { useGetEnrollsQuery } from "../../../../redux/enroll/enrollApi";
import Loader from "../../../../components/Loader";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { Box, ListItemButton, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";

type Props = {
  batchId?: number;
};

const StudentList: React.FC<Props> = ({ batchId }) => {
  const { data, isLoading, isError, error } = useGetEnrollsQuery(
    { batch: batchId },
    { skip: !batchId },
  );

  if (isLoading) return <Loader />;

  if (isError) <ErrorDisplay severity="error" error={error} />;

  if (data && data.results.length < 1)
    return <ErrorDisplay severity="warning" error={"No student found"} />;

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Enrolled Students ({data?.count})
      </Typography>
      <Box maxHeight={550} overflow={"auto"}>
        {data?.results.map(enroll => (
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
    </>
  );
};

export default StudentList;
