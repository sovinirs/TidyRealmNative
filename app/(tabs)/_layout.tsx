import React, { useState } from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomModal from "../../components/modals/ModalComponent";
import ProfileContent from "../../components/modals/ProfileContent";
import AddTaskContent from "../../components/modals/AddTask";

const getPageName = (segments: string[]): string => {
  const pageName = segments.find(
    (segment) => segment && !segment.includes("tabs")
  );

  switch (pageName) {
    case "(squads)":
      return "Squads";
    case "activity":
      return "Activity";
    default:
      return "Home";
  }
};

export default function TabLayout() {
  const segments = useSegments();

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);

  const [streak, setStreak] = useState(0);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity style={styles.pageButton}>
            <Text style={styles.pageText}>{getPageName(segments)}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.streakContainer}>
            <TouchableOpacity
              onPress={() => console.log("streak button clicked")}
            >
              <Ionicons name="flame" size={24} color="#5D5FEF" />
            </TouchableOpacity>
            <Text style={styles.streakText}>{streak}</Text>
          </View>
          <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
            <Ionicons name="person-circle-outline" size={48} color="#5D5FEF" />
          </TouchableOpacity>
        </View>
      </View>

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#5D5FEF",
          tabBarInactiveTintColor: "#888888",
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
        }}
        initialRouteName="index"
      >
        <Tabs.Screen
          name="(squads)"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather name="users" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: () => (
              <View style={styles.addButton}>
                {segments.join("/") === "(tabs)" ? (
                  <TouchableOpacity
                    onPress={() => setAddTaskModalVisible(true)}
                  >
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="home" size={32} color="#FFFFFF" />
                )}
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="activity"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="checklist" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <CustomModal
        isVisible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        title="Profile"
      >
        <ProfileContent onClose={() => setProfileModalVisible(false)} />
      </CustomModal>

      <CustomModal
        isVisible={addTaskModalVisible}
        onClose={() => setAddTaskModalVisible(false)}
        title="Add Task"
      >
        <AddTaskContent onClose={() => setAddTaskModalVisible(false)} />
      </CustomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    padding: 16,
    borderBottomColor: "#DDDDDD",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    zIndex: 10,
  },
  headerRight: {
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
  },
  pageButton: {
    paddingVertical: 8,
  },
  pageText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#555555",
  },
  streakContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  streakText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5D5FEF",
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 32,
    height: 72,
    width: "56%",
    marginBottom: 32,
    marginHorizontal: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  addButton: {
    backgroundColor: "#5D5FEF",
    width: 72,
    height: 72,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
