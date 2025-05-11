import type {
  CameraCapturedPicture,
  CameraType as ExpoCameraType,
} from "expo-camera";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Face as DetectedFaceType,
  detectFacesInImage,
  getValidatedMainFace,
} from "@/app/services/FaceDetectionService";
import { getMediaLibraryPermissionAsync } from "@/app/utils/_permissions";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

const MAX_IMAGE_DIMENSION = 1080;

export default function ExploreScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermissionGranted, setMediaLibraryPermissionGranted] =
    useState<boolean | null>(null);

  const [facing, setFacing] = useState<ExpoCameraType>("front");
  const [enableTorch, setEnableTorch] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDetectingFace, setIsDetectingFace] = useState(false);
  const [faceDetectionError, setFaceDetectionError] = useState<string | null>(
    null
  );
  const [mainDetectedFace, setMainDetectedFace] =
    useState<DetectedFaceType | null>(null);

  const resetDetectionState = () => {
    setCapturedImage(null);
    setIsProcessingImage(false);
    setIsDetectingFace(false);
    setFaceDetectionError(null);
    setMainDetectedFace(null);
  };

  const handleRetryCameraPermission = () => {
    requestPermission();
  };

  const toggleCameraFacing = () => {
    setFacing((current: ExpoCameraType) =>
      current === "back" ? "front" : "back"
    );
  };

  const toggleTorch = () => {
    setEnableTorch((current) => !current);
  };

  const processAndDetectFace = async (imageUri: string) => {
    setFaceDetectionError(null);
    setMainDetectedFace(null);
    setCapturedImage(imageUri);

    const processedUri = await processImage(imageUri);
    if (!processedUri) {
      resetDetectionState();
      return;
    }
    setCapturedImage(processedUri);

    setIsDetectingFace(true);
    const detectedFaces = await detectFacesInImage(processedUri);
    if (detectedFaces === null) {
      setFaceDetectionError(
        "Error al intentar detectar rostros. Inténtalo de nuevo."
      );
    } else {
      const validationResult = getValidatedMainFace(detectedFaces);
      if (validationResult.error) {
        setFaceDetectionError(validationResult.error);
      } else if (validationResult.face) {
        setMainDetectedFace(validationResult.face);
        Alert.alert("Éxito", "Rostro detectado y validado!");
      } else {
        setFaceDetectionError("No se pudo validar un rostro principal.");
      }
    }
    setIsDetectingFace(false);
  };

  const processImage = async (uri: string): Promise<string | null> => {
    setIsProcessingImage(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: { width: MAX_IMAGE_DIMENSION, height: MAX_IMAGE_DIMENSION },
          },
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );
      setIsProcessingImage(false);
      return result.uri;
    } catch (error) {
      console.error("Error processing image: ", error);
      Alert.alert("Error", "Error al procesar la imagen.");
      setIsProcessingImage(false);
      return null;
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo: CameraCapturedPicture | undefined =
          await cameraRef.current.takePictureAsync({
            quality: 1,
          });
        if (photo && photo.uri) {
          await processAndDetectFace(photo.uri);
        }
      } catch (error) {
        console.error("Error taking picture: ", error);
        Alert.alert("Error", "Error al tomar la foto. Inténtalo de nuevo.");
        resetDetectionState();
      }
    }
  };

  const pickImage = async () => {
    let mediaStatus = mediaLibraryPermissionGranted;
    if (mediaStatus === null) {
      mediaStatus = await getMediaLibraryPermissionAsync();
      setMediaLibraryPermissionGranted(mediaStatus);
    }

    if (!mediaStatus) {
      if (mediaLibraryPermissionGranted === false) {
        Alert.alert(
          "Permiso Necesario",
          "Se necesita acceso a la galería para seleccionar imágenes. Puedes habilitarlo en los ajustes o reintentar."
        );
      }
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (
        !result.canceled &&
        result.assets &&
        result.assets.length > 0 &&
        result.assets[0].uri
      ) {
        await processAndDetectFace(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert(
        "Error",
        "Error al seleccionar la imagen. Inténtalo de nuevo."
      );
      resetDetectionState();
    }
  };

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Cargando permisos de cámara...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.permissionText}>
          Se necesita permiso de cámara para usar esta funcionalidad.
        </ThemedText>
        <TouchableOpacity
          onPress={handleRetryCameraPermission}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Conceder Permiso de Cámara</Text>
        </TouchableOpacity>
        <ThemedText style={styles.infoText}>
          Si lo denegaste, por favor habilítalo desde los ajustes de la app.
        </ThemedText>
      </ThemedView>
    );
  }

  if (isProcessingImage) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Procesando imagen...</ThemedText>
      </ThemedView>
    );
  }

  if (isDetectingFace) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Detectando rostro...</ThemedText>
      </ThemedView>
    );
  }

  if (capturedImage) {
    return (
      <ThemedView style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        {faceDetectionError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{faceDetectionError}</Text>
          </View>
        )}
        {mainDetectedFace && !faceDetectionError && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>¡Rostro detectado!</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={resetDetectionState}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Tomar/Seleccionar Otra</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={enableTorch}
        ref={cameraRef}
      />
      <View style={styles.controlsContainerTop}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleTorch}>
          <IconSymbol
            name={enableTorch ? "bolt.fill" : "bolt.slash.fill"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.controlsContainerBottom}>
        <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
          <IconSymbol
            name="photo.on.rectangle.angled"
            size={32}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.captureButtonOuter}
          onPress={takePicture}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleCameraFacing}
        >
          <IconSymbol
            name="arrow.triangle.2.circlepath.camera.fill"
            size={32}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  infoText: {
    marginTop: 15,
    textAlign: "center",
    color: "gray",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  controlsContainerTop: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 20,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  controlsContainerBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 40 : 30,
    paddingTop: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1,
  },
  controlButton: {
    padding: 10,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 9 / 16,
    resizeMode: "contain",
    marginBottom: 20,
    borderRadius: 8,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  actionButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#FFD2D2",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: "90%",
    alignItems: "center",
  },
  errorText: {
    color: "#D8000C",
    fontSize: 16,
    textAlign: "center",
  },
  successContainer: {
    backgroundColor: "#D4EDDA",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: "90%",
    alignItems: "center",
  },
  successText: {
    color: "#155724",
    fontSize: 16,
    textAlign: "center",
  },
});
