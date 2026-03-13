import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  selectedDefect: null,
  isLoading: false,
  error: null,
};

const defectsSlice = createSlice({
  name: 'defects',
  initialState,
  reducers: {
    setDefects: (state, action) => {
      state.list = action.payload;
    },
    addDefect: (state, action) => {
      state.list.unshift(action.payload);
    },
    selectDefect: (state, action) => {
      state.selectedDefect = action.payload;
    },
    deleteDefect: (state, action) => {
      state.list = state.list.filter(defect => defect.id !== action.payload);
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setDefects, addDefect, selectDefect, deleteDefect, setIsLoading, setError, clearError } = defectsSlice.actions;

export default defectsSlice.reducer;