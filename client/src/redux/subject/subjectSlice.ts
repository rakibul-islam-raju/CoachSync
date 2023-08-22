import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SubjectState = {
	search?: string;
};

const initialState: SubjectState = {};

const subjectSlice = createSlice({
	name: "subject",
	initialState,
	reducers: {
		setSearchTerm(state, action: PayloadAction<string>) {
			state.search = action.payload;
		},

		removeSearchTerm(state) {
			delete state.search;
		},
	},
});

export const { setSearchTerm, removeSearchTerm } = subjectSlice.actions;
export default subjectSlice.reducer;
