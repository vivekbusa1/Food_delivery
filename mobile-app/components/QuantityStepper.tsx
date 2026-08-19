import React from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  disabled?: boolean;
}

export function QuantityStepper({ quantity, onIncrement, onDecrement, min = 1, disabled }: QuantityStepperProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { borderColor: theme.colors.primary }]}>
      <IconButton
        icon="minus"
        size={16}
        onPress={onDecrement}
        disabled={disabled || quantity <= min}
        style={styles.button}
      />
      <Text variant="titleMedium" style={styles.value}>
        {quantity}
      </Text>
      <IconButton icon="plus" size={16} onPress={onIncrement} disabled={disabled} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    height: 40,
  },
  button: { margin: 0 },
  value: { minWidth: 24, textAlign: "center" },
});
