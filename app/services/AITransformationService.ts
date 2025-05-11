import { Face as DetectedFaceType } from "./FaceDetectionService"; // Asumiendo que Face está exportada allí

// Leer variables de entorno. EXPO_PUBLIC_ prefijo es necesario para que sean accesibles en el cliente con Expo.
const AI_API_KEY = process.env.EXPO_PUBLIC_AI_TRANSFORM_API_KEY;
const AI_API_ENDPOINT = process.env.EXPO_PUBLIC_AI_TRANSFORM_API_ENDPOINT; // Ej: "https://api.openai.com/v1/images/edits"

export interface Filter {
  id: string;
  name: string;
  description: string;
  // Podría tener aquí parámetros específicos para el prompt de la IA o tipo de transformación
  promptHint?: string; // Ejemplo: "make the user look like a surprised cat"
}

// Filtros de ejemplo para el MVP
const exampleFilters: Filter[] = [
  {
    id: "comic_happy",
    name: "Hiper Feliz (Cómic)",
    description:
      "Transforma una cara seria en un personaje de dibujos animados hiperfeliz.",
    promptHint:
      "a cartoon character, hyper happy, vibrant colors, exaggerated smile",
  },
  {
    id: "telenovela_drama",
    name: "Drama de Telenovela",
    description:
      "Convierte una sonrisa en una expresión dramática de telenovela con una lágrima.",
    promptHint:
      "dramatic telenovela scene, exaggerated crying, a single tear, overly dramatic expression",
  },
  {
    id: "clown_nose",
    name: "Nariz de Payaso",
    description: "Agrega una clásica nariz de payaso roja.",
    promptHint: "add a red clown nose", // Para APIs de edición/inpainting
  },
  {
    id: "dino_angry",
    name: "Dinosaurio Enojado",
    description: "¿Cómo te verías si fueras un dinosaurio enojado?",
    promptHint:
      "transform into an angry cartoon dinosaur, sharp teeth, scales, furious expression",
  },
];

/**
 * Obtiene la lista de filtros de transformación disponibles.
 * @returns {Promise<Filter[]>} Una lista de filtros.
 */
export const getAvailableFilters = async (): Promise<Filter[]> => {
  // En una app real, esto podría venir de una configuración remota o una API
  return Promise.resolve(exampleFilters);
};

interface TransformationResult {
  transformedImageUri?: string;
  error?: string;
}

/**
 * Simula la transformación de una imagen usando una API de IA.
 * @param imageUri URI de la imagen original (procesada por ImageManipulator).
 * @param face Datos del rostro detectado (puede ser usado para enfocar la transformación).
 * @param filterId ID del filtro a aplicar.
 * @returns {Promise<TransformationResult>} La URI de la imagen transformada o un error.
 */
export const transformImage = async (
  imageUri: string,
  face: DetectedFaceType, // Usaremos esto para construir el prompt o enfocar la API
  filterId: string
): Promise<TransformationResult> => {
  console.log(`API Key cargada: ${AI_API_KEY ? "Sí" : "No - Revisa tu .env"}`);
  console.log(
    `Endpoint configurado: ${AI_API_ENDPOINT || "No - Revisa tu .env"}`
  );

  if (!AI_API_KEY || !AI_API_ENDPOINT) {
    return {
      error:
        "La configuración de la API de IA no está completa (clave o endpoint faltante).",
    };
  }

  const filter = exampleFilters.find((f) => f.id === filterId);
  if (!filter) {
    return { error: "Filtro no encontrado." };
  }

  // --- COMIENZO DE LA LÓGICA DE LLAMADA A API REAL (A IMPLEMENTAR) ---
  // Esta sección necesitará ser reemplazada con la lógica específica de la API elegida (OpenAI, Stability AI, etc.)
  console.log(
    `Iniciando transformación real (simulada) con filtro: ${filter.name}, prompt: ${filter.promptHint}`
  );
  console.log("Utilizando imagen en URI:", imageUri);
  // console.log("Datos del rostro detectado:", face); // Descomentar si es útil para la API

  // Ejemplo de cómo podrías necesitar preparar los datos:
  // const formData = new FormData();
  // formData.append('image', { uri: imageUri, name: 'photo.jpg', type: 'image/jpeg' } as any);
  // formData.append('prompt', filter.promptHint || 'apply a fun transformation');
  // if (face && AI_API_ENDPOINT.includes('openai')) { // Ejemplo para OpenAI inpainting/edit
  //   // podrías necesitar enviar una máscara o coordenadas si la API lo soporta para enfocar la edición
  // }

  // try {
  //   const response = await fetch(AI_API_ENDPOINT, {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${AI_API_KEY}`,
  //       // 'Content-Type': 'multipart/form-data', // Para FormData
  //       // 'Content-Type': 'application/json', // Para JSON
  //     },
  //     body: formData, // o JSON.stringify({ prompt: ..., image: ... base64 ... })
  //   });
  //   if (!response.ok) {
  //     const errorData = await response.json().catch(() => ({ message: response.statusText }));
  //     console.error("Error de la API de IA:", errorData);
  //     return { error: `Error de la API de IA: ${errorData.message || response.statusText}` };
  //   }
  //   const resultData = await response.json();
  //   // Aquí extraerías la URI de la imagen transformada de resultData
  //   // const transformedUri = resultData.data[0].url; // Ejemplo para OpenAI
  //   // return { transformedImageUri: transformedUri };
  // } catch (e: any) {
  //   console.error("Error en la llamada a la API de IA:", e);
  //   return { error: `Excepción al llamar a la API: ${e.message}` };
  // }
  // --- FIN DE LA LÓGICA DE LLAMADA A API REAL (A IMPLEMENTAR) ---

  // Mantener la simulación por ahora hasta que se implemente la llamada real
  return new Promise((resolve) => {
    setIsTransforming(true);
    console.log(
      `(SIMULADO) Transformando con filtro: ${filter.name}, prompt: ${filter.promptHint}`
    );
    setTimeout(() => {
      const success = true;
      setIsTransforming(false);
      if (success) {
        console.log("(SIMULADO) Transformación exitosa.");
        resolve({
          transformedImageUri: imageUri + `?transformed=${filter.id}`,
        });
      } else {
        console.error("(SIMULADO) Error en la transformación IA.");
        resolve({ error: "Error simulado al transformar la imagen con IA." });
      }
    }, 3000);
  });
};

// Helper para gestionar el estado de carga globalmente (esto es una simplificación)
// En una app real, usarías un store de estado (Zustand, Redux, Context API)
let _isTransformingCallback: (isTransforming: boolean) => void = () => {};
export const setTransformingStatusCallback = (
  callback: (isTransforming: boolean) => void
) => {
  _isTransformingCallback = callback;
};
const setIsTransforming = (isTransforming: boolean) => {
  _isTransformingCallback(isTransforming);
};
