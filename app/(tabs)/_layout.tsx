import React, { useState } from "react";
import { useRootNavigationState, Tabs } from "expo-router";
import {
  useColorScheme,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomModal from "../components/CustomModal";
import ProfileContent from "../components/ProfileContent";
import AddTaskContent from "../components/AddTask";

const Colors = {
  light: {
    tint: "#4c669f",
    tabIconDefault: "#ccc",
    tabIconSelected: "#4c669f",
    background: "#fff",
  },
  dark: {
    tint: "#4FD1C5",
    tabIconDefault: "#ccc",
    tabIconSelected: "#4FD1C5",
    background: "#000",
  },
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const { routes } = useRootNavigationState();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Household 1</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 24 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => console.log("streak button clicked")}
            >
              <Ionicons name="flame" size={24} color={colors.tint} />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>10</Text>
          </View>
          <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
            <Ionicons
              name="person-circle-outline"
              size={48}
              color={colors.tint}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderWidth: 1,
            borderColor: "#000",
            borderRadius: 32,
            height: 72,
            width: "56%",
            marginBottom: 32,
            marginHorizontal: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          },
        }}
        initialRouteName="index"
      >
        <Tabs.Screen
          name="household"
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
                {routes[0].state.index == 1 ? (
                  <TouchableOpacity
                    onPress={() => setAddTaskModalVisible(true)}
                  >
                    <Ionicons name="add" size={32} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="home" size={32} color="#fff" />
                )}
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="tasks"
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subGreeting: {
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    backgroundColor: "#000",
    width: 72,
    height: 72,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
  },
});
