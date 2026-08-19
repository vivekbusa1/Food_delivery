import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { List, RadioButton, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { ASYNC_STORAGE_KEYS, SUPPORTED_LANGUAGES } from "../../constants/config";
import { useUpdateLanguage } from "../../hooks/useProfile";

export function LanguageScreen() {
  const theme = useTheme();
  const updateLanguage = useUpdateLanguage();
  const [selected, setSelected] = useState("en");

  useEffect(() => {
    void AsyncStorage.getItem(ASYNC_STORAGE_KEYS.language).then((stored) => {
      if (stored) setSelected(stored);
    });
  }, []);

  const handleSelect = async (code: string) => {
    setSelected(code);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.language, code);
    updateLanguage.mutate(code, {
      onSuccess: () => Toast.show({ type: "success", text1: "Language updated" }),
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <RadioButton.Group onValueChange={handleSelect} value={selected}>
        {SUPPORTED_LANGUAGES.map((language) => (
          <List.Item
            key={language.code}
            title={language.label}
            onPress={() => handleSelect(language.code)}
            right={() => <RadioButton value={language.code} />}
          />
        ))}
      </RadioButton.Group>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
