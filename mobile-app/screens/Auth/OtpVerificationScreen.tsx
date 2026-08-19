import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { AuthStackParamList } from "../../navigation/types";
import { FormTextInput } from "../../components/FormTextInput";
import { otpSchema, type OtpFormValues } from "../../utils/validation";
import { useAuth } from "../../store/AuthContext";
import { getErrorMessage } from "../../services/api";
import { spacing } from "../../constants/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "OtpVerification">;

export function OtpVerificationScreen({ route }: Props) {
  const { email, purpose } = route.params;
  const theme = useTheme();
  const { verifyOtp, requestOtp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { control, handleSubmit } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const onSubmit = async (values: OtpFormValues) => {
    setIsSubmitting(true);
    try {
      await verifyOtp({ email, otp: values.otp, purpose });
    } catch (error) {
      Toast.show({ type: "error", text1: "Verification failed", text2: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    setIsResending(true);
    try {
      await requestOtp(email, purpose);
      Toast.show({ type: "success", text1: "OTP resent" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Could not resend OTP", text2: getErrorMessage(error) });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Verify your email
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          We sent a 6-digit code to {email}
        </Text>

        <FormTextInput
          control={control}
          name="otp"
          label="6-digit code"
          keyboardType="number-pad"
          maxLength={6}
        />

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          contentStyle={styles.buttonContent}
        >
          Verify
        </Button>

        <Button mode="text" onPress={onResend} loading={isResending} disabled={isResending} style={styles.resend}>
          Resend Code
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.xl, flexGrow: 1, justifyContent: "center" },
  title: { textAlign: "center", fontWeight: "700" },
  subtitle: { textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.lg },
  buttonContent: { height: 50 },
  resend: { marginTop: spacing.md },
});
