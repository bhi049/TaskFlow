export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum Category {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
  HEALTH = 'HEALTH',
  SHOPPING = 'SHOPPING',
  OTHER = 'OTHER'
}

export enum RecurrenceType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export interface RecurrenceInfo {
  type: RecurrenceType;
  streak: number;
  lastCompletedDate: string | null;
  nextDueDate: string | null;
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializableSubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaseTask {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  isCompleted: boolean;
  recurrence?: RecurrenceInfo;
}

export interface Task extends BaseTask {
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  subtasks: SubTask[];
}

export interface SerializableTask extends BaseTask {
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  subtasks: SerializableSubTask[];
} 