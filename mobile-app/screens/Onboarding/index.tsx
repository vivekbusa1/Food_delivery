import React, { useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, View, type ViewToken } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing } from "../../constants/theme";
import { useOnboardingStore } from "../../store/useOnboardingStore";

const { width } = Dimensions.get("window");

const slides = [
  {
    icon: "silverware-fork-knife" as const,
    title: "Discover great food",
    description: "Browse thousands of restaurants and cuisines curated just for you.",
  },
  {
    icon: "moped-outline" as const,
    title: "Fast delivery",
    description: "Track your order live from the kitchen to your doorstep in real time.",
  },
  {
    icon: "tag-heart-outline" as const,
    title: "Exclusive offers",
    description: "Unlock deals, coupons, and rewards on every order you place.",
  },
];

export function OnboardingScreen() {
  const theme = useTheme();
  const { completeOnboarding } = useOnboardingStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index !== null && viewableItems[0]?.index !== undefined) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const isLastSlide = activeIndex === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      completeOnboarding();
    } else {
      listRef.current?.scrollToIndex({ index: activeIndex + 1 });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.skipRow}>
        <Button onPress={completeOnboarding}>Skip</Button>
      </View>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconWrapper, { backgroundColor: `${theme.colors.primary}1A` }]}>
              <MaterialCommunityIcons name={item.icon} size={96} color={theme.colors.primary} />
            </View>
            <Text variant="headlineSmall" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              {item.description}
            </Text>
          </View>
        )}
      />
      <View style={styles.dotsRow}>
        {slides.map((slide, index) => (
          <View
            key={slide.title}
            style={[
              styles.dot,
              {
                backgroundColor: index === activeIndex ? theme.colors.primary : theme.colors.surfaceVariant,
                width: index === activeIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.footer}>
        <Button mode="contained" onPress={handleNext} contentStyle={styles.buttonContent}>
          {isLastSlide ? "Get Started" : "Next"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipRow: { alignItems: "flex-end", paddingHorizontal: spacing.md },
  slide: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  iconWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  title: { fontWeight: "700", textAlign: "center", marginBottom: spacing.sm },
  description: { textAlign: "center" },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginVertical: spacing.lg },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  buttonContent: { height: 50 },
});
