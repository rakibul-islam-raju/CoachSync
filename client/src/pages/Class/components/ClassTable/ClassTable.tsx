/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from "react";
import { useGetClassesQuery } from "../../../../redux/class/classApi";
import Loader from "../../../../components/Loader";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { formatDateTime } from "../../../../utils/formatDateTime";
import { IClass } from "../../../../redux/class/class.type";
import CustomTable from "../../../../components/CustomTable/CustomTable";
import { ITableColumn } from "../../../../components/CustomTable/customTable.types";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { selectClass } from "../../../../redux/class/classSlice";

const columns: ITableColumn[] = [
	{
		name: "Name",
		accessor: (rowData) => rowData.name,
		type: "string",
	},
	{
		name: "Numeric",
		accessor: (rowData) => rowData.numeric,
		type: "number",
	},
	{
		name: "Created At",
		accessor: (rowData) => rowData.created_at,
		type: "string",
	},
	{
		name: "Updated At",
		accessor: (rowData) => rowData.updated_at,
		type: "string",
	},
	{
		name: "Active",
		accessor: (rowData) => rowData.is_active,
		type: "boolean",
	},
];

const ClassTable: FC = () => {
	const dispatch = useAppDispatch();
	const { params } = useAppSelector((state) => state.class);

	const { data, isLoading, isError, error, isSuccess } =
		useGetClassesQuery(params);

	const [rows, setRows] = useState<IClass[]>([]);

	const handleSelect = (data: IClass, action: "edit" | "delete") => {
		dispatch(selectClass({ data, action }));
	};

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

	return isLoading ? (
		<Loader />
	) : isError ? (
		<ErrorDisplay error={error} />
	) : rows?.length === 0 ? (
		<ErrorDisplay severity="warning" error={"No Data found"} />
	) : (
		<CustomTable
			columns={columns}
			rows={rows}
			handleSelectRow={handleSelect}
			editButton
			deleteButton
		/>
	);
};

export default ClassTable;
