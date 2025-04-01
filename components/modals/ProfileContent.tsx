import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

// Stores
import { useUserStore } from "@/stores/userStore";

type Props = {
  onClose: () => void;
};

export default function ProfileContent({ onClose }: Props) {
  const { userProfile, signOut } = useUserStore();
  const handleSignOut = async () => {
    try {
      // Sign out with Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error.message);
        return;
      }

      // Close the modal first
      onClose();

      // Navigate back to auth screen after successful sign out
      router.replace("/(auth)/signin");
    } catch (err) {
      console.error("Unexpected error during sign out:", err);
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.innerContainer}>
        <View style={styles.profileSection}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle-outline" size={60} color="#5D5FEF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userProfile?.full_name || "Profile Name"}
            </Text>
            <Text style={styles.profileEmail}>
              {userProfile?.user_email || "email@example.com"}
            </Text>
          </View>
        </View>

        <View style={styles.preferencesSection}>
          <Text style={styles.preferencesTitle}>Preferences</Text>

          <TouchableOpacity style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Feedback</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Rate Us in App Store</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Contact Us</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
  },
  innerContainer: {
    padding: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eaeaea",
    paddingVertical: 20,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  profileEmail: {
    fontSize: 14,
    color: "#888",
  },
  preferencesSection: {
    marginTop: 30,
  },
  preferencesTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  preferenceText: {
    fontSize: 16,
    color: "#555",
  },
  logoutSection: {
    marginTop: "auto",
    paddingVertical: 20,
    alignItems: "center",
  },
  logoutButton: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#5D5FEF",
    alignItems: "center",
  },
  logoutText: {
    color: "#5D5FEF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
