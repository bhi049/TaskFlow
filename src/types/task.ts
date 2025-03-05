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

export interface SerializableTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  category: Category;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  recurrence?: RecurrenceInfo;
}

export interface Task extends Omit<SerializableTask, 'dueDate' | 'createdAt' | 'updatedAt'> {
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  recurrence?: RecurrenceInfo;
} 