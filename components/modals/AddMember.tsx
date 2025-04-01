import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

// Stores
import { useHouseholdStore } from "@/stores/householdStore";
import { useUserStore } from "@/stores/userStore";

// Props
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
  const { loading, error, addMember, setLoading, setError } =
    useHouseholdStore();
  const { userProfile } = useUserStore();

  const [email, setEmail] = useState("");

  const handleAddMember = async () => {
    setLoading(true);

    if (email.trim() === "") {
      setError("Please enter an email address");
      setLoading(false);
      return;
    }

    if (userProfile) {
      await addMember(householdId, email, "member", userProfile.user_id);
    }

    setTimeout(() => {
      if (!error) {
        setLoading(false);
        onClose();
        onMemberAdded();
      }
    }, 1000);
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
