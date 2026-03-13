import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTask: null,
  history: [],
  isTaskRunning: false,
  operator: '',
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    startTask: (state, action) => {
      state.currentTask = {
        id: Date.now(),
        operator: action.payload.operator,
        startTime: new Date().toISOString(),
        startOdometry: action.payload.startOdometry || 0,
        defects: 0,
      };
      state.isTaskRunning = true;
      state.operator = action.payload.operator;
    },
    endTask: (state, action) => {
      if (state.currentTask) {
        const endTask = {
          ...state.currentTask,
          endTime: new Date().toISOString(),
          endOdometry: action.payload.endOdometry || 0,
          totalDistance: action.payload.totalDistance || 0,
          defects: action.payload.defects || 0,
        };
        state.history.unshift(endTask);
        state.currentTask = null;
        state.isTaskRunning = false;
      }
    },
    updateTaskDefects: (state, action) => {
      if (state.currentTask) {
        state.currentTask.defects = action.payload;
      }
    },
    setOperator: (state, action) => {
      state.operator = action.payload;
    },
    clearHistory: (state) => {
      state.history = [];
    },
  },
});

export const { startTask, endTask, updateTaskDefects, setOperator, clearHistory } = taskSlice.actions;

export default taskSlice.reducer;