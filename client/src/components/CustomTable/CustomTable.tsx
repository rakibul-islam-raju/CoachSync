/* eslint-disable @typescript-eslint/no-explicit-any */

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { FC, useEffect, useState } from "react";
import { ITableColumn } from "./customTable.types";
import { ButtonGroup } from "@mui/material";
import { CustomButton } from "../CustomButton/CustomButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

interface TableProps {
  columns: ITableColumn[];
  rows: any[];
  editButton?: boolean;
  deleteButton?: boolean;
  handleSelectRow?: (data: any, action: "edit" | "delete") => void;
}

const CustomTable: FC<TableProps> = ({
  columns,
  rows,
  editButton = false,
  deleteButton = false,
  handleSelectRow,
}) => {
  const [rowsData, setRowsData] = useState<any[]>([]);

  useEffect(() => {
    setRowsData(rows);
  }, [rows]);

  const showActionButtons = editButton || deleteButton;

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell key={index}>{column.name}</TableCell>
            ))}
            {showActionButtons && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rowsData.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column, columnIndex) => (
                <TableCell key={columnIndex}>
                  {column.type === "boolean" ? (
                    column.accessor(row) ? (
                      <CheckIcon color="success" />
                    ) : (
                      <CloseIcon color="error" />
                    )
                  ) : (
                    column.accessor(row)
                  )}
                </TableCell>
              ))}
              {showActionButtons && (
                <TableCell>
                  <ButtonGroup size="small" variant="outlined">
                    {editButton && handleSelectRow && (
                      <CustomButton
                        color="primary"
                        onClick={() => handleSelectRow(row, "edit")}
                      >
                        <EditIcon />
                      </CustomButton>
                    )}
                    {deleteButton && handleSelectRow && (
                      <CustomButton
                        color="error"
                        onClick={() => handleSelectRow(row, "delete")}
                      >
                        <DeleteOutlineIcon />
                      </CustomButton>
                    )}
                  </ButtonGroup>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomTable;
