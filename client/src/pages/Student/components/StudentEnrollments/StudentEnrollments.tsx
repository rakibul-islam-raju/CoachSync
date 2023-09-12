import PreviewIcon from "@mui/icons-material/Preview";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FC } from "react";
import { IStudentDetails } from "../../../../redux/student/student.type";
import { formatDate } from "../../../../utils/formatDate";

type Props = {
  studentData: IStudentDetails;
};

const StudentEnrollments: FC<Props> = ({ studentData }) => {
  return (
    <Box sx={{ maxHeight: 1000, overflowY: "auto" }}>
      <Stack gap={1}>
        {studentData.enrolls.map(enroll => (
          <Card key={enroll.id} variant="outlined">
            <CardContent>
              <Stack direction={"row"} justifyContent={"space-between"}>
                <Typography variant="h6">{`Batch: ${enroll.batch.name} (${enroll.batch.classs.numeric})`}</Typography>
                <IconButton>
                  <PreviewIcon />
                </IconButton>
              </Stack>
              <Stack direction={"row"} justifyContent={"space-between"}>
                <Box>
                  <Typography variant="body2">
                    Start Date:
                    {enroll.batch.start_date
                      ? formatDate(enroll.batch.start_date)
                      : "-"}
                  </Typography>
                  <Typography variant="body2">
                    End Date:
                    {enroll.batch.end_date
                      ? formatDate(enroll.batch.end_date)
                      : "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body1">
                    Fee:
                    {enroll.batch.fee ? enroll.batch.fee : "-"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default StudentEnrollments;
