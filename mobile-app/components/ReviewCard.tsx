import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Text, useTheme } from "react-native-paper";

import type { Review } from "../types";
import { formatRelativeTime } from "../utils/formatters";
import { spacing } from "../constants/theme";
import { RatingStars } from "./RatingStars";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.outlineVariant }]}>
      <View style={styles.header}>
        {review.userAvatarUrl ? (
          <Avatar.Image size={36} source={{ uri: review.userAvatarUrl }} />
        ) : (
          <Avatar.Text size={36} label={review.userName.slice(0, 2).toUpperCase()} />
        )}
        <View style={styles.headerText}>
          <Text variant="titleSmall">{review.userName}</Text>
          <Text variant="labelSmall" style={styles.date}>
            {formatRelativeTime(review.createdAt)}
          </Text>
        </View>
        <RatingStars rating={review.rating} showValue={false} size={13} />
      </View>
      <Text variant="bodyMedium" style={styles.comment}>
        {review.comment}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerText: { flex: 1 },
  date: { opacity: 0.5 },
  comment: { marginTop: spacing.xs },
});
