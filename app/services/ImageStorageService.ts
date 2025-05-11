import { getMediaLibraryPermissionAsync } from "@/app/utils/_permissions"; // Asegúrate que la ruta es correcta
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
  // const applyWatermark = async (originalUri: string): Promise<string> => {
  //   try {
  //     // Cargar la imagen de la marca de agua (debe estar en tus assets)
  //     // const watermarkImage = Asset.fromModule(require('../assets/images/watermark.png'));
  //     // await watermarkImage.downloadAsync(); // Asegurarse de que esté disponible
  //     // const watermarkUri = watermarkImage.localUri || watermarkImage.uri;
  //
  //     // const result = await ImageManipulator.manipulateAsync(
  //     //   originalUri,
  //     //   [
  //     //     {
  //     //       overlay: {
  //     //         uri: watermarkUri,
  //     //         // Ajustar posición y tamaño de la marca de agua:
  //     //         // x: 0.05, y: 0.9, width: 0.2, height: 0.05 (ej. 5% desde abajo izq, 20% ancho, 5% alto)
  //     //         // O usar manipulación de pixeles si se requiere más control y la API lo permite.
  //     //       }
  //     //     }
  //     //   ],
  //     //   { compress: 1, format: ImageManipulator.SaveFormat.PNG } // Guardar con marca de agua en PNG para transparencia
  //     // );
  //     // return result.uri;
  //     return originalUri; // Placeholder hasta implementar
  //   } catch (e) {
  //     console.error("Error al aplicar marca de agua:", e);
  //     return originalUri; // Devolver original si la marca de agua falla
  //   }
  // };
  //
  // // Si la funcionalidad de remover marca de agua no está activa (ej. usuario no premium)
  // const shouldApplyWatermark = true; // Esto vendría de una lógica de monetización
  // if (shouldApplyWatermark) {
  //   uriToSave = await applyWatermark(imageUri);
  // }
  // --- FIN LÓGICA DE MARCA DE AGUA ---

  try {
    const asset = await MediaLibrary.createAssetAsync(uriToSave);
    // Opcionalmente, podríamos querer mover el asset a un álbum específico:
    // const album = await MediaLibrary.getAlbumAsync('WhatTheFace');
    // if (album == null) {
    //   await MediaLibrary.createAlbumAsync('WhatTheFace', asset, false);
    // } else {
    //   await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    // }
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
