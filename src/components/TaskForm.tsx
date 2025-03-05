import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addTask, updateTask } from '../store/taskSlice';
import { Task, Priority, Category, RecurrenceType } from '../types/task';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || Priority.MEDIUM);
  const [category, setCategory] = useState<Category>(task?.category || Category.OTHER);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  );
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    task?.recurrence?.type || RecurrenceType.NONE
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const now = new Date();
    const newTask = {
      id: task?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate: dueDate?.toISOString(),
      isCompleted: task?.isCompleted || false,
      createdAt: (task?.createdAt ? new Date(task.createdAt) : now).toISOString(),
      updatedAt: now.toISOString(),
      recurrence: recurrenceType !== RecurrenceType.NONE
        ? {
            type: recurrenceType,
            streak: task?.recurrence?.streak || 0,
            lastCompletedDate: task?.recurrence?.lastCompletedDate || null,
            nextDueDate: dueDate?.toISOString() || null,
          }
        : undefined,
    };

    if (task) {
      dispatch(updateTask(newTask));
    } else {
      dispatch(addTask(newTask));
    }
    onClose();
  };

  const renderPriorityButton = (value: Priority) => (
    <TouchableOpacity
      style={[styles.chip, priority === value && styles.selectedChip]}
      onPress={() => setPriority(value)}
    >
      <Text style={[styles.chipText, priority === value && styles.selectedChipText]}>
        {value}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryButton = (value: Category) => (
    <TouchableOpacity
      style={[styles.chip, category === value && styles.selectedChip]}
      onPress={() => setCategory(value)}
    >
      <Text style={[styles.chipText, category === value && styles.selectedChipText]}>
        {value}
      </Text>
    </TouchableOpacity>
  );

  const renderRecurrenceButton = (value: RecurrenceType) => (
    <TouchableOpacity
      style={[styles.chip, recurrenceType === value && styles.selectedChip]}
      onPress={() => setRecurrenceType(value)}
    >
      <Text style={[styles.chipText, recurrenceType === value && styles.selectedChipText]}>
        {value === RecurrenceType.NONE ? 'One-time' : value}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#666"
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.chipContainer}>
        {Object.values(Priority).map((p) => (
          <React.Fragment key={p}>
            {renderPriorityButton(p)}
          </React.Fragment>
        ))}
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipContainer}>
        {Object.values(Category).map((c) => (
          <React.Fragment key={c}>
            {renderCategoryButton(c)}
          </React.Fragment>
        ))}
      </View>

      <Text style={styles.label}>Recurrence</Text>
      <View style={styles.chipContainer}>
        {Object.values(RecurrenceType).map((r) => (
          <React.Fragment key={r}>
            {renderRecurrenceButton(r)}
          </React.Fragment>
        ))}
      </View>

      <Text style={styles.label}>Due Date {recurrenceType !== RecurrenceType.NONE ? '(First Occurrence)' : '(Optional)'}</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <MaterialCommunityIcons name="calendar" size={24} color="#666" />
        <Text style={styles.dateButtonText}>
          {dueDate ? format(dueDate, 'MMM d, yyyy h:mm a') : 'Set due date'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: any, selectedDate?: Date) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
        >
          <Text style={[styles.buttonText, styles.submitButtonText]}>
            {task ? 'Update' : 'Create'} Task
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    color: '#666',
    fontSize: 14,
  },
  selectedChipText: {
    color: 'white',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButtonText: {
    color: 'white',
  },
}); 