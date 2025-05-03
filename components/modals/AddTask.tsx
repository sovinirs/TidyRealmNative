import React, { useEffect, useState } from "react";
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
import Dropdown from "../forms/Dropdown";
import MultiselectDropdown from "../forms/MultiselectDropdown";
import { useSquadStore } from "@/stores/squadStore";
import { useTaskStore } from "@/stores/taskStore";
import { Squad } from "@/types/squads";

const FREQUENCY_UNITS = ["day", "week", "month"];

interface AddTaskProps {
  onClose: () => void;
}

export default function AddTaskScreen({ onClose }: AddTaskProps) {
  const { squads } = useSquadStore();
  const { error, createTask } = useTaskStore();

  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [frequencyNumber, setFrequencyNumber] = useState("2");
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<
    { label: string; value: string }[]
  >([]);
  const [involvementType, setInvolvementType] = useState<
    "assignee" | "collaborator"
  >("assignee");
  const [frequencyType, setFrequencyType] = useState<"once" | "recurring">(
    "once"
  );
  const [frequencyUnit, setFrequencyUnit] = useState<"day" | "week" | "month">(
    "day"
  );
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Dropdown states
  const [squadDropdownOpen, setSquadDropdownOpen] = useState(false);
  const [membersDropdownOpen, setMembersDropdownOpen] = useState(false);
  const [frequencyUnitDropdownOpen, setFrequencyUnitDropdownOpen] =
    useState(false);

  const toggleMemberSelection = (member: { label: string; value: string }) => {
    if (selectedMembers.some((m) => m.value === member.value)) {
      setSelectedMembers(
        selectedMembers.filter((m) => m.value !== member.value)
      );
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

  const clearStates = () => {
    setTaskName("");
    setDescription("");
    setFrequencyNumber("2");
    setSelectedMembers([]);
    setInvolvementType("assignee");
    setFrequencyType("once");
    setFrequencyUnit("day");
    setStartDate(new Date());
    setEndDate(undefined);
  };

  const handleAddTask = async () => {
    if (!selectedSquad || !taskName.trim()) {
      return;
    }

    try {
      await createTask(
        selectedSquad.id,
        taskName.trim(),
        description.trim() || null,
        "📝", // Default icon for now
        selectedMembers.map((m) => m.value),
        involvementType,
        frequencyType,
        startDate,
        endDate,
        frequencyType === "recurring" ? parseInt(frequencyNumber) : undefined,
        frequencyType === "recurring" ? frequencyUnit : undefined,
        false // weekends_only
      );

      clearStates();
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  useEffect(() => {
    if (squads.length > 0) {
      setSelectedSquad(squads[0]);
    }
  }, [squads]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Add Task</Text>

          {error && <Text style={styles.error}>{error}</Text>}

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
            options={squads.map((squad) => ({
              label: squad.squad_name,
              value: squad.id,
            }))}
            value={selectedSquad?.squad_name}
            onSelect={(option) => {
              const squad = squads.find((s) => s.id === option);
              if (squad) {
                setSelectedSquad(squad);
                setSelectedMembers([]);
              }
            }}
            onToggle={() => {
              setSquadDropdownOpen(!squadDropdownOpen);
              setMembersDropdownOpen(false);
            }}
            placeholder="Select a squad"
          />

          <Text style={styles.label}>Involves</Text>
          <MultiselectDropdown
            options={
              selectedSquad
                ? selectedSquad.squad_members.map((member) => ({
                    label: member.member.full_name,
                    value: member.member_id,
                  }))
                : []
            }
            selectedValues={selectedMembers}
            onToggleItem={toggleMemberSelection}
            open={membersDropdownOpen}
            onToggle={() => setMembersDropdownOpen(!membersDropdownOpen)}
          />

          <Text style={styles.label}>Frequency</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequencyType === "once" && styles.frequencyButtonSelected,
              ]}
              onPress={() => setFrequencyType("once")}
            >
              <Text
                style={
                  frequencyType === "once"
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
                frequencyType === "recurring" && styles.frequencyButtonSelected,
              ]}
              onPress={() => setFrequencyType("recurring")}
            >
              <Text
                style={
                  frequencyType === "recurring"
                    ? styles.frequencyTextSelected
                    : styles.frequencyText
                }
              >
                Recurring
              </Text>
            </TouchableOpacity>
          </View>

          {frequencyType === "recurring" && selectedMembers.length > 1 && (
            <>
              <Text style={styles.label}>Involvement Type</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    involvementType === "assignee" &&
                      styles.frequencyButtonSelected,
                  ]}
                  onPress={() => setInvolvementType("assignee")}
                >
                  <Text
                    style={
                      involvementType === "assignee"
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
                    involvementType === "collaborator" &&
                      styles.frequencyButtonSelected,
                  ]}
                  onPress={() => setInvolvementType("collaborator")}
                >
                  <Text
                    style={
                      involvementType === "collaborator"
                        ? styles.frequencyTextSelected
                        : styles.frequencyText
                    }
                  >
                    Collaborator
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {frequencyType === "recurring" && (
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
                onSelect={(value) =>
                  setFrequencyUnit(value as "day" | "week" | "month")
                }
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
              <TextInput
                style={styles.input}
                placeholder="MM/DD/YYYY"
                value={startDate.toLocaleDateString()}
                onFocus={() => {
                  // TODO: Implement date picker
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End Date (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/DD/YYYY"
                value={endDate?.toLocaleDateString() || ""}
                onFocus={() => {
                  // TODO: Implement date picker
                }}
              />
            </View>
          </View>
        </ScrollView>

        {/* Sticky Add Task Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
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
  error: {
    color: "red",
    marginBottom: 16,
  },
});
