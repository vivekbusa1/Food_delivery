import React from "react";
import { Searchbar } from "react-native-paper";

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onFilterPress?: () => void;
  autoFocus?: boolean;
  style?: React.ComponentProps<typeof Searchbar>["style"];
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search for restaurants or dishes",
  onSubmit,
  onFilterPress,
  autoFocus,
  style,
}: SearchBarProps) {
  return (
    <Searchbar
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
      autoFocus={autoFocus}
      icon="magnify"
      traileringIcon={onFilterPress ? "tune-variant" : undefined}
      onTraileringIconPress={onFilterPress}
      style={style}
    />
  );
}
