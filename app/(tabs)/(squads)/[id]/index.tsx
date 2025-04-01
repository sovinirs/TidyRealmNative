import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSquadStore } from "@/stores/squadStore";
const tasks = [
  { id: "1", name: "Take out trash" },
  { id: "2", name: "Do the dishes" },
  { id: "3", name: "Water the plants" },
  { id: "4", name: "Vacuum living room" },
];

export default function SquadDetailScreen() {
  const router = useRouter();
  const { squads } = useSquadStore();
  const { id } = useLocalSearchParams();

  const squad = squads.find((squad) => squad.id === id);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="chevron-back" size={32} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.push(`/(squads)/${id}/settings`);
          }}
        >
          <Ionicons name="settings-outline" size={32} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Image
              source={
                squad?.squad_image_url
                  ? { uri: squad.squad_image_url }
                  : require("@/assets/squads/home.png")
              }
              style={styles.squadIcon}
            />
          </View>
          <Text style={styles.squadName}>{squad?.squad_name}</Text>
        </View>
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              console.log("task", item.id);
            }}
          >
            <View style={styles.taskItem}>
              <View style={styles.taskIconBox}>
                <Ionicons name="checkbox-outline" size={24} color="#999" />
              </View>
              <Text style={styles.taskText}>{item.name}</Text>
              <Ionicons
                name="flame-outline"
                size={32}
                color="#FF6B6B"
                style={{ marginLeft: "auto" }}
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRight: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 72,
    height: 72,
    marginRight: 12,
  },
  squadIcon: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  squadName: {
    fontSize: 48,
    fontWeight: "600",
    color: "#333",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  taskIconBox: {
    width: 30,
    alignItems: "center",
    marginRight: 12,
  },
  taskText: {
    fontSize: 20,
    color: "#333",
  },
});
