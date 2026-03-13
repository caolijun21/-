import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: {
    smtp: '',
    port: 587,
    username: '',
    password: '',
    recipient: '',
  },
  network: {
    mode: 'hotspot',
    ssid: '',
    password: '',
  },
  odometry: {
    wheelDiameter: 0.1,
    pulsesPerRevolution: 1000,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setEmailSettings: (state, action) => {
      state.email = { ...state.email, ...action.payload };
    },
    setNetworkSettings: (state, action) => {
      state.network = { ...state.network, ...action.payload };
    },
    setOdometrySettings: (state, action) => {
      state.odometry = { ...state.odometry, ...action.payload };
    },
  },
});

export const { setEmailSettings, setNetworkSettings, setOdometrySettings } = settingsSlice.actions;

export default settingsSlice.reducer;