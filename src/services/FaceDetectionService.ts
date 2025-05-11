import {
  FaceDetectorClassifications,
  FaceDetectorLandmarks,
  FaceDetectorMode,
  detectFacesAsync,
} from "expo-face-detector";

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
  mode?: FaceDetectorMode;
  detectLandmarks?: FaceDetectorLandmarks;
  runClassifications?: FaceDetectorClassifications;
  minDetectionInterval?: number;
  trackingEnabled?: boolean;
}

const defaultDetectionOptions: DetectionOptions = {
  mode: FaceDetectorMode.accurate,
  detectLandmarks: FaceDetectorLandmarks.all,
  runClassifications: FaceDetectorClassifications.all,
  trackingEnabled: false,
};

export const detectFacesInImage = async (
  imageUri: string,
  options: DetectionOptions = defaultDetectionOptions
): Promise<Face[] | null> => {
  try {
    const facesResult = await detectFacesAsync(imageUri, options);

    if (facesResult && facesResult.faces) {
      return facesResult.faces.map((face) => ({
        bounds: face.bounds,
        faceID: face.faceID,
        rollAngle: face.rollAngle,
        yawAngle: face.yawAngle,
        smilingProbability: face.smilingProbability,
        leftEyeOpenProbability: face.leftEyeOpenProbability,
        rightEyeOpenProbability: face.rightEyeOpenProbability,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error detecting faces: ", error);
    return null;
  }
};

const MIN_ACCEPTABLE_PROBABILITY = 0.3;

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

  if (
    mainFace.smilingProbability !== undefined &&
    mainFace.smilingProbability < MIN_ACCEPTABLE_PROBABILITY &&
    mainFace.leftEyeOpenProbability !== undefined &&
    mainFace.leftEyeOpenProbability < MIN_ACCEPTABLE_PROBABILITY &&
    mainFace.rightEyeOpenProbability !== undefined &&
    mainFace.rightEyeOpenProbability < MIN_ACCEPTABLE_PROBABILITY
  ) {
    // console.log("Rostro principal podría no ser suficientemente claro o visible (probabilidades bajas).");
  }
  return { face: mainFace };
};
