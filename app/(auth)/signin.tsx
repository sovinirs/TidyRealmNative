import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "@/stores/userStore";

export default function SigninScreen() {
  // router hook
  const router = useRouter();

  // auth store
  const {
    userProfile,
    loading,
    error,
    signIn,
    getUserProfile,
    createProfileForLoggedInUser,
    setError,
    pageLoadReset,
  } = useUserStore();

  // component states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignin = async () => {
    // Reset error state
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    // Sign in with Supabase
    const user = await signIn(email, password);

    // Update user profile
    if (user) {
      const functionBlockUserProfile = await getUserProfile(user.id);

      // If user doesn't exist in user_profiles, create a profile
      // Which means the user is logging in for the first time
      if (!functionBlockUserProfile) {
        await createProfileForLoggedInUser();
      }
    }
  };

  useEffect(() => {
    if (userProfile) {
      router.replace("/(tabs)");
    }
  }, [userProfile]);

  useEffect(() => {
    pageLoadReset();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.appName}>Quotidy</Text>
      <Text style={styles.signupLabel}>Sign-In</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="●●●●●●●"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => router.push("/forgotpassword")}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSignin}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In →</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => router.push("/signup")}
      >
        <Text style={styles.loginText}>
          Don't have an account? <Text style={styles.link}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    flexGrow: 1,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#5D5FEF",
    textAlign: "center",
    marginBottom: 4,
  },
  signupLabel: {
    fontSize: 18,
    color: "#888888",
    textAlign: "center",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  button: {
    backgroundColor: "#5D5FEF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 16,
    alignItems: "center",
  },
  loginText: {
    color: "#888888",
  },
  link: {
    color: "#5D5FEF",
    fontWeight: "bold",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#5D5FEF",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff3b30",
    marginBottom: 16,
    textAlign: "center",
  },
});
