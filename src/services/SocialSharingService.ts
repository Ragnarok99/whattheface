import * as Sharing from "expo-sharing";
import { Alert } from "react-native"; // Añadido Platform por si se necesita

interface ShareOptions {
  dialogTitle?: string;
  mimeType?: string;
  uti?: string;
}

interface ShareResult {
  success: boolean;
  error?: string;
  action?: string;
}

export const shareImageAsync = async (
  imageUri: string,
  options?: ShareOptions
): Promise<ShareResult> => {
  const isSharingAvailable = await Sharing.isAvailableAsync();
  if (!isSharingAvailable) {
    Alert.alert(
      "Compartir no disponible",
      "La funcionalidad de compartir no está disponible en este dispositivo o plataforma."
    );
    return {
      success: false,
      error: "Compartir no disponible en el dispositivo.",
    };
  }

  try {
    await Sharing.shareAsync(imageUri, {
      dialogTitle:
        options?.dialogTitle || "Compartir esta creación de WhatTheFace",
      mimeType: options?.mimeType || "image/jpeg",
      UTI: options?.uti,
    });
    return { success: true, action: "sharedAction" };
  } catch (error: any) {
    console.error("Error al compartir la imagen: ", error);
    Alert.alert("Error al Compartir", "No se pudo compartir la imagen.");
    return {
      success: false,
      error: error.message || "Ocurrió un error desconocido al compartir.",
    };
  }
};
