import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  isGenerating: false,
  error: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReports: (state, action) => {
      state.list = action.payload;
    },
    addReport: (state, action) => {
      state.list.unshift(action.payload);
    },
    setIsGenerating: (state, action) => {
      state.isGenerating = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setReports, addReport, setIsGenerating, setError, clearError } = reportsSlice.actions;

export default reportsSlice.reducer;