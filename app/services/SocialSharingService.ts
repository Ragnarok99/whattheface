import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

interface ShareOptions {
  dialogTitle?: string; // Título del diálogo de compartir (principalmente Android)
  mimeType?: string; // Por ejemplo, 'image/jpeg' o 'image/png'
  uti?: string; // UTI para iOS, si se necesita más especificidad
}

interface ShareResult {
  success: boolean;
  error?: string;
  action?: string; // Resultado de la acción de compartir (ej. 'sharedAction', 'dismissedAction')
}

/**
 * Comparte una imagen (dada su URI local) usando el diálogo nativo del sistema.
 *
 * @param imageUri La URI local de la imagen a compartir.
 * @param options Opciones de compartición (título del diálogo, mimeType, etc.).
 * @returns {Promise<ShareResult>} Un objeto indicando éxito o fallo, y la acción resultante.
 */
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
    // Para expo-sharing, las opciones van directamente en el método shareAsync.
    // No hay un 'action' devuelto directamente por expo-sharing, así que lo simularemos o lo dejaremos fuera.
    await Sharing.shareAsync(imageUri, {
      dialogTitle:
        options?.dialogTitle || "Compartir esta creación de WhatTheFace",
      mimeType: options?.mimeType || "image/jpeg", // Asumir JPEG si no se especifica
      UTI: options?.uti,
    });
    // expo-sharing no devuelve un resultado directo de la acción del usuario (si compartió o canceló)
    // en todas las plataformas de forma consistente. Se considera éxito si el diálogo se muestra sin error.
    return { success: true, action: "sharedAction" }; // Asumir que se compartió si no hay error.
  } catch (error: any) {
    console.error("Error al compartir la imagen: ", error);
    Alert.alert("Error al Compartir", "No se pudo compartir la imagen.");
    return {
      success: false,
      error: error.message || "Ocurrió un error desconocido al compartir.",
    };
  }
};
