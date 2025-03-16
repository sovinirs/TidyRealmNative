import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setIsLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
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
