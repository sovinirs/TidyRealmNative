import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import styles from "./styles";

interface MultiselectDropdownProps {
  options: { label: string; value: string }[];
  selectedValues: { label: string; value: string }[];
  onToggleItem: (item: { label: string; value: string }) => void;
  open: boolean;
  onToggle: () => void;
  customStyles?: any;
}

// Multiselect Dropdown component
export default function MultiselectDropdown({
  options,
  selectedValues,
  onToggleItem,
  open,
  onToggle,
  customStyles,
}: MultiselectDropdownProps) {
  return (
    <View
      style={
        customStyles && customStyles.dropdownContainer
          ? customStyles.dropdownContainer
          : styles.dropdownContainer
      }
    >
      <TouchableOpacity
        style={
          customStyles && customStyles.input ? customStyles.input : styles.input
        }
        onPress={onToggle}
      >
        <View style={styles.dropdownField}>
          {selectedValues.length > 0 ? (
            <View style={styles.tagRow}>
              {selectedValues.map((member) => (
                <TouchableOpacity
                  key={member.value}
                  style={styles.tag}
                  onPress={() => onToggleItem(member)}
                >
                  <Text>{member.label}</Text>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color="#666"
                    style={styles.tagIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
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
        <ScrollView style={styles.dropdownMenu}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.dropdownItem}
              onPress={() => onToggleItem(option)}
            >
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox}>
                  {selectedValues.some((m) => m.value === option.value) && (
                    <Ionicons name="checkmark" size={16} color="#5D5FEF" />
                  )}
                </View>
                <Text>{option.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
