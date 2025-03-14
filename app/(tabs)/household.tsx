import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Sample data
const SPACES = [
  { id: "1", name: "Living Room", tasks: 3, icon: "restaurant" },
  { id: "2", name: "Kitchen", tasks: 5, icon: "restaurant" },
  { id: "3", name: "Bedroom", tasks: 2, icon: "bed" },
  { id: "4", name: "Bathroom", tasks: 4, icon: "water" },
  { id: "5", name: "Office", tasks: 1, icon: "desktop" },
  { id: "6", name: "Garage", tasks: 6, icon: "car" },
];

export default function SpacesScreen() {
  const renderItem = ({
    item,
  }: {
    item: { id: string; name: string; tasks: number; icon: string };
  }) => (
    <TouchableOpacity style={styles.spaceCard}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={28} color="#4c669f" />
      </View>
      <View style={styles.spaceInfo}>
        <Text style={styles.spaceName}>{item.name}</Text>
        <Text style={styles.spaceTasks}>{item.tasks} tasks</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={SPACES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
      />
    </SafeAreaView>
  );
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
    padding: 12,
  },
  spaceCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  spaceInfo: {
    alignItems: "center",
    marginBottom: 8,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  spaceTasks: {
    fontSize: 14,
    color: "#666",
  },
});
