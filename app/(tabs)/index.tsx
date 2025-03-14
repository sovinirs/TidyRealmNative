import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.filterContainer}>
          {/* Task Status Filter */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.taskStatusFilterContainer}
          >
            <TouchableOpacity style={styles.taskStatusFilterButton}>
              <View style={styles.taskStatusFilterButtonContent}>
                <Text style={styles.taskStatusFilterLabel}>All Tasks</Text>
                <Text
                  style={{
                    ...styles.taskStatusFilterNumber,
                    backgroundColor: "#8F8CF3",
                  }}
                >
                  10
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.taskStatusFilterButton}>
              <View style={styles.taskStatusFilterButtonContent}>
                <Text style={styles.taskStatusFilterLabel}>Completed</Text>
                <Text
                  style={[
                    styles.taskStatusFilterNumber,
                    { backgroundColor: "#5ED56B" },
                  ]}
                >
                  10
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.taskStatusFilterButton}>
              <View style={styles.taskStatusFilterButtonContent}>
                <Text style={styles.taskStatusFilterLabel}>Todo</Text>
                <Text
                  style={[
                    styles.taskStatusFilterNumber,
                    { backgroundColor: "#F6BC54" },
                  ]}
                >
                  5
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Member Filter */}
          <View style={styles.memberFilterWrapper}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={styles.memberFilterContainer}
            >
              <TouchableOpacity style={styles.memberFilterButton}>
                <Text style={styles.memberFilterLabel}>All Members</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {[
            { day: "Mon", number: 1, selected: false },
            { day: "Tue", number: 2, selected: false },
            { day: "Wed", number: 3, selected: true },
            { day: "Thu", number: 4, selected: false },
            { day: "Fri", number: 5, selected: false },
            { day: "Sat", number: 6, selected: false },
          ].map((item, index) =>
            item.selected ? (
              <TouchableOpacity
                key={index}
                style={[styles.calendarDateButton, { backgroundColor: "#000" }]}
              >
                <Text style={[styles.calendarDateDay, { color: "#fff" }]}>
                  {item.day}
                </Text>
                <Text style={[styles.calendarDateNumber, { color: "#fff" }]}>
                  {item.number}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity key={index} style={styles.calendarDateButton}>
                <Text style={styles.calendarDateDay}>{item.day}</Text>
                <Text style={styles.calendarDateNumber}>{item.number}</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Tasks */}
        <View style={styles.tasksContainer}>
          <View style={styles.tasksCard}>
            <View style={styles.tasksCardHeader}>
              <Text style={styles.cardTitle}>Clean Kitchen</Text>
            </View>
            <View style={styles.tasksCardContent}>
              <Text style={styles.tasksCardSubtitle}>
                30 minutes • High Priority
              </Text>
            </View>
          </View>

          <View style={styles.tasksCard}>
            <View style={styles.tasksCardHeader}>
              <Text style={styles.cardTitle}>Organize Closet</Text>
            </View>
            <View style={styles.tasksCardContent}>
              <Text style={styles.tasksCardSubtitle}>
                45 minutes • Medium Priority
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subGreeting: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  taskStatusFilterContainer: {
    flexDirection: "row",
    width: "70%",
  },
  taskStatusFilterButton: {
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    elevation: 2,
  },
  taskStatusFilterButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskStatusFilterLabel: {
    fontSize: 12,
    color: "#000",
    marginRight: 8,
  },
  taskStatusFilterNumber: {
    fontSize: 12,
    color: "#000",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  memberFilterWrapper: {
    width: "30%",
    alignItems: "flex-end",
  },
  memberFilterContainer: {
    flexDirection: "row",
  },
  memberFilterButton: {
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    elevation: 2,
  },
  memberFilterLabel: {
    fontSize: 12,
    color: "#666",
  },
  calendarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  calendarDateButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#000",
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarDateDay: {
    fontSize: 12,
    color: "#666",
  },
  calendarDateNumber: {
    fontSize: 12,
    color: "#666",
  },
  tasksContainer: {
    flexDirection: "column",
    gap: 24,
  },
  tasksCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    flex: 1,
  },
  tasksCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tasksCardContent: {
    flexDirection: "row",
  },
  tasksCardSubtitle: {
    fontSize: 12,
    color: "#666",
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
