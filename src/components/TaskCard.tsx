import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { Task, Priority, Category, RecurrenceType, SubTask } from '../types/task';
import { useDispatch } from 'react-redux';
import { toggleTaskCompletion, deleteTask, updateTask } from '../store/taskSlice';
import { taskCompleted } from '../store/userStatsSlice';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  runOnJS,
  useSharedValue,
} from 'react-native-reanimated';
import { SubTaskList } from './SubTaskList';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onReorder?: (draggedId: string, droppedId: string) => void;
  isBeingDragged?: boolean;
}

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case Priority.URGENT:
      return '#FF4444';
    case Priority.HIGH:
      return '#FF8800';
    case Priority.MEDIUM:
      return '#FFBB33';
    case Priority.LOW:
      return '#00C851';
    default:
      return '#00C851';
  }
};

const getRecurrenceIcon = (type: RecurrenceType): "refresh" | "calendar-week" | "calendar-month" => {
  switch (type) {
    case RecurrenceType.DAILY:
      return "refresh";
    case RecurrenceType.WEEKLY:
      return "calendar-week";
    case RecurrenceType.MONTHLY:
      return "calendar-month";
    default:
      return "refresh";
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onReorder,
  isBeingDragged = false 
}) => {
  const dispatch = useDispatch();
  const scale = useSharedValue(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const completedSubtasks = task.subtasks.filter(subtask => subtask.isCompleted).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  useEffect(() => {
    // Auto-complete task when all subtasks are completed
    if (totalSubtasks > 0 && completedSubtasks === totalSubtasks && !task.isCompleted) {
      handleTaskCompletion();
    }
  }, [completedSubtasks, totalSubtasks]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleTaskCompletion = async () => {
    if (!task.isCompleted) {
      // Trigger haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Animate scale
      scale.value = withSequence(
        withSpring(1.1, { damping: 12, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );

      dispatch(taskCompleted());
    }
    dispatch(toggleTaskCompletion(task.id));
  };

  const handleToggleSubTask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, isCompleted: !subtask.isCompleted, updatedAt: new Date() }
        : subtask
    );

    dispatch(updateTask({
      ...task,
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: updatedSubtasks.map(st => ({
        ...st,
        dueDate: st.dueDate?.toISOString(),
        createdAt: st.createdAt.toISOString(),
        updatedAt: st.updatedAt.toISOString(),
      })),
    }));
  };

  const handleDeleteSubTask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
    
    dispatch(updateTask({
      ...task,
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: updatedSubtasks.map(st => ({
        ...st,
        dueDate: st.dueDate?.toISOString(),
        createdAt: st.createdAt.toISOString(),
        updatedAt: st.updatedAt.toISOString(),
      })),
    }));
  };

  const handleReorderSubTasks = (newSubtasks: SubTask[]) => {
    dispatch(updateTask({
      ...task,
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: newSubtasks.map(st => ({
        ...st,
        dueDate: st.dueDate?.toISOString(),
        createdAt: st.createdAt.toISOString(),
        updatedAt: st.updatedAt.toISOString(),
      })),
    }));
  };

  const renderRightActions = (
    progress: RNAnimated.AnimatedInterpolation<number>,
    dragX: RNAnimated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActions}>
        <TouchableOpacity 
          style={styles.actionButtonContainer}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            dispatch(deleteTask(task.id));
          }}
        >
          <RNAnimated.View style={[styles.actionButton, styles.deleteButton, { transform: [{ scale }] }]}>
            <MaterialCommunityIcons name="delete" size={24} color="white" />
          </RNAnimated.View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButtonContainer}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onEdit(task);
          }}
        >
          <RNAnimated.View style={[styles.actionButton, styles.editButton, { transform: [{ scale }] }]}>
            <MaterialCommunityIcons name="pencil" size={24} color="white" />
          </RNAnimated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLeftActions = (
    progress: RNAnimated.AnimatedInterpolation<number>,
    dragX: RNAnimated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity 
        style={styles.leftActions}
        onPress={handleTaskCompletion}
      >
        <RNAnimated.View style={[styles.actionButton, styles.completeButton, { transform: [{ scale }] }]}>
          <MaterialCommunityIcons name="check" size={24} color="white" />
        </RNAnimated.View>
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView>
      <Animated.View style={animatedStyles}>
        <Swipeable
          renderRightActions={renderRightActions}
          renderLeftActions={renderLeftActions}
          onSwipeableRightOpen={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            dispatch(deleteTask(task.id));
          }}
          onSwipeableLeftOpen={handleTaskCompletion}
          rightThreshold={40}
        >
          <Animated.View 
            style={[
              styles.container, 
              task.isCompleted && styles.completedTask,
              isBeingDragged && styles.dragging
            ]}
          >
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
            <View style={styles.content}>
              <TouchableOpacity 
                style={styles.mainContent}
                onPress={() => setIsExpanded(!isExpanded)}
                onLongPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onEdit(task);
                }}
                delayLongPress={500}
              >
                <View style={styles.header}>
                  <Text style={[styles.title, task.isCompleted && styles.completedText]}>{task.title}</Text>
                  <View style={styles.headerRight}>
                    {task.recurrence && (
                      <View style={styles.recurrenceContainer}>
                        <MaterialCommunityIcons 
                          name={getRecurrenceIcon(task.recurrence.type)} 
                          size={16} 
                          color="#666" 
                        />
                        {task.recurrence.streak > 0 && (
                          <View style={styles.streakBadge}>
                            <Text style={styles.streakText}>{task.recurrence.streak}🔥</Text>
                          </View>
                        )}
                      </View>
                    )}
                    {totalSubtasks > 0 && (
                      <View style={styles.subtaskCounter}>
                        <Text style={styles.subtaskCounterText}>
                          {completedSubtasks}/{totalSubtasks}
                        </Text>
                      </View>
                    )}
                    <MaterialCommunityIcons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={24}
                      color="#666"
                    />
                  </View>
                </View>
                {task.description && (
                  <Text style={[styles.description, task.isCompleted && styles.completedText]} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}
                <View style={styles.footer}>
                  <View style={styles.categoryContainer}>
                    <Text style={styles.category}>{task.category}</Text>
                  </View>
                  {task.dueDate && (
                    <Text style={styles.dueDate}>
                      Due: {format(task.dueDate, 'MMM d, yyyy h:mm a')}
                    </Text>
                  )}
                </View>
                {totalSubtasks > 0 && (
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                  </View>
                )}
              </TouchableOpacity>
              {isExpanded && task.subtasks.length > 0 && (
                <SubTaskList
                  subtasks={task.subtasks}
                  onToggleSubTask={handleToggleSubTask}
                  onDeleteSubTask={handleDeleteSubTask}
                  onReorderSubTasks={handleReorderSubTasks}
                />
              )}
            </View>
          </Animated.View>
        </Swipeable>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completedTask: {
    opacity: 0.7,
  },
  priorityIndicator: {
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  category: {
    fontSize: 12,
    color: '#444',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
  },
  rightActions: {
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 140,
  },
  leftActions: {
    marginVertical: 8,
    width: 70,
    justifyContent: 'center',
  },
  actionButtonContainer: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  completeButton: {
    backgroundColor: '#00C851',
  },
  dragging: {
    opacity: 0.7,
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  recurrenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakBadge: {
    backgroundColor: '#FFE4B5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 4,
  },
  streakText: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtaskCounter: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  subtaskCounterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: '#f0f0f0',
    borderRadius: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00C851',
    borderRadius: 1,
  },
}); 