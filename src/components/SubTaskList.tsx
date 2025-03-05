import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated as RNAnimated,
} from 'react-native';
import { SubTask } from '../types/task';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import DraggableFlatList, { 
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';

interface SubTaskListProps {
  subtasks: SubTask[];
  onToggleSubTask: (subtaskId: string) => void;
  onDeleteSubTask: (subtaskId: string) => void;
  onReorderSubTasks: (newSubtasks: SubTask[]) => void;
}

export const SubTaskList: React.FC<SubTaskListProps> = ({
  subtasks,
  onToggleSubTask,
  onDeleteSubTask,
  onReorderSubTasks,
}) => {
  const renderSubTask = ({ item, drag, isActive }: RenderItemParams<SubTask>) => {
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
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDeleteSubTask(item.id);
          }}
        >
          <RNAnimated.View style={{ transform: [{ scale }] }}>
            <MaterialCommunityIcons name="delete" size={24} color="white" />
          </RNAnimated.View>
        </TouchableOpacity>
      );
    };

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            drag();
          }}
          disabled={isActive}
        >
          <Swipeable renderRightActions={renderRightActions}>
            <View style={[styles.subtaskContainer, isActive && styles.dragging]}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onToggleSubTask(item.id);
                }}
              >
                <MaterialCommunityIcons
                  name={item.isCompleted ? "checkbox-marked" : "checkbox-blank-outline"}
                  size={24}
                  color={item.isCompleted ? "#00C851" : "#666"}
                />
              </TouchableOpacity>
              <View style={styles.subtaskContent}>
                <Text style={[
                  styles.subtaskTitle,
                  item.isCompleted && styles.completedText
                ]}>
                  {item.title}
                </Text>
                {item.dueDate && (
                  <Text style={styles.subtaskDueDate}>
                    Due: {format(item.dueDate, 'MMM d, yyyy')}
                  </Text>
                )}
              </View>
              <MaterialCommunityIcons
                name="drag"
                size={20}
                color="#999"
                style={styles.dragHandle}
              />
            </View>
          </Swipeable>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={subtasks}
        onDragEnd={({ data }) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onReorderSubTasks(data);
        }}
        keyExtractor={(item) => item.id}
        renderItem={renderSubTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  subtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  checkbox: {
    marginRight: 12,
  },
  subtaskContent: {
    flex: 1,
  },
  subtaskTitle: {
    fontSize: 14,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  subtaskDueDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  dragHandle: {
    padding: 8,
  },
  dragging: {
    opacity: 0.7,
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
}); 