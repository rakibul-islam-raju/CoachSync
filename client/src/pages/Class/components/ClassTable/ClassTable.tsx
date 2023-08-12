import { FC, useEffect, useState } from "react";
import { useGetClassesQuery } from "../../../../redux/class/classApi";
import Loader from "../../../../components/Loader";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { formatDateTime } from "../../../../utils/formatDateTime";
import { IClass } from "../../../../redux/class/class.type";
import CustomTable from "../../../../components/CustomTable/CustomTable";
import { ITableColumn } from "../../../../components/CustomTable/customTable.types";
import { ButtonGroup } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";

const columns: ITableColumn[] = [
	{
		name: "ID",
		accessor: (rowData) => rowData.id,
	},
	{
		name: "Name",
		accessor: (rowData) => rowData.name,
	},
	{
		name: "Numeric",
		accessor: (rowData) => rowData.numeric,
	},
	{
		name: "Created At",
		accessor: (rowData) => rowData.created_at,
	},
	{
		name: "Updated At",
		accessor: (rowData) => rowData.updated_at,
	},
];

const ClassTable: FC = () => {
	const { data, isLoading, isError, error, isSuccess } =
		useGetClassesQuery(undefined);

	const [rows, setRows] = useState<IClass[]>([]);

	useEffect(() => {
		if (data) {
			const transformedData = data.results.map((item) => ({
				...item,
				created_at: formatDateTime(new Date(item.created_at)),
				updated_at: formatDateTime(new Date(item.updated_at)),
			}));
			setRows(transformedData);
		}
	}, [isSuccess, data]);

	const actionBtns = (
		<ButtonGroup size="small" variant="outlined">
			<CustomButton color="primary">
				<EditIcon />
			</CustomButton>
			<CustomButton color="error">
				<DeleteOutlineIcon />
			</CustomButton>
		</ButtonGroup>
	);

	return isLoading ? (
		<Loader />
	) : isError ? (
		<ErrorDisplay error={error} />
	) : rows?.length === 0 ? (
		<ErrorDisplay severity="warning" error={"No Data found"} />
	) : (
		<CustomTable columns={columns} rows={rows} actionBtns={actionBtns} />
	);
};

export default ClassTable;
