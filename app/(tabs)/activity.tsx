import React from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const activities = [
  { id: "1", activity: 'John completed "Wash dishes"' },
  { id: "2", activity: 'Alice added a new task "Grocery shopping"' },
  { id: "3", activity: 'Mike updated task "Laundry"' },
  { id: "4", activity: 'Sarah joined your Squad "Home Squad"' },
  { id: "5", activity: 'Alex completed "Walk the dog"' },
];

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.activityItem}>
            <View style={styles.iconPlaceholder}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#5D5FEF"
              />
            </View>
            <Text style={styles.activityText}>{item.activity}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eaeaea",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakCount: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 4,
    color: "#FF6B6B",
  },
  profileIcon: {
    marginLeft: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fafafa",
  },
  iconPlaceholder: {
    marginRight: 12,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
  },
  activityText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  separator: {
    height: 1,
    backgroundColor: "#eaeaea",
    marginHorizontal: 16,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#eaeaea",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navItemActive: {
    borderTopWidth: 2,
    borderColor: "#5D5FEF",
  },
  navLabel: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  navLabelActive: {
    color: "#5D5FEF",
    fontWeight: "bold",
  },
});
