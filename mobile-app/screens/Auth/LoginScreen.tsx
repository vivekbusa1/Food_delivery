import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, SegmentedButtons, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { AuthStackParamList } from "../../navigation/types";
import { FormTextInput } from "../../components/FormTextInput";
import { loginSchema, type LoginFormValues } from "../../utils/validation";
import { useAuth } from "../../store/AuthContext";
import { getErrorMessage } from "../../services/api";
import { spacing } from "../../constants/theme";
import type { UserRole } from "../../types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>("customer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login({ ...values, role });
    } catch (error) {
      Toast.show({ type: "error", text1: "Login failed", text2: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.iconWrapper, { backgroundColor: `${theme.colors.primary}1A` }]}>
            <MaterialCommunityIcons name="food-drumstick" size={56} color={theme.colors.primary} />
          </View>
          <Text variant="headlineSmall" style={styles.title}>
            Welcome back
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Sign in to continue ordering delicious food
          </Text>

          <SegmentedButtons
            value={role}
            onValueChange={(value) => setRole(value as UserRole)}
            style={styles.segmented}
            buttons={[
              { value: "customer", label: "Customer", icon: "account-outline" },
              { value: "delivery_partner", label: "Delivery Partner", icon: "moped-outline" },
            ]}
          />

          <FormTextInput
            control={control}
            name="email"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormTextInput
            control={control}
            name="password"
            label="Password"
            secureTextEntry
          />

          <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting} contentStyle={styles.buttonContent}>
            Log In
          </Button>

          <View style={styles.footerRow}>
            <Text variant="bodyMedium">Don&apos;t have an account? </Text>
            <Button compact mode="text" onPress={() => navigation.navigate("Signup")}>
              Sign Up
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: spacing.xl, flexGrow: 1, justifyContent: "center" },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { textAlign: "center", fontWeight: "700" },
  subtitle: { textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.lg },
  segmented: { marginBottom: spacing.lg },
  buttonContent: { height: 50 },
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: spacing.lg },
});
