import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { AuthStackParamList } from "./types";
import { LoginScreen } from "../screens/Auth/LoginScreen";
import { SignupScreen } from "../screens/Auth/SignupScreen";
import { OtpVerificationScreen } from "../screens/Auth/OtpVerificationScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen
        name="OtpVerification"
        component={OtpVerificationScreen}
        options={{ headerShown: true, title: "Verify OTP" }}
      />
    </Stack.Navigator>
  );
}
