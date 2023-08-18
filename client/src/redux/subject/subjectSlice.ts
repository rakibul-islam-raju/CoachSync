import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ISubject, ISubjectParams } from "./subject.type";
import { RESULTS_PER_PAGE } from "../../config";

type SubjectState = {
	selectedItem: null | ISubject;
	action: "edit" | "delete" | null;
	params: ISubjectParams;
};

const initialState: SubjectState = {
	selectedItem: null,
	action: null,
	params: {
		limit: RESULTS_PER_PAGE,
		offset: 0,
	},
};

const subjectSlice = createSlice({
	name: "subject",
	initialState,
	reducers: {
		selectSubject(
			state,
			action: PayloadAction<{
				data: ISubject | null;
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
	selectSubject,
	setSearchTerm,
	removeSearchTerm,
	setLimit,
	setOffset,
	filterActive,
} = subjectSlice.actions;
export default subjectSlice.reducer;
