import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IClass, IClassParams } from "./class.type";
import { RESULTS_PER_PAGE } from "../../config";

type ClassState = {
	selectedItem: null | IClass;
	action: "edit" | "delete" | null;
	params: IClassParams;
};

const initialState: ClassState = {
	selectedItem: null,
	action: null,
	params: {
		limit: RESULTS_PER_PAGE,
		offset: 0,
	},
};

const classSlice = createSlice({
	name: "class",
	initialState,
	reducers: {
		selectClass(
			state,
			action: PayloadAction<{
				data: IClass | null;
				action: "edit" | "delete" | null;
			}>
		) {
			state.selectedItem = action.payload.data;
			state.action = action.payload.action;
		},

		setSearchTerm(state, action: PayloadAction<string>) {
			state.params.search = action.payload;
		},

		removeSearchTerm(state) {
			delete state.params.search;
		},

		setLimit(state, action: PayloadAction<number>) {
			state.params.limit = action.payload;
		},

		setOffset(state, action: PayloadAction<number>) {
			state.params.offset = action.payload;
		},

		filterActive(state, action: PayloadAction<boolean>) {
			state.params.is_active = action.payload;
		},
	},
});

export const {
	selectClass,
	setSearchTerm,
	removeSearchTerm,
	setLimit,
	setOffset,
	filterActive,
} = classSlice.actions;
export default classSlice.reducer;
