import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { Avatar, Button, IconButton, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { FormTextInput } from "../../components/FormTextInput";
import { editProfileSchema, type EditProfileFormValues } from "../../utils/validation";
import { useAuth } from "../../store/AuthContext";
import { useUpdateProfile, useUploadAvatar } from "../../hooks/useProfile";
import { spacing } from "../../constants/theme";

export function EditProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setLocalAvatar(result.assets[0].uri);
      uploadAvatar.mutate(result.assets[0].uri);
    }
  };

  const onSubmit = (values: EditProfileFormValues) => {
    updateProfile.mutate(values, { onSuccess: () => navigation.goBack() });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrapper}>
          {localAvatar || user?.avatarUrl ? (
            <Avatar.Image size={96} source={{ uri: localAvatar ?? user?.avatarUrl ?? undefined }} />
          ) : (
            <Avatar.Text size={96} label={(user?.name ?? "U").slice(0, 2).toUpperCase()} />
          )}
          <IconButton
            icon="camera"
            mode="contained"
            size={18}
            style={styles.cameraButton}
            onPress={handlePickImage}
            loading={uploadAvatar.isPending}
          />
        </View>

        <FormTextInput control={control} name="name" label="Full Name" autoCapitalize="words" />
        <FormTextInput control={control} name="email" label="Email" keyboardType="email-address" autoCapitalize="none" />
        <FormTextInput control={control} name="phone" label="Phone Number" keyboardType="phone-pad" />

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={updateProfile.isPending}
          disabled={updateProfile.isPending}
          contentStyle={styles.submitContent}
        >
          Save Changes
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  avatarWrapper: { alignSelf: "center", marginBottom: spacing.xl },
  cameraButton: { position: "absolute", bottom: -4, right: -4 },
  submitContent: { height: 50 },
});
