import {
  Camera,
  PermissionStatus as CameraPermissionStatus,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { Alert, Linking, Platform } from "react-native";

/**
 * Prompts the user to open app settings.
 */
const openAppSettings = () => {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:");
  } else {
    Linking.openSettings();
  }
};

/**
 * Requests camera permission.
 * If permission is denied and can be requested again, it will prompt the user.
 * If permission is permanently denied, it will show an alert to open settings.
 * @returns {Promise<boolean>} True if permission is granted, false otherwise.
 */
export const getCameraPermissionAsync = async (): Promise<boolean> => {
  let { status } = await Camera.getCameraPermissionsAsync();

  if (status === CameraPermissionStatus.GRANTED) {
    return true;
  }

  if (
    status === CameraPermissionStatus.UNDETERMINED ||
    (Platform.OS === "ios" && status === CameraPermissionStatus.DENIED)
  ) {
    const { status: newStatus } = await Camera.requestCameraPermissionsAsync();
    if (newStatus === CameraPermissionStatus.GRANTED) {
      return true;
    }
    status = newStatus;
  }

  if (status === CameraPermissionStatus.DENIED) {
    Alert.alert(
      "Permiso de Cámara Denegado",
      "WhatTheFace necesita acceso a tu cámara para funcionar. Por favor, habilita el permiso en los ajustes de la app.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Abrir Ajustes", onPress: openAppSettings },
      ]
    );
    return false;
  }

  return false;
};

/**
 * Requests media library permission (for reading and writing).
 * If permission is denied and can be requested again, it will prompt the user.
 * If permission is permanently denied, it will show an alert to open settings.
 * @returns {Promise<boolean>} True if permission is granted, false otherwise.
 */
export const getMediaLibraryPermissionAsync = async (): Promise<boolean> => {
  let { status } = await MediaLibrary.getPermissionsAsync();

  if (status === MediaLibrary.PermissionStatus.GRANTED) {
    return true;
  }

  if (
    status === MediaLibrary.PermissionStatus.UNDETERMINED ||
    (Platform.OS === "ios" && status === MediaLibrary.PermissionStatus.DENIED)
  ) {
    const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
    if (newStatus === MediaLibrary.PermissionStatus.GRANTED) {
      return true;
    }
    status = newStatus;
  }

  if (status === MediaLibrary.PermissionStatus.DENIED) {
    Alert.alert(
      "Permiso de Galería Denegado",
      "WhatTheFace necesita acceso a tu galería para seleccionar y guardar fotos. Por favor, habilita el permiso en los ajustes de la app.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Abrir Ajustes", onPress: openAppSettings },
      ]
    );
    return false;
  }

  return false;
};
