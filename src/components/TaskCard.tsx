import React from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { Task, Priority, Category } from '../types/task';
import { useDispatch } from 'react-redux';
import { toggleTaskCompletion, deleteTask } from '../store/taskSlice';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
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

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const dispatch = useDispatch();

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActions}>
        <Animated.View style={[styles.actionButton, { transform: [{ scale }] }]}>
          <MaterialCommunityIcons name="delete" size={24} color="white" />
        </Animated.View>
      </View>
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.leftActions}>
        <Animated.View style={[styles.actionButton, styles.completeButton, { transform: [{ scale }] }]}>
          <MaterialCommunityIcons name="check" size={24} color="white" />
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      onSwipeableRightOpen={() => dispatch(deleteTask(task.id))}
      onSwipeableLeftOpen={() => dispatch(toggleTaskCompletion(task.id))}
    >
      <Animated.View style={[styles.container, task.isCompleted && styles.completedTask]}>
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
        <View style={styles.content}>
          <Text style={[styles.title, task.isCompleted && styles.completedText]}>{task.title}</Text>
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
                Due: {format(new Date(task.dueDate), 'MMM d, yyyy h:mm a')}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </Swipeable>
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
    width: 70,
    justifyContent: 'center',
  },
  leftActions: {
    marginVertical: 8,
    width: 70,
    justifyContent: 'center',
  },
  actionButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  completeButton: {
    backgroundColor: '#00C851',
  },
}); 