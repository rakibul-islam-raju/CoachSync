import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import {
  Box,
  Chip,
  IconButton,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import PrintIcon from "@mui/icons-material/Print";
import { FC, useState } from "react";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import CustomTableContainer from "../../../../components/CustomTable/CustomTableContainer";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import Loader from "../../../../components/Loader";
import Modal from "../../../../components/Modal/Modal";
import { useAppSelector } from "../../../../redux/hook";
import { IEnrollsForStudentDetails } from "../../../../redux/student/student.type";
import { ITransaction } from "../../../../redux/transaction/transaction.type";
import {
  useGetTransactionsQuery,
  useReverseTransactionMutation,
} from "../../../../redux/transaction/transactionApi";
import { formatDateTime } from "../../../../utils/formatDateTime";
import TransactionForm from "../StudentForm/TransactionForm";

function amountType(amount: number, type: "payment" | "reversal") {
  const isNeg = type === "reversal";
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
      }}
    >
      {isNeg ? (
        <ArrowCircleUpIcon color="error" />
      ) : (
        <ArrowCircleDownIcon color="success" />
      )}
      {Math.abs(amount)}
    </Box>
  );
}

const columns = ["Date", "Type", "Amount", "Remark", "Actions"];

function printReceipt(
  transaction: ITransaction,
  enrollment: IEnrollsForStudentDetails,
) {
  const receipt = window.open("", "_blank", "width=640,height=720");
  if (!receipt) return;
  receipt.opener = null;
  const body = receipt.document.body;
  const title = receipt.document.createElement("h1");
  title.textContent = "CoachSync payment receipt";
  body.appendChild(title);
  [
    `Receipt: #${transaction.id}`,
    `Enrollment: #${enrollment.id}`,
    `Batch: ${enrollment.batch.name}`,
    `Date: ${formatDateTime(transaction.created_at)}`,
    `Type: ${transaction.transaction_type}`,
    `Amount: ${transaction.amount}`,
    `Remark: ${transaction.remark || "—"}`,
  ].forEach(value => {
    const line = receipt.document.createElement("p");
    line.textContent = value;
    body.appendChild(line);
  });
  receipt.print();
}

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
  const [reverseTransaction] = useReverseTransactionMutation();

  const handleOpenModal = () => setTransactionModal(true);

  const handleCloseModal = () => setTransactionModal(false);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Chip label={`Net: ${enrollData.net_payable}`} color="primary" />
        <Chip label={`Paid: ${enrollData.total_paid}`} color="success" />
        <Chip
          label={`Balance: ${enrollData.balance}`}
          color={enrollData.balance <= 0 ? "success" : "error"}
        />
        <CustomButton
          size="small"
          onClick={handleOpenModal}
          disabled={
            enrollData.status === "cancelled" || enrollData.balance <= 0
          }
        >
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
                <TableCell>{enroll.transaction_type}</TableCell>
                <TableCell>
                  {amountType(enroll.amount, enroll.transaction_type)}
                </TableCell>
                <TableCell>{enroll.remark}</TableCell>
                <TableCell>
                  <Tooltip title="Print receipt">
                    <IconButton
                      onClick={() => printReceipt(enroll, enrollData)}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  {enroll.transaction_type === "payment" &&
                    !enroll.is_reversed && (
                      <Tooltip title="Reverse or correct payment">
                        <IconButton
                          onClick={() => {
                            const remark = window.prompt(
                              "Reason for correction",
                            );
                            if (!remark) return;
                            const replacement = window.prompt(
                              "Replacement amount (leave blank for reversal only)",
                            );
                            reverseTransaction({
                              enroll: enrollData.id,
                              transaction: enroll.id,
                              remark,
                              replacement_amount: replacement
                                ? Number(replacement)
                                : undefined,
                            });
                          }}
                        >
                          <UndoIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                </TableCell>
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
