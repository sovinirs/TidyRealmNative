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
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Mock data
const SQUADS = ["Squad #1", "Squad #2", "Squad #3"];
const SQUAD_MEMBERS = [
  "Member #1",
  "Member #2",
  "Member #3",
  "Member #4",
  "Member #5",
];

// Type definitions
interface DropdownProps {
  open: boolean;
  options: string[];
  value: string;
  onSelect: (option: string) => void;
  onToggle: () => void;
  placeholder?: string;
}

interface MultiselectDropdownProps {
  options: string[];
  selectedValues: string[];
  onToggleItem: (item: string) => void;
  open: boolean;
  onToggle: () => void;
}

export default function AddTaskScreen() {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [frequencyNumber, setFrequencyNumber] = useState("2");
  const [selectedSquad, setSelectedSquad] = useState(SQUADS[0]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [involvementType, setInvolvementType] = useState("Assignee");
  const [individualProgress, setIndividualProgress] = useState("Yes");
  const [frequency, setFrequency] = useState("Once");
  const [requiresApproval, setRequiresApproval] = useState("Yes");

  // Dropdown states
  const [squadDropdownOpen, setSquadDropdownOpen] = useState(false);
  const [membersDropdownOpen, setMembersDropdownOpen] = useState(false);
  const [progressDropdownOpen, setProgressDropdownOpen] = useState(false);
  const [approvalDropdownOpen, setApprovalDropdownOpen] = useState(false);

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

  // Dropdown component
  const Dropdown = ({
    open,
    options,
    value,
    onSelect,
    onToggle,
    placeholder,
  }: DropdownProps) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.input} onPress={onToggle}>
        <View style={styles.dropdownField}>
          <Text>{value || placeholder}</Text>
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color="#666"
          />
        </View>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownMenu}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(option);
                onToggle();
              }}
            >
              <Text style={value === option ? styles.selectedOption : null}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // Multiselect Dropdown component
  const MultiselectDropdown = ({
    options,
    selectedValues,
    onToggleItem,
    open,
    onToggle,
  }: MultiselectDropdownProps) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.input} onPress={onToggle}>
        <View style={styles.dropdownField}>
          {selectedValues.length > 0 ? (
            <Text numberOfLines={1} ellipsizeMode="tail">
              {selectedValues.join(", ")}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>Select members</Text>
          )}
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color="#666"
          />
        </View>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownMenu}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownItem}
              onPress={() => onToggleItem(option)}
            >
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox}>
                  {selectedValues.includes(option) && (
                    <Ionicons name="checkmark" size={16} color="#5D5FEF" />
                  )}
                </View>
                <Text>{option}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

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

          {selectedMembers.length > 0 && (
            <View style={styles.tagRow}>
              {selectedMembers.map((member) => (
                <TouchableOpacity
                  key={member}
                  style={styles.tag}
                  onPress={() => toggleMemberSelection(member)}
                >
                  <Text>{member}</Text>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color="#666"
                    style={styles.tagIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Watchers</Text>
          <MultiselectDropdown
            options={SQUAD_MEMBERS}
            selectedValues={selectedMembers}
            onToggleItem={toggleMemberSelection}
            open={membersDropdownOpen}
            onToggle={() => setMembersDropdownOpen(!membersDropdownOpen)}
          />

          {selectedMembers.length > 0 && (
            <View style={styles.tagRow}>
              {selectedMembers.map((member) => (
                <TouchableOpacity
                  key={member}
                  style={styles.tag}
                  onPress={() => toggleMemberSelection(member)}
                >
                  <Text>{member}</Text>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color="#666"
                    style={styles.tagIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.label}>Involvement Type</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    involvementType === "Assignee" &&
                      styles.radioButtonSelected,
                  ]}
                  onPress={() => setInvolvementType("Assignee")}
                >
                  <View style={styles.radioCircle}>
                    {involvementType === "Assignee" && (
                      <View style={styles.radioChecked} />
                    )}
                  </View>
                  <Text>Assignee</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    involvementType === "Collab" && styles.radioButtonSelected,
                  ]}
                  onPress={() => setInvolvementType("Collab")}
                >
                  <View style={styles.radioCircle}>
                    {involvementType === "Collab" && (
                      <View style={styles.radioChecked} />
                    )}
                  </View>
                  <Text>Collab</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <Text style={styles.label}>Individual Progress</Text>
              <Dropdown
                open={progressDropdownOpen}
                options={["Yes", "No"]}
                value={individualProgress}
                onSelect={setIndividualProgress}
                onToggle={() => setProgressDropdownOpen(!progressDropdownOpen)}
                placeholder="Select"
              />
            </View>
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
            <View style={[styles.row, { marginVertical: 10 }]}>
              <Text style={[styles.label, styles.frequencyField]}>Every</Text>
              <TouchableOpacity
                style={[styles.counterBtn, styles.frequencyField]}
                onPress={decrementFrequency}
              >
                <Text>-</Text>
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.input,
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
              <View style={[styles.input, styles.frequencyField]}>
                <Text>Days</Text>
              </View>
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

          <Text style={styles.label}>Requires Approval</Text>
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
  iconBox: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginRight: 10,
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
    zIndex: 1,
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
    marginTop: -4,
    maxHeight: 200,
    zIndex: 10,
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
