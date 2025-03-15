import React, { useEffect, useState, useRef } from "react";
import {
  useRootNavigationState,
  Tabs,
  useRouter,
  usePathname,
} from "expo-router";
import {
  useColorScheme,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Animated,
} from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomModal from "../components/modals/ModalComponent";
import ProfileContent from "../components/modals/ProfileContent";
import AddTaskContent from "../components/modals/AddTask";
import { supabase } from "@/lib/supabase";
import {
  getUserHouseholds,
  saveCurrentHouseholdId,
  getCurrentHouseholdId,
} from "@/services/householdService";

const Colors = {
  light: {
    tint: "#4c669f",
    tabIconDefault: "#ccc",
    tabIconSelected: "#4c669f",
    background: "#fff",
  },
  dark: {
    tint: "#4FD1C5",
    tabIconDefault: "#ccc",
    tabIconSelected: "#4FD1C5",
    background: "#000",
  },
};

interface Household {
  id: string;
  household_name: string;
  location: string;
  created_by: string;
  created_at: string;
  status: "active" | "archived" | "deleted";
  description?: string;
  household_image_url?: string;
  updated_at: string;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const pathname = usePathname();

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [householdDropdownVisible, setHouseholdDropdownVisible] =
    useState(false);
  const { routes } = useRootNavigationState();
  const [currentHouseholdName, setCurrentHouseholdName] = useState<string>("");
  const [currentHouseholdLocation, setCurrentHouseholdLocation] =
    useState<string>("");
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [households, setHouseholds] = useState<Household[]>([]);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchUserHouseholds();
  }, []);

  useEffect(() => {
    if (householdDropdownVisible) {
      Animated.timing(dropdownAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [householdDropdownVisible]);

  const fetchUserHouseholds = async () => {
    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's households
      const { data: householdsData, error } = await getUserHouseholds(user.id);

      if (error) {
        console.error("Error fetching households:", error);
        setLoading(false);
        return;
      }

      if (householdsData && householdsData.length > 0) {
        setHouseholds(householdsData);

        // Check if there's a saved household ID
        const savedHouseholdId = await getCurrentHouseholdId();

        // Find the saved household or default to the first one
        let currentHousehold = householdsData[0];
        if (savedHouseholdId) {
          const savedHousehold = householdsData.find(
            (h) => h.id === savedHouseholdId
          );
          if (savedHousehold) {
            currentHousehold = savedHousehold;
          }
        }

        // Set current household info
        setCurrentHouseholdName(currentHousehold.household_name);
        setCurrentHouseholdLocation(currentHousehold.location);
        setCurrentHouseholdId(currentHousehold.id);

        // Save the current household ID
        await saveCurrentHouseholdId(currentHousehold.id);

        // TODO: Fetch streak data
        setStreak(10); // Placeholder
      }

      setLoading(false);
    } catch (error) {
      console.error("Unexpected error fetching households:", error);
      setLoading(false);
    }
  };

  const switchHousehold = async (household: Household) => {
    setCurrentHouseholdName(household.household_name);
    setCurrentHouseholdLocation(household.location);
    setCurrentHouseholdId(household.id);
    setHouseholdDropdownVisible(false);

    // Save the selected household ID
    await saveCurrentHouseholdId(household.id);

    // You might want to refresh other data based on the selected household
  };

  const goToCreateHousehold = () => {
    setHouseholdDropdownVisible(false);
    router.push({
      pathname: "/create-household",
      params: { mode: "switch" },
    });
  };

  const renderHouseholdItem = ({ item }: { item: Household }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        item.id === currentHouseholdId && styles.selectedDropdownItem,
      ]}
      onPress={() => switchHousehold(item)}
    >
      <View style={styles.dropdownItemContent}>
        <Ionicons
          name="home-outline"
          size={20}
          color={item.id === currentHouseholdId ? colors.tint : "#666"}
        />
        <View style={styles.dropdownItemText}>
          <Text style={styles.dropdownItemTitle}>{item.household_name}</Text>
          <Text style={styles.dropdownItemSubtitle}>{item.location}</Text>
        </View>
      </View>
      {item.id === currentHouseholdId && (
        <Ionicons name="checkmark" size={20} color={colors.tint} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          {loading ? (
            <ActivityIndicator size="small" color={colors.tint} />
          ) : (
            <TouchableOpacity
              style={styles.householdButton}
              onPress={() =>
                setHouseholdDropdownVisible(!householdDropdownVisible)
              }
            >
              <View style={styles.householdInfo}>
                <Text style={styles.title}>{currentHouseholdName}</Text>
                <Text style={styles.location}>{currentHouseholdLocation}</Text>
              </View>
              <Ionicons
                name={householdDropdownVisible ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flexDirection: "row", gap: 24 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => console.log("streak button clicked")}
            >
              <Ionicons name="flame" size={24} color={colors.tint} />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>{streak}</Text>
          </View>
          <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
            <Ionicons
              name="person-circle-outline"
              size={48}
              color={colors.tint}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Household Dropdown */}
      {householdDropdownVisible && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              opacity: dropdownAnimation,
              transform: [
                {
                  translateY: dropdownAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <FlatList
            data={households}
            renderItem={renderHouseholdItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <Text style={styles.dropdownHeader}>Your Households</Text>
            }
            ListFooterComponent={
              <TouchableOpacity
                style={styles.createHouseholdButton}
                onPress={goToCreateHousehold}
              >
                <Text style={styles.createHouseholdText}>Switch Household</Text>
              </TouchableOpacity>
            }
          />
        </Animated.View>
      )}

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderWidth: 1,
            borderColor: "#000",
            borderRadius: 32,
            height: 72,
            width: "56%",
            marginBottom: 32,
            marginHorizontal: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          },
        }}
        initialRouteName="index"
      >
        <Tabs.Screen
          name="household"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather name="users" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: () => (
              <View style={styles.addButton}>
                {pathname === "/" ? (
                  <TouchableOpacity
                    onPress={() => setAddTaskModalVisible(true)}
                  >
                    <Ionicons name="add" size={32} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="home" size={32} color="#fff" />
                )}
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="tasks"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="checklist" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <CustomModal
        isVisible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        title="Profile"
      >
        <ProfileContent onClose={() => setProfileModalVisible(false)} />
      </CustomModal>

      <CustomModal
        isVisible={addTaskModalVisible}
        onClose={() => setAddTaskModalVisible(false)}
        title="Add Task"
      >
        <AddTaskContent onClose={() => setAddTaskModalVisible(false)} />
      </CustomModal>

      {/* Backdrop for dropdown */}
      {householdDropdownVisible && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={() => setHouseholdDropdownVisible(false)}
          activeOpacity={1}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    zIndex: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subGreeting: {
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    backgroundColor: "#000",
    width: 72,
    height: 72,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
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
  householdInfo: {
    flexDirection: "column",
    justifyContent: "center",
  },
  householdButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  dropdown: {
    position: "absolute",
    top: 160,
    backgroundColor: "#fff",
    padding: 8,
    paddingBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 5,
    maxHeight: 300,
    width: "100%",
  },
  dropdownHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedDropdownItem: {
    backgroundColor: "#f0f8ff",
  },
  dropdownItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownItemText: {
    marginLeft: 12,
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownItemSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  createHouseholdButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  createHouseholdText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#4c669f",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1,
  },
});
