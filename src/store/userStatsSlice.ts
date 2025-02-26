import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface UserStats {
  totalTasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  weeklyCompletions: { [key: string]: number }; // ISO week string -> count
  monthlyCompletions: { [key: string]: number }; // YYYY-MM -> count
}

const initialState: UserStats = {
  totalTasksCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastCompletionDate: null,
  weeklyCompletions: {},
  monthlyCompletions: {},
};

export const userStatsSlice = createSlice({
  name: 'userStats',
  initialState,
  reducers: {
    taskCompleted: (state) => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const weekStr = getISOWeek(today);
      const monthStr = today.toISOString().slice(0, 7);

      // Update total completions
      state.totalTasksCompleted += 1;

      // Update weekly and monthly stats
      state.weeklyCompletions[weekStr] = (state.weeklyCompletions[weekStr] || 0) + 1;
      state.monthlyCompletions[monthStr] = (state.monthlyCompletions[monthStr] || 0) + 1;

      // Update streak
      if (state.lastCompletionDate) {
        const lastDate = new Date(state.lastCompletionDate);
        const dayDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          // Consecutive day
          state.currentStreak += 1;
          state.longestStreak = Math.max(state.currentStreak, state.longestStreak);
        } else if (dayDiff > 1) {
          // Streak broken
          state.currentStreak = 1;
        }
      } else {
        // First completion
        state.currentStreak = 1;
        state.longestStreak = 1;
      }

      state.lastCompletionDate = todayStr;
    },
  },
});

// Helper function to get ISO week string (YYYY-Www)
function getISOWeek(date: Date): string {
  const dt = new Date(date);
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() + 3 - (dt.getDay() + 6) % 7);
  const week = Math.floor((dt.getTime() - new Date(dt.getFullYear(), 0, 4).getTime()) / 86400000 / 7) + 1;
  return `${dt.getFullYear()}-W${week.toString().padStart(2, '0')}`;
}

export const selectUserStats = (state: RootState) => state.userStats;
export const { taskCompleted } = userStatsSlice.actions;
export default userStatsSlice.reducer; 