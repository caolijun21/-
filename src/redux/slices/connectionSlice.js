import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ip: '10.42.0.1',
  port: 5000,
  isConnected: false,
  isScanning: false,
  devices: [],
  error: null,
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setIp: (state, action) => {
      state.ip = action.payload;
    },
    setPort: (state, action) => {
      state.port = action.payload;
    },
    setIsConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setIsScanning: (state, action) => {
      state.isScanning = action.payload;
    },
    setDevices: (state, action) => {
      state.devices = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setIp, setPort, setIsConnected, setIsScanning, setDevices, setError, clearError } = connectionSlice.actions;

export default connectionSlice.reducer;