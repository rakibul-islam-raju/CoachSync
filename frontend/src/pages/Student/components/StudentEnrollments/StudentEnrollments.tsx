import PreviewIcon from "@mui/icons-material/Preview";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import Modal from "../../../../components/Modal/Modal";
import {
  IEnrollsForStudentDetails,
  IStudentDetails,
} from "../../../../redux/student/student.type";
import { formatDate } from "../../../../utils/formatDate";
import { useCancelEnrollMutation } from "../../../../redux/enroll/enrollApi";
import TransactionHistory from "../TransactionHistory/TransactionHistory";

type Props = {
  studentData: IStudentDetails;
};

const StudentEnrollments: FC<Props> = ({ studentData }) => {
  const [selectedEnroll, setSelectedEnroll] =
    useState<IEnrollsForStudentDetails | null>(null);
  const [cancelEnroll] = useCancelEnrollMutation();

  const handleSelectEnroll = (data: IEnrollsForStudentDetails) =>
    setSelectedEnroll(data);

  const handleCloseTransactionHistory = () => setSelectedEnroll(null);

  useEffect(() => {
    if (selectedEnroll) {
      const updatedEnroll = studentData.enrolls.find(
        enroll => enroll.id === selectedEnroll.id,
      );
      if (updatedEnroll) setSelectedEnroll(updatedEnroll);
    }
  }, [studentData]);

  return (
    <>
      <Box sx={{ maxHeight: 565, overflowY: "auto" }}>
        <Stack
          sx={{
            gap: 1,
          }}
        >
          {studentData.enrolls.map(enroll => (
            <Card key={enroll.id} variant="outlined">
              <CardContent>
                <Stack
                  direction={"row"}
                  sx={{
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">{`Batch: ${enroll.batch.name} (${enroll.batch.classs.numeric})`}</Typography>
                  <IconButton onClick={() => handleSelectEnroll(enroll)}>
                    <PreviewIcon />
                  </IconButton>
                  {enroll.status === "active" && (
                    <IconButton
                      aria-label="Cancel enrollment"
                      onClick={() => {
                        const reason = window.prompt("Cancellation reason");
                        if (reason) cancelEnroll({ id: enroll.id, reason });
                      }}
                    >
                      <CancelIcon />
                    </IconButton>
                  )}
                </Stack>
                <Stack
                  direction={"row"}
                  sx={{
                    justifyContent: "space-between",
                  }}
                >
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
                      Net payable: {enroll.net_payable}
                    </Typography>
                    <Typography variant="body2">
                      Balance: {enroll.balance}
                    </Typography>
                    <Typography variant="body2">
                      Status: {enroll.status}
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
