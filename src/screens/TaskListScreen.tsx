import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { Task } from '../types/task';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { selectTasks, reorderTasks } from '../store/taskSlice';
import DraggableFlatList, { 
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';

export const TaskListScreen: React.FC = () => {
  const tasks = useSelector(selectTasks);
  const dispatch = useDispatch();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setSelectedTask(undefined);
  };

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Task>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            drag();
          }}
          disabled={isActive}
        >
          <TaskCard
            task={item}
            onEdit={() => handleEditTask(item)}
            isBeingDragged={isActive}
          />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, []);

  const handleDragEnd = useCallback(({ data }: { data: Task[] }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(reorderTasks(data));
  }, [dispatch]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#666" />
      <Text style={styles.emptyStateText}>No tasks yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Tap the + button to create your first task
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <DraggableFlatList
          data={tasks}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={tasks.length === 0 && styles.emptyList}
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsFormVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isFormVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <TaskForm task={selectedTask} onClose={handleCloseForm} />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
}); 