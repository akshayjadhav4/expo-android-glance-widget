import { WidgetStorage } from "expo-android-glance-widget";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MMKV, Mode } from "react-native-mmkv";

// Initialize MMKV storage
const storage = new MMKV({
  id: "tasks-glance-widget",
  mode: Mode.MULTI_PROCESS,
});

type Task = {
  id: string;
  title: string;
  current: number;
  target: number;
};

const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Read Books",
    current: 3,
    target: 10,
  },
  {
    id: "2",
    title: "Exercise Days",
    current: 7,
    target: 20,
  },
  {
    id: "3",
    title: "Learn New Words",
    current: 15,
    target: 50,
  },
  {
    id: "4",
    title: "Watch Movies",
    current: 2,
    target: 5,
  },
  {
    id: "5",
    title: "Complete Projects",
    current: 0,
    target: 3,
  },
];

const TASKS_KEY = "tasks";

export default function MMKVPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from MMKV storage
  const loadTasks = useCallback(() => {
    try {
      const storedTasks = storage.getString(TASKS_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        // If no tasks exist, populate sample data
        setTasks(sampleTasks);
        saveTasks(sampleTasks);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      // Fallback to sample data
      setTasks(sampleTasks);
      saveTasks(sampleTasks);
    }
  }, []);

  // Save tasks to MMKV storage
  const saveTasks = useCallback((tasksToSave: Task[]) => {
    try {
      storage.set(TASKS_KEY, JSON.stringify(tasksToSave));
    } catch (error) {
      console.error("Error saving tasks:", error);
      Alert.alert("Error", "Failed to save tasks");
    }
  }, []);

  // Load tasks from MMKV on component mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Increment task progress
  const incrementTask = useCallback(
    (taskId: string) => {
      setTasks((currentTasks) => {
        const updatedTasks = currentTasks.map((task) => {
          if (task.id === taskId) {
            // Clamp current to target (don't exceed target)
            const newCurrent = Math.min(task.current + 1, task.target);
            return { ...task, current: newCurrent };
          }
          return task;
        });

        saveTasks(updatedTasks);
        return updatedTasks;
      });
      WidgetStorage.updateWidget("TaskProgressReceiver");
    },
    [saveTasks]
  );

  // Calculate progress percentage
  const getProgressPercentage = (current: number, target: number): number => {
    return target > 0 ? (current / target) * 100 : 0;
  };

  // Check if task is completed
  const isTaskCompleted = (current: number, target: number): boolean => {
    return current >= target;
  };

  // Render individual task card
  const renderTaskCard = ({ item }: { item: Task }) => {
    const progressPercentage = getProgressPercentage(item.current, item.target);
    const isCompleted = isTaskCompleted(item.current, item.target);

    return (
      <View style={[styles.taskCard, isCompleted && styles.completedTask]}>
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, isCompleted && styles.completedText]}>
            {item.title}
          </Text>
          <Text
            style={[styles.progressText, isCompleted && styles.completedText]}
          >
            {item.current} / {item.target}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${progressPercentage}%` },
              isCompleted && styles.completedProgressBar,
            ]}
          />
        </View>

        {/* Progress percentage text */}
        <Text
          style={[styles.percentageText, isCompleted && styles.completedText]}
        >
          {Math.round(progressPercentage)}%
        </Text>

        {/* Increment button */}
        <TouchableOpacity
          style={[styles.incrementButton, isCompleted && styles.disabledButton]}
          onPress={() => incrementTask(item.id)}
          disabled={isCompleted}
        >
          <Text
            style={[
              styles.incrementButtonText,
              isCompleted && styles.disabledButtonText,
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTaskCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedTask: {
    backgroundColor: "#e8f5e8",
    borderColor: "#4caf50",
    borderWidth: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  completedText: {
    color: "#4caf50",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#2196f3",
    borderRadius: 4,
  },
  completedProgressBar: {
    backgroundColor: "#4caf50",
  },
  percentageText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },
  incrementButton: {
    backgroundColor: "#2196f3",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  incrementButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  disabledButtonText: {
    color: "#999",
  },
});
