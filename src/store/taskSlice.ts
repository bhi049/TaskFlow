import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Task, SerializableTask, RecurrenceType } from '../types/task';
import { RootState } from './store';
import { addDays, addWeeks, addMonths, startOfDay, isSameDay } from 'date-fns';

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
    subtasks: task.subtasks.map(subtask => ({
      ...subtask,
      dueDate: subtask.dueDate ? new Date(subtask.dueDate) : undefined,
      createdAt: new Date(subtask.createdAt),
      updatedAt: new Date(subtask.updatedAt),
    })),
  }))
);

const calculateNextDueDate = (currentDueDate: Date, recurrenceType: RecurrenceType): Date => {
  switch (recurrenceType) {
    case RecurrenceType.DAILY:
      return addDays(currentDueDate, 1);
    case RecurrenceType.WEEKLY:
      return addWeeks(currentDueDate, 1);
    case RecurrenceType.MONTHLY:
      return addMonths(currentDueDate, 1);
    default:
      return currentDueDate;
  }
};

const updateRecurringTask = (task: SerializableTask): SerializableTask => {
  if (!task.recurrence || !task.dueDate) return task;

  const currentDate = new Date();
  const dueDate = new Date(task.dueDate);
  const lastCompletedDate = task.recurrence.lastCompletedDate 
    ? new Date(task.recurrence.lastCompletedDate)
    : null;

  // Check if the task was completed on its due date
  const completedOnDueDate = lastCompletedDate && isSameDay(lastCompletedDate, dueDate);

  if (completedOnDueDate) {
    // Calculate next due date
    const nextDueDate = calculateNextDueDate(dueDate, task.recurrence.type);
    
    return {
      ...task,
      isCompleted: false,
      dueDate: nextDueDate.toISOString(),
      recurrence: {
        ...task.recurrence,
        streak: task.recurrence.streak + 1,
        nextDueDate: nextDueDate.toISOString(),
      },
      // Reset subtasks completion state
      subtasks: task.subtasks.map(subtask => ({
        ...subtask,
        isCompleted: false,
        updatedAt: currentDate.toISOString(),
      })),
    };
  } else if (lastCompletedDate) {
    // Task was completed, but not on the due date - break the streak
    const nextDueDate = calculateNextDueDate(dueDate, task.recurrence.type);
    return {
      ...task,
      isCompleted: false,
      dueDate: nextDueDate.toISOString(),
      recurrence: {
        ...task.recurrence,
        streak: 0,
        nextDueDate: nextDueDate.toISOString(),
      },
      // Reset subtasks completion state
      subtasks: task.subtasks.map(subtask => ({
        ...subtask,
        isCompleted: false,
        updatedAt: currentDate.toISOString(),
      })),
    };
  }

  return task;
};

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
      const taskIndex = state.tasks.findIndex(task => task.id === action.payload);
      if (taskIndex === -1) return;

      const task = state.tasks[taskIndex];
      const now = new Date();
      const isCompleting = !task.isCompleted;

      if (isCompleting) {
        // Completing the task
        task.isCompleted = true;
        task.updatedAt = now.toISOString();
        
        // Complete all subtasks when completing the main task
        task.subtasks = task.subtasks.map(subtask => ({
          ...subtask,
          isCompleted: true,
          updatedAt: now.toISOString(),
        }));
        
        if (task.recurrence) {
          task.recurrence.lastCompletedDate = now.toISOString();
          // The task will be reset in the next step
        }
      } else {
        // Uncompleting the task
        task.isCompleted = false;
        task.updatedAt = now.toISOString();
      }

      // Handle recurring task logic
      if (task.recurrence && isCompleting) {
        state.tasks[taskIndex] = updateRecurringTask(task);
      }
    },
    reorderTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload.map(task => ({
        ...task,
        dueDate: task.dueDate?.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        subtasks: task.subtasks.map(subtask => ({
          ...subtask,
          dueDate: subtask.dueDate?.toISOString(),
          createdAt: subtask.createdAt.toISOString(),
          updatedAt: subtask.updatedAt.toISOString(),
        })),
      }));
    },
  },
});

export const { addTask, updateTask, deleteTask, toggleTaskCompletion, reorderTasks } = taskSlice.actions;
export default taskSlice.reducer; 