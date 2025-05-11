import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

const PRIVACY_POLICY_KEY = "hasAcceptedPrivacyPolicy";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loadedFonts] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const router = useRouter();
  const segments = useSegments();
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState<boolean | null>(
    null
  );
  const [checkingPolicy, setCheckingPolicy] = useState(true);

  useEffect(() => {
    const checkPolicyStatus = async () => {
      try {
        const policyAccepted = await AsyncStorage.getItem(PRIVACY_POLICY_KEY);
        setHasAcceptedPolicy(policyAccepted === "true");
      } catch (e) {
        console.error("Error al leer estado de política de privacidad:", e);
        setHasAcceptedPolicy(false);
      } finally {
        setCheckingPolicy(false);
      }
    };
    checkPolicyStatus();
  }, []);

  useEffect(() => {
    if (checkingPolicy || !loadedFonts) {
      return;
    }

    const currentRoute = segments.join("/");

    if (currentRoute === "privacy") {
      return;
    }

    if (!hasAcceptedPolicy) {
      router.replace("/privacy");
    }
  }, [checkingPolicy, hasAcceptedPolicy, segments, router, loadedFonts]);

  if (checkingPolicy || !loadedFonts) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
