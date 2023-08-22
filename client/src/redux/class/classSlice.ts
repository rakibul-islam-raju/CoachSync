import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ClassState = {
	search?: string;
};

const initialState: ClassState = {};

const classSlice = createSlice({
	name: "class",
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

export const { setSearchTerm, removeSearchTerm } = classSlice.actions;
export default classSlice.reducer;
