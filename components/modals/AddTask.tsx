import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Dropdown from "../forms/Dropdown";
import MultiselectDropdown from "../forms/MultiselectDropdown";

// Mock data
const SQUADS = ["Squad #1", "Squad #2", "Squad #3"];
const SQUAD_MEMBERS = [
  "Member #1",
  "Member #2",
  "Member #3",
  "Member #4",
  "Member #5",
  "Member #6",
  "Member #7",
  "Member #8",
  "Member #9",
  "Member #10",
  "Member #11",
  "Member #12",
  "Member #13",
  "Member #14",
  "Member #15",
  "Member #16",
  "Member #17",
];
const FREQUENCY_UNITS = ["Days", "Weeks", "Months", "Years"];

export default function AddTaskScreen() {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [frequencyNumber, setFrequencyNumber] = useState("2");
  const [selectedSquad, setSelectedSquad] = useState(SQUADS[0]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [involvementType, setInvolvementType] = useState("Assignee");
  const [frequency, setFrequency] = useState("Once");
  const [frequencyUnit, setFrequencyUnit] = useState("Days");
  const [requiresApproval, setRequiresApproval] = useState("Yes");

  // Dropdown states
  const [squadDropdownOpen, setSquadDropdownOpen] = useState(false);
  const [membersDropdownOpen, setMembersDropdownOpen] = useState(false);
  const [approvalDropdownOpen, setApprovalDropdownOpen] = useState(false);
  const [frequencyUnitDropdownOpen, setFrequencyUnitDropdownOpen] =
    useState(false);

  const toggleMemberSelection = (member: string) => {
    if (selectedMembers.includes(member)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== member));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const incrementFrequency = () => {
    const num = parseInt(frequencyNumber, 10) || 0;
    setFrequencyNumber((num + 1).toString());
  };

  const decrementFrequency = () => {
    const num = parseInt(frequencyNumber, 10) || 0;
    if (num > 1) {
      setFrequencyNumber((num - 1).toString());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Add Task</Text>

          {/* Task Name & Icon */}
          <View style={styles.row}>
            <View style={styles.iconBox} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Task Name"
              value={taskName}
              onChangeText={setTaskName}
            />
          </View>

          <Text style={styles.label}>Task Description</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Enter description..."
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Squad</Text>
          <Dropdown
            open={squadDropdownOpen}
            options={SQUADS}
            value={selectedSquad}
            onSelect={setSelectedSquad}
            onToggle={() => setSquadDropdownOpen(!squadDropdownOpen)}
            placeholder="Select a squad"
          />

          <Text style={styles.label}>Involves</Text>
          <MultiselectDropdown
            options={SQUAD_MEMBERS}
            selectedValues={selectedMembers}
            onToggleItem={toggleMemberSelection}
            open={membersDropdownOpen}
            onToggle={() => setMembersDropdownOpen(!membersDropdownOpen)}
          />

          <Text style={styles.label}>Involvement Type</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                involvementType === "Assignee" &&
                  styles.frequencyButtonSelected,
              ]}
              onPress={() => setInvolvementType("Assignee")}
            >
              <Text
                style={
                  involvementType === "Assignee"
                    ? styles.frequencyTextSelected
                    : styles.frequencyText
                }
              >
                Assignee
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                involvementType === "Collab" && styles.frequencyButtonSelected,
              ]}
              onPress={() => setInvolvementType("Collab")}
            >
              <Text
                style={
                  involvementType === "Collab"
                    ? styles.frequencyTextSelected
                    : styles.frequencyText
                }
              >
                Collab
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Frequency</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === "Once" && styles.frequencyButtonSelected,
              ]}
              onPress={() => setFrequency("Once")}
            >
              <Text
                style={
                  frequency === "Once"
                    ? styles.frequencyTextSelected
                    : styles.frequencyText
                }
              >
                Once
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === "Recurring" && styles.frequencyButtonSelected,
              ]}
              onPress={() => setFrequency("Recurring")}
            >
              <Text
                style={
                  frequency === "Recurring"
                    ? styles.frequencyTextSelected
                    : styles.frequencyText
                }
              >
                Recurring
              </Text>
            </TouchableOpacity>
          </View>

          {frequency === "Recurring" && (
            <View style={[styles.row, { marginVertical: 12 }]}>
              <Text style={[styles.label, styles.frequencyField]}>Every</Text>
              <TouchableOpacity
                style={[styles.counterBtn, styles.frequencyField]}
                onPress={decrementFrequency}
              >
                <Text>-</Text>
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.frequencyInput,
                  styles.frequencyField,
                  { textAlign: "center" },
                ]}
                value={frequencyNumber}
                onChangeText={setFrequencyNumber}
                keyboardType="number-pad"
              />
              <TouchableOpacity
                style={[styles.counterBtn, styles.frequencyField]}
                onPress={incrementFrequency}
              >
                <Text>+</Text>
              </TouchableOpacity>
              <Dropdown
                open={frequencyUnitDropdownOpen}
                options={FREQUENCY_UNITS}
                value={frequencyUnit}
                onSelect={setFrequencyUnit}
                onToggle={() =>
                  setFrequencyUnitDropdownOpen(!frequencyUnitDropdownOpen)
                }
                customStyles={{
                  dropdownContainer: {
                    position: "relative",
                    width: 100,
                  },
                  input: {
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: "#f9f9f9",
                  },
                }}
              />
            </View>
          )}

          <View style={styles.rowBetween}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput style={styles.input} placeholder="MM/DD/YYYY" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End Date (optional)</Text>
              <TextInput style={styles.input} placeholder="MM/DD/YYYY" />
            </View>
          </View>

          <Text style={styles.label}>Requires Approval for Completion</Text>
          <Dropdown
            open={approvalDropdownOpen}
            options={["Yes", "No"]}
            value={requiresApproval}
            onSelect={setRequiresApproval}
            onToggle={() => setApprovalDropdownOpen(!approvalDropdownOpen)}
            placeholder="Select"
          />
        </ScrollView>

        {/* Sticky Add Task Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 16, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  label: { marginVertical: 8, fontSize: 16, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 8,
  },
  frequencyInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  iconBox: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginRight: 10,
    marginBottom: 8,
  },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 6 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    flexDirection: "row",
    alignItems: "center",
  },
  tagIcon: {
    marginLeft: 4,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: "#5D5FEF",
    backgroundColor: "#EEF0FF",
  },
  radioCircle: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#5D5FEF",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  radioChecked: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#5D5FEF",
  },
  frequencyButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 4,
  },
  frequencyButtonSelected: {
    borderColor: "#5D5FEF",
    backgroundColor: "#EEF0FF",
  },
  frequencyText: {
    color: "#333",
  },
  frequencyTextSelected: {
    color: "#5D5FEF",
    fontWeight: "500",
  },
  frequencyField: {
    flex: 1,
    marginHorizontal: 4,
  },
  counterBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eaeaea",
  },
  addButton: {
    backgroundColor: "#5D5FEF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownContainer: {
    position: "relative",
  },
  dropdownField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    maxHeight: 200,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    fontWeight: "bold",
    color: "#5D5FEF",
  },
  placeholderText: {
    color: "#999",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
