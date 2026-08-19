import React from "react";
import { EmptyState } from "./EmptyState";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      icon="alert-circle-outline"
      title="Something went wrong"
      description={message ?? "Please check your connection and try again."}
      actionLabel={onRetry ? "Retry" : undefined}
      onAction={onRetry}
    />
  );
}
