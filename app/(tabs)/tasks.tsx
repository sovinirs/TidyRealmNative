import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Sample data
const TASKS = [
  {
    id: "1",
    title: "Clean kitchen counters",
    completed: false,
    priority: "high",
    duration: "15 min",
  },
  {
    id: "2",
    title: "Vacuum living room",
    completed: false,
    priority: "medium",
    duration: "20 min",
  },
  {
    id: "3",
    title: "Take out trash",
    completed: true,
    priority: "high",
    duration: "5 min",
  },
  {
    id: "4",
    title: "Organize bookshelf",
    completed: false,
    priority: "low",
    duration: "45 min",
  },
  {
    id: "5",
    title: "Water plants",
    completed: true,
    priority: "medium",
    duration: "10 min",
  },
  {
    id: "6",
    title: "Clean bathroom",
    completed: false,
    priority: "high",
    duration: "30 min",
  },
];

export default function TasksScreen() {
  const renderItem = ({
    item,
  }: {
    item: {
      id: string;
      title: string;
      completed: boolean;
      priority: string;
      duration: string;
    };
  }) => (
    <TouchableOpacity style={styles.taskItem}>
      <View style={styles.taskLeftContent}>
        <View
          style={[
            styles.priorityIndicator,
            { backgroundColor: getPriorityColor(item.priority) },
          ]}
        />
        <View>
          <Text
            style={[styles.taskTitle, item.completed && styles.completedTask]}
          >
            {item.title}
          </Text>
          <Text style={styles.taskMeta}>
            {item.duration} • {capitalizeFirstLetter(item.priority)} priority
          </Text>
        </View>
      </View>

      <View style={styles.checkbox}>
        {item.completed ? (
          <Ionicons name="checkmark-circle" size={24} color="#4c669f" />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color="#ccc" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={TASKS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

// Helper functions
function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "#ff3b30";
    case "medium":
      return "#ff9500";
    case "low":
      return "#34c759";
    default:
      return "#ccc";
  }
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#4c669f",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskMeta: {
    fontSize: 14,
    color: "#666",
  },
  checkbox: {
    marginLeft: 12,
  },
});
