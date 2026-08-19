import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, SegmentedButtons, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { AuthStackParamList } from "../../navigation/types";
import { FormTextInput } from "../../components/FormTextInput";
import { signupSchema, type SignupFormValues } from "../../utils/validation";
import { useAuth } from "../../store/AuthContext";
import { getErrorMessage } from "../../services/api";
import { spacing } from "../../constants/theme";
import type { UserRole } from "../../types";

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const theme = useTheme();
  const { signup } = useAuth();
  const [role, setRole] = useState<UserRole>("customer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      await signup({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role,
      });
    } catch (error) {
      Toast.show({ type: "error", text1: "Sign up failed", text2: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="headlineSmall" style={styles.title}>
            Create your account
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Join us and start ordering in minutes
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

          <FormTextInput control={control} name="name" label="Full Name" autoCapitalize="words" />
          <FormTextInput control={control} name="email" label="Email" keyboardType="email-address" autoCapitalize="none" />
          <FormTextInput control={control} name="phone" label="Phone Number" keyboardType="phone-pad" />
          <FormTextInput control={control} name="password" label="Password" secureTextEntry />
          <FormTextInput control={control} name="confirmPassword" label="Confirm Password" secureTextEntry />

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            contentStyle={styles.buttonContent}
          >
            Create Account
          </Button>

          <View style={styles.footerRow}>
            <Text variant="bodyMedium">Already have an account? </Text>
            <Button compact mode="text" onPress={() => navigation.navigate("Login")}>
              Log In
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
  title: { textAlign: "center", fontWeight: "700" },
  subtitle: { textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.lg },
  segmented: { marginBottom: spacing.lg },
  buttonContent: { height: 50 },
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: spacing.lg },
});
