import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import {
  createHousehold,
  getUserHouseholds,
  saveCurrentHouseholdId,
} from "@/services/householdService";
import {
  searchCities,
  getPopularCities,
  City,
} from "@/services/locationService";
import { Ionicons } from "@expo/vector-icons";

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

export default function CreateHouseholdScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = (params.mode as string) || "create"; // "create" or "switch"

  const [householdName, setHouseholdName] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<City | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [households, setHouseholds] = useState<Household[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(mode === "create");

  // Load popular cities initially
  useEffect(() => {
    setCities(getPopularCities());
    fetchUserHouseholds();
  }, []);

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

      if (householdsData) {
        setHouseholds(householdsData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Unexpected error fetching households:", error);
      setLoading(false);
    }
  };

  const handleCreateHousehold = async () => {
    // Reset error state
    setError("");

    // Basic validation
    if (!householdName.trim()) {
      setError("Household name is required");
      return;
    }

    if (!selectedLocation) {
      setError("Please select a location");
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

      // Create household
      const { data, error } = await createHousehold({
        household_name: householdName.trim(),
        location: `${selectedLocation.name}, ${
          selectedLocation.state ? selectedLocation.state + ", " : ""
        }${selectedLocation.country}`,
        created_by: user.id,
      });

      if (error) {
        console.error("Error creating household:", error);

        // Handle specific error codes
        if (typeof error === "object" && error !== null) {
          if ("message" in error && typeof error.message === "string") {
            setError(error.message);

            // Check if user profile exists
            const { data: profile, error: profileError } = await supabase
              .from("user_profiles")
              .select("user_id")
              .eq("user_id", user.id)
              .single();

            if (profileError || !profile) {
              // Create user profile if it doesn't exist
              const { error: insertError } = await supabase
                .from("user_profiles")
                .insert([
                  {
                    user_id: user.id,
                    full_name:
                      user.user_metadata?.full_name ||
                      user.email?.split("@")[0] ||
                      "",
                    user_email: user.email,
                  },
                ]);

              if (insertError) {
                console.error("Error creating user profile:", insertError);
                setError(
                  "Failed to create user profile. Please try signing out and back in."
                );
              } else {
                setError(
                  "User profile created. Please try creating the household again."
                );
              }
            }
          } else if ("message" in error) {
            setError(String(error.message));
          } else {
            setError("Failed to create household");
          }
        } else {
          setError("Failed to create household");
        }
        return;
      }

      // On success, navigate to the main app
      Alert.alert("Success", "Household created successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectCity = (city: City) => {
    setSelectedLocation(city);
    setLocationQuery(
      `${city.name}, ${city.state ? city.state + ", " : ""}${city.country}`
    );
  };

  const switchToHousehold = async (household: Household) => {
    try {
      // Save the selected household ID
      await saveCurrentHouseholdId(household.id);

      // Navigate back to tabs with the selected household
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error switching household:", error);
      Alert.alert("Error", "Failed to switch household. Please try again.");
    }
  };

  const renderHouseholdItem = ({ item }: { item: Household }) => (
    <TouchableOpacity
      style={styles.householdCard}
      onPress={() => switchToHousehold(item)}
    >
      <View style={styles.householdIcon}>
        <Ionicons name="home" size={24} color="#4c669f" />
      </View>
      <View style={styles.householdInfo}>
        <Text style={styles.householdName}>{item.household_name}</Text>
        <Text style={styles.householdLocation}>{item.location}</Text>
        <Text style={styles.householdDate}>
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading && mode === "switch") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4c669f" />
        <Text style={styles.loadingText}>Loading your households...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#4c669f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {showCreateForm ? "Create a Household" : "Your Households"}
          </Text>
          {households.length > 0 && (
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setShowCreateForm(!showCreateForm)}
            >
              <Text style={styles.switchButtonText}>
                {showCreateForm ? "Switch" : "Create"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showCreateForm ? (
          // Create Household Form
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create a Household</Text>
            <Text style={styles.subtitle}>
              Create a new household to get started with TidyRealm
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Household Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter household name"
                value={householdName}
                onChangeText={setHouseholdName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Search for a city"
                value={locationQuery}
                onChangeText={(text) => {
                  setLocationQuery(text);
                  setSelectedLocation(null);
                }}
                autoCapitalize="words"
              />
            </View>

            {searchLoading ? (
              <ActivityIndicator style={styles.searchLoading} />
            ) : (
              <View style={styles.citiesContainer}>
                <FlatList
                  data={cities}
                  keyExtractor={(item) => item.id}
                  style={styles.citiesList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.cityItem,
                        selectedLocation?.id === item.id &&
                          styles.selectedCityItem,
                      ]}
                      onPress={() => selectCity(item)}
                    >
                      <Text style={styles.cityName}>{item.name}</Text>
                      <Text style={styles.cityCountry}>
                        {item.state ? `${item.state}, ` : ""}
                        {item.country}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.noResults}>No cities found</Text>
                  }
                />
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                (!householdName.trim() || !selectedLocation) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleCreateHousehold}
              disabled={loading || !householdName.trim() || !selectedLocation}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Household</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Switch Household List
          <View style={styles.switchContainer}>
            <Text style={styles.title}>Your Households</Text>
            <Text style={styles.subtitle}>Select a household to switch to</Text>

            {households.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="home" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No households found</Text>
                <Text style={styles.emptySubText}>
                  Create your first household to get started
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.createButton]}
                  onPress={() => setShowCreateForm(true)}
                >
                  <Text style={styles.buttonText}>Create Household</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={households}
                renderItem={renderHouseholdItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.householdsList}
              />
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    padding: 8,
  },
  switchButton: {
    padding: 8,
  },
  switchButtonText: {
    color: "#4c669f",
    fontWeight: "600",
  },
  formContainer: {
    padding: 24,
    flex: 1,
  },
  switchContainer: {
    flex: 1,
    padding: 24,
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  errorText: {
    color: "#ff3b30",
    marginBottom: 16,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  citiesContainer: {
    height: 200,
    marginBottom: 20,
  },
  citiesList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    height: "100%",
  },
  cityItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedCityItem: {
    backgroundColor: "#e6f7ff",
  },
  cityName: {
    fontSize: 16,
    fontWeight: "500",
  },
  cityCountry: {
    fontSize: 14,
    color: "#666",
  },
  noResults: {
    padding: 12,
    textAlign: "center",
    color: "#666",
  },
  searchLoading: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#4c669f",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#9db1d9",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  createButton: {
    marginTop: 24,
    width: "80%",
  },
  householdsList: {
    paddingVertical: 12,
  },
  householdCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  householdIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  householdInfo: {
    flex: 1,
  },
  householdName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  householdLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  householdDate: {
    fontSize: 12,
    color: "#999",
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
});
