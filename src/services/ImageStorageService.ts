import { getMediaLibraryPermissionAsync } from "@/app/utils/_permissions"; // Esta ruta debería estar bien si @ apunta a la raíz
import * as MediaLibrary from "expo-media-library";
// import * as ImageManipulator from 'expo-image-manipulator'; // Se necesitaría para la marca de agua

interface SaveImageResult {
  success: boolean;
  error?: string;
  assetId?: string; // ID del asset guardado, si tiene éxito
}

/**
 * Guarda una imagen (dada su URI local) en la galería del dispositivo.
 * Primero solicita permisos de la mediateca si aún no se han concedido.
 *
 * @param imageUri La URI local de la imagen a guardar.
 * @returns {Promise<SaveImageResult>} Un objeto indicando éxito o fallo.
 */
export const saveImageToGallery = async (
  imageUri: string
): Promise<SaveImageResult> => {
  const hasPermission = await getMediaLibraryPermissionAsync();

  if (!hasPermission) {
    // getMediaLibraryPermissionAsync ya muestra una alerta si el permiso es denegado permanentemente.
    // Si fue denegado solo en el prompt actual, el usuario puede reintentar la acción que disparó el guardado.
    return {
      success: false,
      error: "Permiso de acceso a la galería denegado.",
    };
  }

  let uriToSave = imageUri;

  // --- INICIO LÓGICA DE MARCA DE AGUA (FUTURA IMPLEMENTACIÓN) ---
  // ... (comentarios como estaban)
  // --- FIN LÓGICA DE MARCA DE AGUA ---

  try {
    const asset = await MediaLibrary.createAssetAsync(uriToSave);
    console.log("Imagen guardada en la galería, Asset ID:", asset.id);
    return { success: true, assetId: asset.id };
  } catch (error: any) {
    console.error("Error al guardar la imagen en la galería: ", error);
    return {
      success: false,
      error:
        error.message || "Ocurrió un error desconocido al guardar la imagen.",
    };
  }
};
