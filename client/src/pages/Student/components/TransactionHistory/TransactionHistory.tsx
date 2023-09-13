import { Box, Chip, TableBody, TableCell, TableRow } from "@mui/material";
import { FC, useState } from "react";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import CustomTableContainer from "../../../../components/CustomTable/CustomTableContainer";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../../components/Loader";
import Modal from "../../../../components/Modal/Modal";
import { useAppSelector } from "../../../../redux/hook";
import { IEnrollsForStudentDetails } from "../../../../redux/student/student.type";
import { useGetTransactionsQuery } from "../../../../redux/transaction/transactionApi";
import { formatDateTime } from "../../../../utils/formatDateTime";
import TransactionForm from "../StudentForm/TransactionForm";

const columns = ["Date", "Amount", "Remark"];

type TransactionHistoryProps = {
  enrollData: IEnrollsForStudentDetails;
  onClose?: () => void;
};

const TransactionHistory: FC<TransactionHistoryProps> = ({ enrollData }) => {
  const { params } = useAppSelector(state => state.transaction);

  const {
    data: enrolls,
    isError,
    isLoading,
    error,
  } = useGetTransactionsQuery({
    ...params,
    enroll: enrollData.id,
  });

  const [transactionModal, setTransactionModal] = useState(false);

  const handleOpenModal = () => setTransactionModal(true);

  const handleCloseModal = () => setTransactionModal(false);

  return (
    <>
      <Box display={"flex"} justifyContent={"space-between"} mb={2}>
        <Chip label={`Total: ${enrollData.total_amount}`} color="primary" />
        <Chip label={`Paid: ${enrollData.total_paid}`} color="success" />
        <Chip
          label={`Due: ${
            Number(enrollData.total_amount) - Number(enrollData.total_paid)
          }`}
          color="error"
        />
        <CustomButton size="small" onClick={handleOpenModal}>
          New Transaction
        </CustomButton>
      </Box>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <ErrorDisplay error={error} />
      ) : enrolls?.results && enrolls?.results.length === 0 ? (
        <ErrorDisplay severity="warning" error={"No data found!"} />
      ) : (
        <CustomTableContainer columns={columns}>
          <TableBody>
            {enrolls?.results.map(enroll => (
              <TableRow
                key={enroll.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {formatDateTime(enroll.created_at)}
                </TableCell>
                <TableCell>{enroll.amount}</TableCell>
                <TableCell>{enroll.remark}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </CustomTableContainer>
      )}

      {transactionModal && (
        <Modal
          open={transactionModal}
          onClose={handleCloseModal}
          title="New Transaction"
          content={
            <TransactionForm
              onClose={handleCloseModal}
              enrollData={enrollData}
            />
          }
          maxWidth="sm"
          fullWidth
        />
      )}
    </>
  );
};

export default TransactionHistory;
