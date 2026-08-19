import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { IconButton, RadioButton, Text, useTheme } from "react-native-paper";

import type { Address } from "../types";
import { spacing } from "../constants/theme";

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  selectable?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const iconByLabel: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  home: "home-outline",
  work: "briefcase-outline",
  other: "map-marker-outline",
};

export function AddressCard({ address, selected, selectable, onPress, onEdit, onDelete }: AddressCardProps) {
  const theme = useTheme();
  const icon = iconByLabel[address.label.toLowerCase()] ?? "map-marker-outline";

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View
        style={[
          styles.container,
          {
            borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={22} color={theme.colors.primary} style={styles.icon} />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text variant="titleSmall">{address.label}</Text>
            {address.isDefault && (
              <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                {" "}
                · Default
              </Text>
            )}
          </View>
          <Text variant="bodySmall" style={styles.address} numberOfLines={2}>
            {address.addressLine1}
            {address.addressLine2 ? `, ${address.addressLine2}` : ""}, {address.city}, {address.state}{" "}
            {address.postalCode}
          </Text>
        </View>
        {selectable && <RadioButton value={address.id} status={selected ? "checked" : "unchecked"} onPress={onPress} />}
        {onEdit && <IconButton icon="pencil-outline" size={18} onPress={onEdit} />}
        {onDelete && <IconButton icon="trash-can-outline" size={18} onPress={onDelete} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  icon: { marginRight: spacing.sm, marginTop: 2 },
  content: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  address: { opacity: 0.7, marginTop: 2 },
});
