import type {
  CameraCapturedPicture,
  CameraType as ExpoCameraType,
} from "expo-camera";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Filter as AiFilter,
  getAvailableFilters,
  setTransformingStatusCallback,
  transformImage,
} from "@/app/services/AITransformationService";
import {
  Face as DetectedFaceType,
  detectFacesInImage,
  getValidatedMainFace,
} from "@/app/services/FaceDetectionService";
import { saveImageToGallery } from "@/app/services/ImageStorageService";
import { shareImageAsync } from "@/app/services/SocialSharingService";
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
  const [processedImageUri, setProcessedImageUri] = useState<string | null>(
    null
  );
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDetectingFace, setIsDetectingFace] = useState(false);
  const [faceDetectionError, setFaceDetectionError] = useState<string | null>(
    null
  );
  const [mainDetectedFace, setMainDetectedFace] =
    useState<DetectedFaceType | null>(null);

  const [availableFilters, setAvailableFilters] = useState<AiFilter[]>([]);
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);
  const [isTransformingImage, setIsTransformingImage] = useState(false);
  const [aiTransformationError, setAiTransformationError] = useState<
    string | null
  >(null);
  const [transformedFinalImageUri, setTransformedFinalImageUri] = useState<
    string | null
  >(null);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      const filters = await getAvailableFilters();
      setAvailableFilters(filters);
    };
    loadFilters();
    setTransformingStatusCallback(setIsTransformingImage);
  }, []);

  const resetAllStates = () => {
    setCapturedImage(null);
    setProcessedImageUri(null);
    setIsProcessingImage(false);
    setIsDetectingFace(false);
    setFaceDetectionError(null);
    setMainDetectedFace(null);
    setSelectedFilterId(null);
    setIsTransformingImage(false);
    setAiTransformationError(null);
    setTransformedFinalImageUri(null);
    setIsSavingImage(false);
    setIsSharingImage(false);
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

  const startImageWorkflow = async (imageUri: string) => {
    resetAllStates();
    setCapturedImage(imageUri);

    setIsProcessingImage(true);
    const localProcessedUri = await processImage(imageUri);
    setIsProcessingImage(false);

    if (!localProcessedUri) {
      Alert.alert("Error", "No se pudo procesar la imagen.");
      resetAllStates();
      return;
    }
    setProcessedImageUri(localProcessedUri);

    setIsDetectingFace(true);
    const detectedFaces = await detectFacesInImage(localProcessedUri);
    setIsDetectingFace(false);

    if (detectedFaces === null) {
      setFaceDetectionError(
        "Error al detectar rostros. Intenta con otra foto."
      );
      return;
    }
    const validationResult = getValidatedMainFace(detectedFaces);
    if (validationResult.error || !validationResult.face) {
      setFaceDetectionError(
        validationResult.error || "No se pudo validar un rostro principal."
      );
      return;
    }
    setMainDetectedFace(validationResult.face);
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
          await startImageWorkflow(photo.uri);
        }
      } catch (error) {
        console.error("Error taking picture: ", error);
        Alert.alert("Error", "Error al tomar la foto. Inténtalo de nuevo.");
        resetAllStates();
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
        await startImageWorkflow(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert(
        "Error",
        "Error al seleccionar la imagen. Inténtalo de nuevo."
      );
      resetAllStates();
    }
  };

  const handleApplyFilter = async (filterId: string) => {
    if (!processedImageUri || !mainDetectedFace) {
      Alert.alert(
        "Error",
        "No hay imagen procesada o rostro detectado para aplicar el filtro."
      );
      return;
    }
    setSelectedFilterId(filterId);
    setAiTransformationError(null);
    setTransformedFinalImageUri(null);

    const result = await transformImage(
      processedImageUri,
      mainDetectedFace,
      filterId
    );

    if (result.error) {
      setAiTransformationError(
        result.error + (result.errorType ? ` (Tipo: ${result.errorType})` : "")
      );
    } else if (result.transformedImageUri) {
      setTransformedFinalImageUri(result.transformedImageUri);
    }
  };

  const handleSaveImage = async () => {
    if (!transformedFinalImageUri) {
      Alert.alert("Error", "No hay imagen transformada para guardar.");
      return;
    }
    setIsSavingImage(true);
    const result = await saveImageToGallery(transformedFinalImageUri);
    setIsSavingImage(false);

    if (result.success) {
      Alert.alert("¡Guardada!", "Tu creación ha sido guardada en la galería.");
    } else {
      Alert.alert(
        "Error al Guardar",
        result.error || "Ocurrió un error desconocido al guardar."
      );
    }
  };

  const handleShareImage = async () => {
    if (!transformedFinalImageUri) {
      Alert.alert("Error", "No hay imagen transformada para compartir.");
      return;
    }
    setIsSharingImage(true);
    const result = await shareImageAsync(transformedFinalImageUri, {
      dialogTitle: "¡Comparte tu WhatTheFace!",
      mimeType: "image/jpeg",
    });
    setIsSharingImage(false);

    if (!result.success) {
      console.log("Error o cancelación al compartir: ", result.error);
    } else {
      console.log("Imagen compartida (o diálogo mostrado).");
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

  if (isTransformingImage) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Aplicando filtro mágico...</ThemedText>
      </ThemedView>
    );
  }

  if (isSavingImage) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Guardando imagen...</ThemedText>
      </ThemedView>
    );
  }

  if (isSharingImage) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Preparando para compartir...</ThemedText>
      </ThemedView>
    );
  }

  if (transformedFinalImageUri) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.titleText}>¡Tu Transformación!</Text>
        <Image
          source={{ uri: transformedFinalImageUri }}
          style={styles.previewImage}
        />
        {aiTransformationError && (
          <Text style={styles.errorText}>{aiTransformationError}</Text>
        )}
        <View style={styles.actionsRow}>
          {!aiTransformationError && (
            <TouchableOpacity
              onPress={handleSaveImage}
              style={[styles.buttonStyle, styles.halfButton]}
            >
              <IconSymbol
                name="arrow.down.circle.fill"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonTextStyle}>Guardar</Text>
            </TouchableOpacity>
          )}
          {!aiTransformationError && (
            <TouchableOpacity
              onPress={handleShareImage}
              style={[styles.buttonStyle, styles.halfButton]}
            >
              <IconSymbol
                name="square.and.arrow.up.fill"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonTextStyle}>Compartir</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={resetAllStates}
          style={[
            styles.buttonStyle,
            styles.buttonSecondary,
            styles.fullWidthButton,
          ]}
        >
          <Text style={[styles.buttonTextStyle, styles.buttonTextSecondary]}>
            Empezar de Nuevo
          </Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (processedImageUri && mainDetectedFace && !faceDetectionError) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.centeredScrollContainer}
      >
        <Text style={styles.titleText}>Imagen Lista</Text>
        <Image
          source={{ uri: processedImageUri }}
          style={styles.previewImage}
        />
        <Text style={styles.titleText}>Elige un Filtro:</Text>
        {availableFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => handleApplyFilter(filter.id)}
            style={styles.filterButton}
          >
            <Text style={styles.filterButtonText}>{filter.name}</Text>
            <Text style={styles.filterButtonDescription}>
              {filter.description}
            </Text>
          </TouchableOpacity>
        ))}
        {aiTransformationError && (
          <Text style={styles.errorText}>{aiTransformationError}</Text>
        )}
        <TouchableOpacity
          onPress={resetAllStates}
          style={[styles.buttonStyle, styles.buttonSecondary, styles.marginTop]}
        >
          <Text style={[styles.buttonTextStyle, styles.buttonTextSecondary]}>
            Cancelar y Volver
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (processedImageUri && faceDetectionError) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.titleText}>Problema con la Imagen</Text>
        <Image
          source={{ uri: processedImageUri }}
          style={styles.previewImage}
        />
        <Text style={styles.errorText}>{faceDetectionError}</Text>
        <TouchableOpacity onPress={resetAllStates} style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>Intentar con Otra Foto</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (!capturedImage) {
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

  return (
    <ThemedView style={styles.container}>
      <Text>Estado inesperado.</Text>
    </ThemedView>
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
  errorText: {
    color: "#D8000C",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
    backgroundColor: "#FFD2D2",
    padding: 10,
    borderRadius: 5,
    width: "90%",
  },
  successText: {
    color: "#155724",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
    backgroundColor: "#D4EDDA",
    padding: 10,
    borderRadius: 5,
    width: "90%",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  centeredScrollContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  filterButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 5,
    width: "90%",
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  filterButtonDescription: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
  marginTop: {
    marginTop: 20,
  },
  buttonStyle: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 8,
    width: "80%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonTextStyle: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  buttonSecondary: {
    backgroundColor: "#6c757d",
  },
  buttonTextSecondary: {
    color: "#fff",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginVertical: 10,
  },
  halfButton: {
    width: "48%",
  },
  buttonIcon: {
    marginRight: 8,
  },
  fullWidthButton: {
    width: "90%",
  },
});
