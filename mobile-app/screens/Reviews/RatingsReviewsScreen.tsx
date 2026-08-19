import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import { Button, IconButton, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { MainStackNavigationProp, MainStackParamList } from "../../navigation/types";
import { useCreateReview, useOrderReviews } from "../../hooks/useReviews";
import { spacing } from "../../constants/theme";

type Props = NativeStackScreenProps<MainStackParamList, "RatingsReviews">;

export function RatingsReviewsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<Props["route"]>();
  const { orderId, restaurantId } = route.params;

  const { data: existingReviews } = useOrderReviews(orderId);
  const createReview = useCreateReview();

  const existingReview = Array.isArray(existingReviews) ? existingReviews[0] : undefined;
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");

  const goToOrders = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "MainTabs", params: { screen: "OrdersTab" } }],
      }),
    );
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    createReview.mutate(
      { orderId, restaurantId, rating, comment },
      { onSuccess: goToOrders },
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={styles.title}>
            How was your order?
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Your feedback helps us and other customers.
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <IconButton
                key={value}
                icon={value <= rating ? "star" : "star-outline"}
                iconColor={theme.colors.primary}
                size={40}
                onPress={() => setRating(value)}
              />
            ))}
          </View>

          <TextInput
            mode="outlined"
            label="Share details about your experience"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={5}
            style={styles.commentInput}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={createReview.isPending}
            disabled={rating === 0 || createReview.isPending}
            contentStyle={styles.submitContent}
          >
            Submit Review
          </Button>
          <Button mode="text" onPress={goToOrders} style={styles.skip}>
            Back to Orders
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, flexGrow: 1, justifyContent: "center" },
  card: { padding: spacing.xl, borderRadius: 20 },
  title: { textAlign: "center", fontWeight: "700" },
  subtitle: { textAlign: "center", opacity: 0.6, marginTop: spacing.xs, marginBottom: spacing.lg },
  starsRow: { flexDirection: "row", justifyContent: "center", marginBottom: spacing.lg },
  commentInput: { marginBottom: spacing.lg },
  submitContent: { height: 50 },
  skip: { marginTop: spacing.sm },
});
