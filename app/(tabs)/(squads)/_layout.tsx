import React from "react";
import { Stack } from "expo-router";
import SquadsHome from "./index";

export default function SquadsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Squads",
          headerShown: false,
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Squad Details",
          headerShown: false,
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
