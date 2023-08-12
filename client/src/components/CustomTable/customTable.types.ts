/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ITableColumn {
	name: string;
	accessor: (rowData: any) => any;
}
