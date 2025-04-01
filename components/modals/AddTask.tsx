import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTaskStore } from "@/stores/taskStore";
import { useSquadStore } from "@/stores/squadStore";
import { useUserStore } from "@/stores/userStore";
import { TaskPriority, InvolvementType, FrequencyUnit } from "@/types/task";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

type Props = {
  onClose: () => void;
};

export default function AddTaskContent({ onClose }: Props) {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [taskIcon, setTaskIcon] = useState<
    React.ComponentProps<typeof Ionicons>["name"]
  >("help-circle-outline"); // Default icon
  const [involvedMembers, setInvolvedMembers] = useState<string[]>([]);
  const [involvementType, setInvolvementType] =
    useState<InvolvementType>("assignee");
  const [frequency, setFrequency] = useState("once");
  const [frequencyNumber, setFrequencyNumber] = useState("1");
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>("day");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [weekendsOnly, setWeekendsOnly] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [trackIndividualProgress, setTrackIndividualProgress] = useState(false);

  const { createTask, loading, error } = useTaskStore();
  const { currentSquad, members, fetchSquadMembers } = useSquadStore();
  const { userProfile } = useUserStore();

  useEffect(() => {
    if (currentSquad) {
      fetchSquadMembers(currentSquad.id);
    }
  }, [currentSquad]);

  const involvementTypes = [
    { id: "assignee", name: "Assignee" },
    { id: "collaborator", name: "Collaborator" },
  ];

  // Function to determine icon based on task name
  const determineTaskIcon = (
    name: string
  ): React.ComponentProps<typeof Ionicons>["name"] => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("clean") || nameLower.includes("wash"))
      return "water-outline";
    if (nameLower.includes("cook") || nameLower.includes("food"))
      return "restaurant-outline";
    if (nameLower.includes("shop") || nameLower.includes("buy"))
      return "cart-outline";
    if (nameLower.includes("fix") || nameLower.includes("repair"))
      return "build-outline";
    return "checkmark-circle-outline";
  };

  // Update icon when task name changes
  React.useEffect(() => {
    if (taskName) {
      setTaskIcon(determineTaskIcon(taskName));
    }
  }, [taskName]);

  // Check if date is weekend
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  // Show weekend option if frequency > monthly and start date is weekend
  const shouldShowWeekendOption = () => {
    return (
      frequencyUnit === "month" &&
      parseInt(frequencyNumber) >= 1 &&
      isWeekend(startDate)
    );
  };

  // Toggle member selection
  const toggleMember = (memberId: string) => {
    setInvolvedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
    setDate: (date: Date) => void,
    setShow: (show: boolean) => void
  ) => {
    setShow(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAddTask = () => {
    console.log("handleAddTask");
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Task Details</Text>
          <View style={styles.taskNameContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name={taskIcon} size={24} color="#4c669f" />
            </View>
            <TextInput
              style={styles.taskNameInput}
              value={taskName}
              onChangeText={setTaskName}
              placeholder="Enter task name"
            />
          </View>

          <View style={styles.descriptionContainer}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description (optional)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Involves</Text>
          <View style={styles.membersContainer}>
            {members.map((member) => (
              <TouchableOpacity
                key={member.member_id}
                style={[
                  styles.memberItem,
                  member.member_id === userProfile?.user_id &&
                    styles.currentUserItem,
                ]}
                onPress={() => toggleMember(member.member_id)}
              >
                <Text
                  style={[
                    styles.memberName,
                    member.member_id === userProfile?.user_id &&
                      styles.currentUserText,
                  ]}
                >
                  {member.member?.full_name}
                  {member.member_id === userProfile?.user_id && " (You)"}
                </Text>
                <View style={styles.checkbox}>
                  {involvedMembers.includes(member.member_id) && (
                    <Ionicons name="checkmark" size={18} color="#4c669f" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Involvement Type</Text>
          <View style={styles.membersContainer}>
            {involvementTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.memberItem}
                onPress={() => setInvolvementType(type.id as InvolvementType)}
              >
                <Text style={styles.memberName}>{type.name}</Text>
                <View style={styles.checkbox}>
                  {type.id === involvementType && (
                    <Ionicons name="checkmark" size={18} color="#4c669f" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {involvementType === "collaborator" && (
            <View style={[styles.switchContainer, { marginTop: 12 }]}>
              <Text style={styles.helperText}>Track Individual Progress</Text>
              <Switch
                value={trackIndividualProgress}
                onValueChange={setTrackIndividualProgress}
                trackColor={{ false: "#ccc", true: "#4c669f" }}
                thumbColor="#fff"
              />
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.frequencyContainer}>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === "once" && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency("once")}
            >
              <Text
                style={
                  frequency === "once" ? styles.activeText : styles.inactiveText
                }
              >
                Once
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === "recurring" && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency("recurring")}
            >
              <Text
                style={
                  frequency === "recurring"
                    ? styles.activeText
                    : styles.inactiveText
                }
              >
                Recurring
              </Text>
            </TouchableOpacity>
          </View>

          {frequency === "recurring" && (
            <View style={styles.recurringOptions}>
              <Text style={styles.recurringText}>Every</Text>
              <TextInput
                style={styles.numberInput}
                value={frequencyNumber}
                onChangeText={setFrequencyNumber}
                keyboardType="numeric"
              />
              <View style={styles.unitSelector}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    frequencyUnit === "day" && styles.unitButtonActive,
                  ]}
                  onPress={() => setFrequencyUnit("day")}
                >
                  <Text
                    style={
                      frequencyUnit === "day"
                        ? styles.activeText
                        : styles.inactiveText
                    }
                  >
                    Day
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    frequencyUnit === "week" && styles.unitButtonActive,
                  ]}
                  onPress={() => setFrequencyUnit("week")}
                >
                  <Text
                    style={
                      frequencyUnit === "week"
                        ? styles.activeText
                        : styles.inactiveText
                    }
                  >
                    Week
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    frequencyUnit === "month" && styles.unitButtonActive,
                  ]}
                  onPress={() => setFrequencyUnit("month")}
                >
                  <Text
                    style={
                      frequencyUnit === "month"
                        ? styles.activeText
                        : styles.inactiveText
                    }
                  >
                    Month
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <View style={styles.dateRow}>
            <View style={styles.dateColumn}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#4c669f" />
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) =>
                    handleDateChange(
                      event,
                      date,
                      setStartDate,
                      setShowStartDatePicker
                    )
                  }
                />
              )}
            </View>

            <View style={styles.dateColumn}>
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {endDate.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#4c669f" />
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) =>
                    handleDateChange(
                      event,
                      date,
                      setEndDate,
                      setShowEndDatePicker
                    )
                  }
                />
              )}
            </View>
          </View>

          {shouldShowWeekendOption() && (
            <View style={styles.weekendOption}>
              <Text style={styles.weekendText}>Repeat only on weekends?</Text>
              <Switch
                value={weekendsOnly}
                onValueChange={setWeekendsOnly}
                trackColor={{ false: "#ccc", true: "#4c669f" }}
                thumbColor="#fff"
              />
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Requires Approval</Text>
            <Switch
              value={requiresApproval}
              onValueChange={setRequiresApproval}
              trackColor={{ false: "#ccc", true: "#4c669f" }}
              thumbColor="#fff"
            />
          </View>
          {requiresApproval && (
            <Text style={styles.helperText}>
              Task completion and changes will require approval from involved
              members
            </Text>
          )}
        </View>
      </View>

      <View style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddTask}
          disabled={loading || !taskName || involvedMembers.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Add Task</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 16,
  },
  submitButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    backgroundColor: "#fff",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flex: 1,
    marginHorizontal: 4,
  },
  priorityButtonActive: {
    borderWidth: 2,
  },
  priorityText: {
    marginLeft: 4,
    fontWeight: "500",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#4c669f",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  taskNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  taskNameInput: {
    flex: 1,
  },
  membersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    margin: 4,
  },
  memberName: {
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  frequencyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  frequencyButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  frequencyButtonActive: {
    borderWidth: 2,
  },
  recurringOptions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  recurringText: {
    marginRight: 8,
  },
  numberInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
  },
  unitSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  unitButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  unitButtonActive: {
    borderWidth: 2,
  },
  activeText: {
    fontWeight: "600",
  },
  inactiveText: {
    color: "#999",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
  },
  dateText: {
    marginRight: 8,
  },
  weekendOption: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  weekendText: {
    marginRight: 8,
  },
  helperText: {
    color: "#999",
    marginTop: 8,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateColumn: {
    flex: 1,
  },
  errorText: {
    color: "#ff0000",
    marginBottom: 10,
    textAlign: "center",
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  currentUserItem: {
    borderColor: "#4c669f",
    borderWidth: 2,
  },
  currentUserText: {
    color: "#4c669f",
    fontWeight: "600",
  },
  descriptionContainer: {
    marginTop: 12,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
});
