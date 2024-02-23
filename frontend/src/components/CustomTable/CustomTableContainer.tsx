/* eslint-disable @typescript-eslint/no-explicit-any */

import { Paper } from "@mui/material";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { FC, ReactNode } from "react";

interface TableProps {
  columns: string[];
  children: ReactNode;
}

const CustomTableContainer: FC<TableProps> = ({ columns, children }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell key={index} sx={{ fontWeight: "bold" }}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <>{children}</>
      </Table>
    </TableContainer>
  );
};

export default CustomTableContainer;
