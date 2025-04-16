import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSquadStore } from "@/stores/squadStore";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SquadMember } from "@/types/squads";

export default function SettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { members, fetchSquadMembers } = useSquadStore();

  useEffect(() => {
    fetchSquadMembers(id as string);
  }, []);

  const renderMemberItem = ({ item }: { item: SquadMember }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.member.full_name}</Text>
        <Text style={styles.memberEmail}>{item.member.user_email}</Text>
        <Text style={styles.joinDate}>
          Joined: {new Date(item.joined_at).toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={32} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Squad Members</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="person-add" size={24} color="#5D5FEF" />
          <Text style={styles.buttonText}>Add People</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="link" size={24} color="#5D5FEF" />
          <Text style={styles.buttonText}>Invite via Link</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMemberItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#5D5FEF",
  },
  listContainer: {
    padding: 20,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: "#999",
  },
});
