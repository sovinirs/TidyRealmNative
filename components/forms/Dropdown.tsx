import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import styles from "./styles";

interface DropdownProps {
  open: boolean;
  options: { label: string; value: string }[] | string[];
  value: string | undefined;
  onSelect: (option: string) => void;
  onToggle: () => void;
  placeholder?: string;
  customStyles?: any;
}

export default function Dropdown({
  open,
  options,
  value,
  onSelect,
  onToggle,
  placeholder,
  customStyles,
}: DropdownProps) {
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
          <Text>{value || placeholder}</Text>
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
              key={typeof option === "string" ? option : option.value}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(typeof option === "string" ? option : option.value);
                onToggle();
              }}
            >
              <Text
                style={
                  value === (typeof option === "string" ? option : option.value)
                    ? styles.selectedOption
                    : null
                }
              >
                {typeof option === "string" ? option : option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
