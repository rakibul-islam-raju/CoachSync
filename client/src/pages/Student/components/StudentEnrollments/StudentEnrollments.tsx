import PreviewIcon from "@mui/icons-material/Preview";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FC, useState } from "react";
import Modal from "../../../../components/Modal/Modal";
import {
  IEnrollsForStudentDetails,
  IStudentDetails,
} from "../../../../redux/student/student.type";
import { formatDate } from "../../../../utils/formatDate";
import TransactionHistory from "../TransactionHistory/TransactionHistory";

type Props = {
  studentData: IStudentDetails;
};

const StudentEnrollments: FC<Props> = ({ studentData }) => {
  const [selectedEnroll, setSelectedEnroll] =
    useState<IEnrollsForStudentDetails | null>(null);

  const handleSelectEnroll = (data: IEnrollsForStudentDetails) =>
    setSelectedEnroll(data);

  const handleCloseTransactionHistory = () => setSelectedEnroll(null);

  return (
    <>
      <Box sx={{ maxHeight: 565, overflowY: "auto" }}>
        <Stack gap={1}>
          {studentData.enrolls.map(enroll => (
            <Card key={enroll.id} variant="outlined">
              <CardContent>
                <Stack direction={"row"} justifyContent={"space-between"}>
                  <Typography variant="h6">{`Batch: ${enroll.batch.name} (${enroll.batch.classs.numeric})`}</Typography>
                  <IconButton onClick={() => handleSelectEnroll(enroll)}>
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
                    <Typography variant="body2">
                      Total: {enroll.total_amount}
                    </Typography>
                    <Typography variant="body2">
                      Batch Fee: {enroll.batch.fee ?? "-"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
      {selectedEnroll && (
        <Modal
          open={!!selectedEnroll}
          onClose={handleCloseTransactionHistory}
          title={selectedEnroll.batch.name}
          content={<TransactionHistory enrollData={selectedEnroll} />}
          maxWidth="md"
          fullWidth
        />
      )}
    </>
  );
};

export default StudentEnrollments;
