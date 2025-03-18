import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

import { ActivityIndicator, View } from "react-native";

// Stores
import { useSessionStore } from "@/stores/sessionStore";
import { useUserStore } from "@/stores/userStore";
import { useHouseholdStore } from "@/stores/householdStore";

export default function RootLayout() {
  const { session, loading, fetchSession, setSession } = useSessionStore();
  const { userProfile, getUserProfile } = useUserStore();
  const { fetchUserHouseholds } = useHouseholdStore();

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      getUserProfile(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    if (userProfile) {
      fetchUserHouseholds(userProfile.user_id);
    }
  }, [userProfile]);

  if (loading) {
    return (
      <SafeAreaProvider>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#4c669f" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
          redirect={!!session}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
          redirect={!session}
        />
        <Stack.Screen
          name="create-household"
          options={{ headerShown: false }}
          redirect={!session}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
