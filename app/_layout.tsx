import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { ActivityIndicator, View } from "react-native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Hide splash screen after auth is checked
    SplashScreen.hideAsync();

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show a loading indicator while checking the session
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {session && session.user ? (
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack>
    </SafeAreaProvider>
  );
}
