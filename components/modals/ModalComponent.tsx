import React from "react";
import { Modal, View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ModalProps } from "@/types/components";

export default function CustomModal({
  isVisible,
  onClose,
  children,
  title,
}: ModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          {title && <Text style={styles.modalTitle}>{title}</Text>}
        </View>
        <View style={styles.contentContainer}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60, // Added extra padding for status bar
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginRight: 40, // To offset the close button width and keep title centered
  },
  closeButton: {
    padding: 8,
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
});
