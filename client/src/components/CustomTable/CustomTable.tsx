/* eslint-disable @typescript-eslint/no-explicit-any */

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { FC, ReactNode, useEffect, useState } from "react";
import { ITableColumn } from "./customTable.types";

interface TableProps {
	columns: ITableColumn[];
	rows: any[];
	actionBtns?: ReactNode;
}

const CustomTable: FC<TableProps> = ({ columns, rows, actionBtns }) => {
	const [rowsData, setRowsData] = useState<any[]>([]);

	useEffect(() => {
		setRowsData(rows);
	}, [rows]);

	return (
		<TableContainer component={Paper} variant="outlined">
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						{columns.map((column, index) => (
							<TableCell key={index}>{column.name}</TableCell>
						))}
						{actionBtns && <TableCell>Actions</TableCell>}
					</TableRow>
				</TableHead>
				<TableBody>
					{rowsData.map((row, index) => (
						<TableRow key={index}>
							{columns.map((column, columnIndex) => (
								<TableCell key={columnIndex}>{column.accessor(row)}</TableCell>
							))}
							{actionBtns && <TableCell>{actionBtns}</TableCell>}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default CustomTable;
