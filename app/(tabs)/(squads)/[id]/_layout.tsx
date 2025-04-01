import { Stack } from "expo-router";

export default function SquadLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Squad",
          headerShown: false,
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
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
