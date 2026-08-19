import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { FormTextInput } from "../../components/FormTextInput";
import { changePasswordSchema, type ChangePasswordFormValues } from "../../utils/validation";
import { useChangePassword } from "../../hooks/useProfile";
import { spacing } from "../../constants/theme";

export function ChangePasswordScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const changePassword = useChangePassword();

  const { control, handleSubmit, reset } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          reset();
          navigation.goBack();
        },
      },
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <FormTextInput control={control} name="currentPassword" label="Current Password" secureTextEntry />
        <FormTextInput control={control} name="newPassword" label="New Password" secureTextEntry />
        <FormTextInput control={control} name="confirmPassword" label="Confirm New Password" secureTextEntry />

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={changePassword.isPending}
          disabled={changePassword.isPending}
          contentStyle={styles.submitContent}
        >
          Update Password
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  submitContent: { height: 50 },
});
