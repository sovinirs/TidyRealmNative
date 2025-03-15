import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { addHouseholdMember } from "@/services/householdService";

type Props = {
  onClose: () => void;
  householdId: string;
  onMemberAdded: () => void;
};

export default function AddMemberContent({
  onClose,
  householdId,
  onMemberAdded,
}: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddMember = async () => {
    // Reset error state
    setError("");

    // Basic validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    // Show loading indicator
    setLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      // Add member to household
      const { data, error } = await addHouseholdMember(
        householdId,
        email.trim(),
        "member", // Default role
        user.id // Current user is the inviter
      );

      if (error) {
        console.error("Error adding member:", error);
        setError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "Failed to add member"
        );
        setLoading(false);
        return;
      }

      // Check if this was a pending registration invitation
      const isPendingRegistration =
        data &&
        typeof data === "object" &&
        "status" in data &&
        data.status === "pending_registration";

      // Success
      Alert.alert(
        "Success",
        isPendingRegistration
          ? "Invitation sent! The user will be added to your household when they create an account."
          : "Invitation sent successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setEmail("");
              // Refresh members list
              onMemberAdded();
              // Close modal
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Enter the email address of the person you want to invite to your
        household
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          (!email.trim() || loading) && styles.buttonDisabled,
        ]}
        onPress={handleAddMember}
        disabled={!email.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add Member</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: If the user doesn't have an account yet, they will receive an
        invitation and will be added to your household when they sign up.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  errorText: {
    color: "#ff3b30",
    marginBottom: 16,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#4c669f",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9db1d9",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  note: {
    fontSize: 12,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
});
