import { FC, useEffect, useState } from "react";
import Loader from "../../../../components/Loader";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { formatDateTime } from "../../../../utils/formatDateTime";
import CustomTable from "../../../../components/CustomTable/CustomTable";
import { ITableColumn } from "../../../../components/CustomTable/customTable.types";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { ISubject } from "../../../../redux/subject/subject.type";
import { selectSubject } from "../../../../redux/subject/subjectSlice";
import { useGetSubjectsQuery } from "../../../../redux/subject/subjectApi";

const columns: ITableColumn[] = [
	{
		name: "Name",
		accessor: (rowData) => rowData.name,
		type: "string",
	},
	{
		name: "Code",
		accessor: (rowData) => rowData.code,
		type: "string",
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

const SubjectTable: FC = () => {
	const dispatch = useAppDispatch();
	const { params } = useAppSelector((state) => state.subject);

	const { data, isLoading, isError, error, isSuccess } =
		useGetSubjectsQuery(params);

	const [rows, setRows] = useState<ISubject[]>([]);

	const handleSelect = (data: ISubject, action: "edit" | "delete") => {
		dispatch(selectSubject({ data, action }));
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

export default SubjectTable;
