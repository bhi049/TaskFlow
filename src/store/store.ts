import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './taskSlice';
import userStatsReducer from './userStatsSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    userStats: userStatsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 