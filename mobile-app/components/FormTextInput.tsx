import React from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { HelperText, TextInput, type TextInputProps } from "react-native-paper";

interface FormTextInputProps<TFormValues extends FieldValues> extends Omit<TextInputProps, "value" | "onChangeText"> {
  control: Control<TFormValues>;
  name: Path<TFormValues>;
}

export function FormTextInput<TFormValues extends FieldValues>({
  control,
  name,
  ...textInputProps
}: FormTextInputProps<TFormValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <>
          <TextInput
            mode="outlined"
            value={typeof value === "string" ? value : value ? String(value) : ""}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!error}
            {...textInputProps}
          />
          <HelperText type="error" visible={!!error}>
            {error?.message}
          </HelperText>
        </>
      )}
    />
  );
}
