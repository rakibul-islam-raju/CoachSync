export interface IClass extends IEntityGenericProps {
	id: number;
	name: string;
	numeric: number;
}

export interface IClassCreateReqData {
	name: string;
	numeric: number;
}

export interface IClassUpdateReqData {
	id: number;
	data: {
		name?: string;
		numeric?: number;
		is_Active?: boolean;
	};
}
