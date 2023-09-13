import { Box } from "@mui/material";
import { FC, useState } from "react";
import { IEnroll } from "../../../redux/enroll/enroll.type";
import { IStudent } from "../../../redux/student/student.type";
import EnrollForm from "./StudentForm/EnrollForm";
import TransactionForm from "./StudentForm/TransactionForm";

type Props = {
  onClose: () => void;
  studentData?: IStudent;
  defaultData?: IEnroll;
};

const EnrollToTransactionSwitch: FC<Props> = ({
  onClose,
  studentData,
  defaultData,
}) => {
  const [enroll, setEnroll] = useState<IEnroll | null>(null);
  const [showTransaction, setShowTransaction] = useState<boolean>(false);

  const handleShowTransaction = () => setShowTransaction(true);

  const handleSetEnroll = (data: IEnroll) => setEnroll(data);

  return (
    <Box>
      {!showTransaction ? (
        <EnrollForm
          studentData={studentData}
          defaultData={defaultData}
          handleSetEnroll={handleSetEnroll}
          handleShowTransaction={handleShowTransaction}
        />
      ) : (
        enroll && <TransactionForm onClose={onClose} enrollData={enroll} />
      )}
    </Box>
  );
};

export default EnrollToTransactionSwitch;
