import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function AuthLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen
          name="signup"
          options={{
            title: "Create Account",
            headerShown: false,
            headerTitleStyle: {
              fontWeight: "600",
            },
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="signin"
          options={{
            title: "Sign In",
            headerShown: false,
            headerTitleStyle: {
              fontWeight: "600",
            },
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="forgotpassword"
          options={{
            title: "Forgot Password",
            headerShown: false,
            headerTitleStyle: {
              fontWeight: "600",
            },
            headerTitleAlign: "center",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
