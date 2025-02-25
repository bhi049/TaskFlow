import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Task, SerializableTask } from '../types/task';
import { RootState } from './store';

interface TaskState {
  tasks: SerializableTask[];
}

const initialState: TaskState = {
  tasks: [],
};

const selectTasksState = (state: RootState) => state.tasks.tasks;

export const selectTasks = createSelector(
  [selectTasksState],
  (tasks): Task[] => tasks.map(task => ({
    ...task,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  }))
);

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<SerializableTask>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<SerializableTask>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    toggleTaskCompletion: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(task => task.id === action.payload);
      if (task) {
        task.isCompleted = !task.isCompleted;
        task.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const { addTask, updateTask, deleteTask, toggleTaskCompletion } = taskSlice.actions;
export default taskSlice.reducer; 