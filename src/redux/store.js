import { configureStore } from '@reduxjs/toolkit';
import connectionReducer from './slices/connectionSlice';
import statusReducer from './slices/statusSlice';
import taskReducer from './slices/taskSlice';
import defectsReducer from './slices/defectsSlice';
import reportsReducer from './slices/reportsSlice';
import settingsReducer from './slices/settingsSlice';

const store = configureStore({
  reducer: {
    connection: connectionReducer,
    status: statusReducer,
    task: taskReducer,
    defects: defectsReducer,
    reports: reportsReducer,
    settings: settingsReducer,
  },
});

export default store;