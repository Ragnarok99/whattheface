import * as FaceDetector from "expo-face-detector";

export interface Face {
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  faceID?: number;
  rollAngle?: number;
  yawAngle?: number;
  smilingProbability?: number;
  leftEyeOpenProbability?: number;
  rightEyeOpenProbability?: number;
  // Se pueden añadir más puntos de referencia (landmarks) si son necesarios desde FaceFeature
}

export interface ImageDimensions {
  width: number;
  height: number;
}

interface DetectionOptions {
  mode?: FaceDetector.FaceDetectorMode;
  detectLandmarks?: FaceDetector.FaceDetectorLandmarks;
  runClassifications?: FaceDetector.FaceDetectorClassifications;
  minDetectionInterval?: number;
  trackingEnabled?: boolean;
}

const defaultDetectionOptions: DetectionOptions = {
  mode: FaceDetector.FaceDetectorMode.accurate, // Priorizar precisión sobre velocidad
  detectLandmarks: FaceDetector.FaceDetectorLandmarks.all, // Detectar todos los puntos de referencia
  runClassifications: FaceDetector.FaceDetectorClassifications.all, // Detectar sonrisa, ojos abiertos, etc.
  // minDetectionInterval: 1000, // Opcional: para no sobrecargar si se usara en video en vivo
  trackingEnabled: false, // No necesitamos seguimiento continuo para una sola imagen
};

/**
 * Detecta rostros en una imagen dada su URI.
 * @param imageUri La URI local de la imagen a procesar.
 * @param options Opciones de detección personalizadas.
 * @returns Una promesa que resuelve a un array de rostros detectados (Face[]) o null si hay error.
 */
export const detectFacesInImage = async (
  imageUri: string,
  options: DetectionOptions = defaultDetectionOptions
): Promise<Face[] | null> => {
  try {
    // Nota: expo-face-detector espera un objeto con la URI de la imagen y opcionalmente dimensiones.
    // No siempre necesita las dimensiones explícitamente para URIs locales, pero es buena práctica considerarlo.
    // Para esta función, asumimos que la URI es suficiente o que el detector puede manejarla.
    const facesResult = await FaceDetector.detectFacesAsync(imageUri, options);

    if (facesResult && facesResult.faces) {
      return facesResult.faces.map((face) => ({
        bounds: face.bounds,
        faceID: face.faceID,
        rollAngle: face.rollAngle,
        yawAngle: face.yawAngle,
        smilingProbability: face.smilingProbability,
        leftEyeOpenProbability: face.leftEyeOpenProbability,
        rightEyeOpenProbability: face.rightEyeOpenProbability,
        // Aquí se podrían mapear más landmarks si es necesario
      }));
    }
    return []; // No se detectaron rostros o hubo un problema no capturado como error
  } catch (error) {
    console.error("Error detecting faces: ", error);
    // Podríamos querer lanzar el error o manejarlo de forma más específica
    return null;
  }
};

// Constantes para validación
const MIN_ACCEPTABLE_PROBABILITY = 0.3; // Para sonrisa, ojos abiertos
// const MIN_FACE_WIDTH_RATIO = 0.15; // Ejemplo: el ancho del rostro debe ser al menos el 15% del ancho de la imagen
// const MAX_DEVIATION_FROM_CENTER = 0.3; // Ejemplo: el centro del rostro no debe desviarse más del 30% del centro de la imagen

/**
 * Valida los rostros detectados y selecciona el más adecuado.
 * Criterios:
 * - Si hay múltiples rostros, selecciona el más grande (área del bounding box).
 * - (Opcional) Verifica probabilidades mínimas de sonrisa/ojos abiertos.
 * @param faces Array de rostros detectados.
 * @param imageDimensions Dimensiones de la imagen original { width: number, height: number } (opcional, para validaciones más robustas)
 * @returns El rostro principal validado (Face) o un objeto con un mensaje de error.
 */
export const getValidatedMainFace = (
  faces: Face[],
  imageDimensions?: ImageDimensions
): { face: Face | null; error?: string } => {
  if (!faces || faces.length === 0) {
    return { face: null, error: "No se detectaron rostros." };
  }

  let mainFace: Face;

  if (faces.length > 1) {
    console.warn(
      `Se detectaron ${faces.length} rostros. Seleccionando el más grande.`
    );
    // Seleccionar el rostro con el área de bounding box más grande
    mainFace = faces.reduce((largest, current) => {
      const largestArea =
        largest.bounds.size.width * largest.bounds.size.height;
      const currentArea =
        current.bounds.size.width * current.bounds.size.height;
      return currentArea > largestArea ? current : largest;
    });
  } else {
    mainFace = faces[0];
  }

  // Validaciones básicas de "claridad" usando probabilidades (si están disponibles)
  if (
    mainFace.smilingProbability !== undefined &&
    mainFace.smilingProbability < MIN_ACCEPTABLE_PROBABILITY &&
    mainFace.leftEyeOpenProbability !== undefined &&
    mainFace.leftEyeOpenProbability < MIN_ACCEPTABLE_PROBABILITY &&
    mainFace.rightEyeOpenProbability !== undefined &&
    mainFace.rightEyeOpenProbability < MIN_ACCEPTABLE_PROBABILITY
  ) {
    // Si todas las probabilidades son bajas, podría ser un rostro poco claro o no de frente.
    // Esto es una heurística, podría necesitar ajuste.
    // console.log("Rostro principal podría no ser suficientemente claro o visible (probabilidades bajas).");
    // No lo marcaremos como error fatal por ahora, pero es una consideración.
  }

  // Ejemplo de validaciones que SÍ necesitarían imageDimensions:
  // if (imageDimensions) {
  //   // Validación de tamaño mínimo
  //   if ((mainFace.bounds.size.width / imageDimensions.width) < MIN_FACE_WIDTH_RATIO) {
  //     return { face: null, error: "El rostro detectado es demasiado pequeño." };
  //   }
  //   // Validación de posición (ejemplo muy básico de centralidad)
  //   const faceCenterX = mainFace.bounds.origin.x + mainFace.bounds.size.width / 2;
  //   const imageCenterX = imageDimensions.width / 2;
  //   if (Math.abs(faceCenterX - imageCenterX) / imageDimensions.width > MAX_DEVIATION_FROM_CENTER) {
  //       return { face: null, error: "El rostro no está suficientemente centrado." };
  //   }
  // }

  return { face: mainFace }; // Devuelve el rostro principal si pasa las validaciones que no dependen de imageDimensions
};
