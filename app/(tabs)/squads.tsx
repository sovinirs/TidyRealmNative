import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CustomModal from "../../components/modals/ModalComponent";
import AddMemberContent from "../../components/modals/AddMember";

import { useHouseholdStore } from "@/stores/householdStore";
import { useUserStore } from "@/stores/userStore";

import { HouseholdMember } from "@/types/household";

export default function SquadsScreen() {
  const {
    members,
    currentHousehold,
    loading,
    fetchHouseholdMembers,
    removeMemberFromHousehold,
  } = useHouseholdStore();
  const { userProfile } = useUserStore();

  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);

  const handleLeaveHousehold = () => {
    Alert.alert("Are you sure about leaving this household?", "", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          if (currentHousehold && userProfile) {
            removeMemberFromHousehold(currentHousehold.id, userProfile.user_id);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (currentHousehold) {
      fetchHouseholdMembers(currentHousehold.id);
    }
  }, [currentHousehold]);

  const renderMemberItem = ({ item }: { item: HouseholdMember }) => {
    // Add a null check for the member object
    if (!item.member) {
      // Render a fallback UI for members without profile data
      return (
        <TouchableOpacity style={styles.memberCard}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: getRoleColor(item.role) + "20" },
            ]}
          >
            <Ionicons name="person" size={32} color={getRoleColor(item.role)} />
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>Unknown Member</Text>
            <View style={styles.roleContainer}>
              <Text
                style={[styles.memberRole, { color: getRoleColor(item.role) }]}
              >
                {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
              </Text>
              <Text style={styles.memberStatus}>
                • {getStatusText(item.status)}
              </Text>
            </View>
            <Text style={styles.memberEmail}>Pending user</Text>
            <Text style={styles.joinedDate}>
              Joined: {new Date(item.joined_at).toLocaleDateString()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      );
    }

    // Original rendering for members with profile data
    return (
      <TouchableOpacity style={styles.memberCard}>
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: getRoleColor(item.role) + "20" },
          ]}
        >
          {item.member.avatar_url ? (
            <Image
              source={{ uri: item.member.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <Ionicons name="person" size={32} color={getRoleColor(item.role)} />
          )}
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>
            {item.member.full_name || "Unnamed User"}
          </Text>
          <View style={styles.roleContainer}>
            <Text
              style={[styles.memberRole, { color: getRoleColor(item.role) }]}
            >
              {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
            </Text>
            <Text style={styles.memberStatus}>
              • {getStatusText(item.status)}
            </Text>
          </View>
          <Text style={styles.memberEmail}>
            {item.member.user_email || "No email provided"}
          </Text>
          <Text style={styles.joinedDate}>
            Joined: {new Date(item.joined_at).toLocaleDateString()}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4c669f" />
        <Text style={styles.loadingText}>Loading household members...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Members</Text>
        <View style={styles.addLeaveButtonsRow}>
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={() => {
              handleLeaveHousehold();
            }}
          >
            <Text style={styles.leaveButtonText}>Leave Household</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddMemberModalVisible(true)}
          >
            <Text style={styles.addButtonText}>Add Member</Text>
          </TouchableOpacity>
        </View>
      </View>
      {members.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No members found</Text>
          <Text style={styles.emptySubText}>
            Invite people to join your household
          </Text>
        </View>
      ) : (
        <FlatList
          data={members}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add Member Modal */}
      <CustomModal
        isVisible={addMemberModalVisible}
        onClose={() => setAddMemberModalVisible(false)}
        title="Add Member"
      >
        {currentHousehold && (
          <AddMemberContent
            onClose={() => setAddMemberModalVisible(false)}
            householdId={currentHousehold.id}
            onMemberAdded={() => fetchHouseholdMembers(currentHousehold.id)}
          />
        )}
      </CustomModal>
    </SafeAreaView>
  );
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "owner":
      return "#4c669f";
    case "admin":
      return "#6b8cce";
    case "member":
      return "#8aa6e0";
    case "guest":
      return "#a8c0f0";
    default:
      return "#ccc";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "Active";
    case "invited":
      return "Invited";
    case "left":
      return "Left";
    case "removed":
      return "Removed";
    default:
      return "Unknown";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    padding: 16,
    paddingBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#666",
  },
  listContent: {
    padding: 12,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    fontWeight: "500",
  },
  memberStatus: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  memberEmail: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  joinedDate: {
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    color: "#666",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#4c669f",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: "#fff",
  },
  addLeaveButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  leaveButton: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  leaveButtonText: {
    color: "#fff",
    fontSize: 12,
  },
});
