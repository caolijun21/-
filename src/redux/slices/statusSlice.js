import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'hotspot',
  ip: '192.168.1.1',
  temperature: 0,
  odometry: 0,
  defectsCount: 0,
  taskStatus: 'idle',
  operator: '',
  direction: 'stop',
  speed: 0,
  timestamp: Date.now(),
};

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    updateStatus: (state, action) => {
      return { ...state, ...action.payload, timestamp: Date.now() };
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setIp: (state, action) => {
      state.ip = action.payload;
    },
    setTemperature: (state, action) => {
      state.temperature = action.payload;
    },
    setOdometry: (state, action) => {
      state.odometry = action.payload;
    },
    setDefectsCount: (state, action) => {
      state.defectsCount = action.payload;
    },
    setTaskStatus: (state, action) => {
      state.taskStatus = action.payload;
    },
    setOperator: (state, action) => {
      state.operator = action.payload;
    },
    setDirection: (state, action) => {
      state.direction = action.payload;
    },
    setSpeed: (state, action) => {
      state.speed = action.payload;
    },
  },
});

export const { updateStatus, setMode, setIp, setTemperature, setOdometry, setDefectsCount, setTaskStatus, setOperator, setDirection, setSpeed } = statusSlice.actions;

export default statusSlice.reducer;