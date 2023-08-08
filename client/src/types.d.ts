interface IUser {
	id: number;
	first_name: string;
	last_name: string;
	phone: string;
	email: string;
	is_active: boolean;
	is_staff: boolean;
	is_superuser: boolean;
	role?: string;
	created_at: Date;
	updated_at: Date;
}

interface IDecodedType {
	token_type: string;
	exp: Date;
	iat: Date;
	jti: string;
	user_id: number;
	user: IUser;
}

interface IRefreshResultData {
	access: string;
	refresh: string;
	user: IUser;
}
