import { Face as DetectedFaceType } from "./FaceDetectionService"; // Asumiendo que Face está exportada allí

// Leer variables de entorno. EXPO_PUBLIC_ prefijo es necesario para que sean accesibles en el cliente con Expo.
const AI_API_KEY = process.env.EXPO_PUBLIC_AI_TRANSFORM_API_KEY;
const AI_API_ENDPOINT = process.env.EXPO_PUBLIC_AI_TRANSFORM_API_ENDPOINT; // Ej: "https://api.openai.com/v1/images/edits"

// Cache Simulado (muy básico, solo para ilustrar el concepto)
// En una app real: AsyncStorage para cache en cliente, o un backend con Redis/Memcached para cache en servidor.
// const imageTransformationCache = new Map<string, TransformationResult>();

export interface Filter {
  id: string;
  name: string;
  description: string;
  // Podría tener aquí parámetros específicos para el prompt de la IA o tipo de transformación
  promptHint?: string; // Ejemplo: "make the user look like a surprised cat"
  // Podrían añadirse aquí otros campos para controlar parámetros específicos de la API:
  // e.g., apiSpecificParams?: { model?: string; strength?: number; negativePrompt?: string; }
}

// Filtros de ejemplo para el MVP
const exampleFilters: Filter[] = [
  {
    id: "comic_happy",
    name: "Hiper Feliz (Cómic)",
    description:
      "Transforma una cara seria en un personaje de dibujos animados hiperfeliz.",
    promptHint:
      "photo of a face, transformed into a vibrant, hyper-happy cartoon character, exaggerated smile, sparkling eyes, comic book art style",
    // apiSpecificParams: { model: 'dall-e-3', style: 'vivid' } // Ejemplo
  },
  {
    id: "telenovela_drama",
    name: "Drama de Telenovela",
    description:
      "Convierte una sonrisa en una expresión dramática de telenovela con una lágrima.",
    promptHint:
      "photo of a face, transformed into an overly dramatic telenovela scene, exaggerated crying expression, a single large comical tear, dramatic lighting",
  },
  {
    id: "clown_nose",
    name: "Nariz de Payaso",
    description: "Agrega una clásica nariz de payaso roja.",
    promptHint:
      "Add a classic shiny red clown nose to the center of the face. The rest of the face should remain as in the original photo.", // Más orientado a inpainting
    // apiSpecificParams: { operation: 'inpainting', maskType: 'nose_area' } // Ejemplo
  },
  {
    id: "dino_angry",
    name: "Dinosaurio Enojado",
    description: "¿Cómo te verías si fueras un dinosaurio enojado?",
    promptHint:
      "photo of a face, transformed into an angry cartoon Tyrannosaurus Rex, sharp teeth, scales, furious reptilian eyes, vibrant green and brown colors",
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

export interface TransformationResult {
  transformedImageUri?: string;
  error?: string;
  errorType?:
    | "ConfigurationError"
    | "FilterNotFound"
    | "NetworkError"
    | "ApiError"
    | "SimulationError"
    | "CacheError"
    | "FallbackFailed";
  fromCache?: boolean;
  usedFallback?: boolean;
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
      error: "Configuración de API incompleta.",
      errorType: "ConfigurationError",
    };
  }

  const filter = exampleFilters.find((f) => f.id === filterId);
  if (!filter || !filter.promptHint) {
    return {
      error: "Filtro no encontrado o prompt no definido.",
      errorType: "FilterNotFound",
    };
  }

  // --- INICIO LÓGICA DE CACHÉ (SIMULADA Y MUY BÁSICA) ---
  // const cacheKey = `${imageUri}-${filterId}`; // Una clave de caché simple podría basarse en la URI y el filtro.
  //                                          // Para imágenes reales, se necesitaría un hash del contenido de la imagen.
  // if (imageTransformationCache.has(cacheKey)) {
  //   console.log("Devolviendo resultado de transformación desde caché simulada para:", cacheKey);
  //   return { ...imageTransformationCache.get(cacheKey)!, fromCache: true };
  // }
  // --- FIN LÓGICA DE CACHÉ ---

  // --- INICIO DE LÓGICA DE LLAMADA A API REAL (A IMPLEMENTAR) ---
  // console.log(`Iniciando transformación con filtro: ${filter.name}, prompt: ${filter.promptHint}`);
  //
  // // 1. Preparación de la imagen (ej. a base64 si la API lo requiere)
  // // let imagePayload = imageUri; // Si la API acepta URL directa y la URI es accesible públicamente
  // // try {
  // //   if (AI_API_ENDPOINT.includes('requires_base64_upload')) { // Placeholder para lógica de API específica
  // //      imagePayload = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
  // //   }
  // // } catch (e) {
  // //   console.error("Error al convertir imagen a base64:", e);
  // //   return { error: "Error al preparar la imagen para la API.", errorType: 'ApiError' };
  // // }
  //
  // // 2. Construcción del Payload para la API
  // // El payload exacto dependerá enormemente de la API de IA seleccionada (OpenAI, Stability, etc.)
  // const requestPayload: any = {
  //   prompt: filter.promptHint, // El prompt es fundamental
  //   // image: imagePayload, // Imagen original (URI o base64)
  //   // n: 1, // Número de imágenes a generar
  //   // size: "1024x1024", // Tamaño de la imagen de salida deseado
  //   // ...otros parámetros basados en filter.apiSpecificParams o la API...
  //   // Por ejemplo, para inpainting/edición, podrías necesitar enviar una máscara basada en `face.bounds`
  // };
  //
  // // Si usas OpenAI DALL-E para edición (inpainting/outpainting):
  // // Tendrías que generar una máscara PNG a partir de face.bounds y el tamaño de la imagen.
  // // El `imagePayload` sería la imagen original, `mask` la máscara generada.
  // // requestPayload.mask = generatedMaskBase64;
  //
  // // 3. Realizar la llamada fetch
  // try {
  //   const response = await fetch(AI_API_ENDPOINT, {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${AI_API_KEY}`,
  //       'Content-Type': 'application/json', // Ajustar si la API espera FormData
  //     },
  //     body: JSON.stringify(requestPayload),
  //   });
  //
  //   if (!response.ok) {
  //     // ... (manejo de error de respuesta como estaba antes) ...
  //     let errorMsg = `Error de API: ${response.status}`;
  //     try { const errorData = await response.json(); errorMsg = errorData.error?.message || errorData.message || errorMsg; } catch (e) {}
  //     return { error: errorMsg, errorType: 'ApiError' };
  //   }
  //
  //   const resultData = await response.json();
  //   // const transformedUri = resultData.data[0].url; // Ejemplo para OpenAI DALL-E Image Generation
  //   // if (!transformedUri) return { error: "La API no devolvió una imagen transformada.", errorType: 'ApiError' };
  //   // return { transformedImageUri: transformedUri };
  //
  // } catch (e: any) {
  //   // ... (manejo de error de red como estaba antes) ...
  //   return { error: `Error de red: ${e.message}`, errorType: 'NetworkError' };
  // }
  // --- FIN DE LÓGICA DE LLAMADA A API REAL ---

  // Simulación por ahora:
  return new Promise((resolve) => {
    setIsTransforming(true);
    console.log(
      `(SIMULADO) Transformando con filtro: ${filter.name}, prompt: ${filter.promptHint}`
    );
    setTimeout(() => {
      const success = Math.random() > 0.1; // Simular 90% de éxito para probar errores también
      setIsTransforming(false);
      if (success) {
        const result: TransformationResult = {
          transformedImageUri: imageUri + `?transformed=${filter.id}`,
        };
        // imageTransformationCache.set(cacheKey, result); // Guardar en caché simulada
        console.log("(SIMULADO) Transformación exitosa.");
        resolve(result);
      } else {
        console.error("(SIMULADO) Error en la transformación IA.");
        // Simular que no hay fallback o que el fallback también falló
        resolve({
          error:
            "Error simulado al transformar la imagen (sin fallback exitoso).",
          errorType: "SimulationError",
          usedFallback: false,
        });
      }
    }, 2000); // Reducido el delay para pruebas más rápidas
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
