import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIVACY_POLICY_KEY = "hasAcceptedPrivacyPolicy";

// Contenido de PRIVACY_POLICY.md simplificado para prueba
const privacyPolicyText =
  "Política de Privacidad de WhatTheFace (Borrador para MVP)\n\nEsta es una política de privacidad de prueba.\nPor favor, acepta para continuar.";

export default function PrivacyScreen() {
  const router = useRouter();

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem(PRIVACY_POLICY_KEY, "true");
      router.replace("/(tabs)");
    } catch (e) {
      console.error("Error al guardar aceptación de política:", e);
      Alert.alert(
        "Error",
        "No se pudo guardar tu aceptación. Inténtalo de nuevo."
      );
    }
  };

  return (
    <ThemedView style={styles.outerContainer}>
      <View style={styles.headerContainer}>
        <ThemedText type="title">Política de Privacidad</ThemedText>
      </View>
      <ScrollView style={styles.scrollViewContainer}>
        <Text style={styles.policyText}>{privacyPolicyText}</Text>
      </ScrollView>
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptButtonText}>Aceptar y Continuar</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  scrollViewContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  policyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    paddingBottom: 20,
  },
  footerContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  acceptButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
