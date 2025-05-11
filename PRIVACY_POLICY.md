# Política de Privacidad de WhatTheFace (Borrador para MVP)

**Última actualización:** [Fecha de Publicación]

Bienvenido/a a WhatTheFace (la "App"), operada por [Tu Nombre/Nombre de Empresa Aquí] ("nosotros", "nuestro"). Esta Política de Privacidad explica cómo manejamos la información en relación con nuestra aplicación móvil.

**IMPORTANTE: Este es un borrador básico para un Producto Mínimo Viable (MVP) y NO debe considerarse legalmente completo o vinculante sin la revisión de un profesional legal. Deberás adaptarlo y expandirlo según las leyes aplicables y las características finales de tu App.**

## 1. Información que Recopilamos (o NO Recopilamos - MVP)

Para la versión MVP de WhatTheFace, nuestro objetivo es minimizar la recopilación de datos:

- **Imágenes:** Cuando usas la App para tomar una foto o seleccionas una de tu galería, esa imagen se procesa en tu dispositivo o se envía a un servicio de IA de terceros para su transformación.
  - **Procesamiento en Dispositivo (Detección Facial):** La detección inicial de rostros y el preprocesamiento básico de la imagen (redimensionamiento) pueden ocurrir localmente en tu dispositivo.
  - **Servicios de IA de Terceros (Transformación):** Para aplicar los filtros de transformación "absurdos", la imagen (o datos derivados de ella) se envía a un servicio de API de Inteligencia Artificial de terceros (por ejemplo, OpenAI DALL-E, Stability AI, u otro). Nosotros no almacenamos permanentemente tus imágenes originales o transformadas en nuestros servidores después de que la transformación se completa y se te muestra. Las políticas de estos servicios de terceros regirán cómo ellos manejan tus datos; te recomendamos revisar sus políticas de privacidad.
  - **No almacenamos tus fotos:** Una vez que la imagen es procesada y transformada, y se te muestra, no la guardamos en nuestros servidores.
- **Datos de Detección Facial:** La información sobre la detección de rostros (como coordenadas o landmarks) se usa momentáneamente para aplicar el filtro y no se almacena asociada a ninguna información personal identificable.
- **No Recopilamos Información Personal Identificable (PII):** Para el MVP, no te pedimos que crees una cuenta, ni recopilamos tu nombre, dirección de correo electrónico, ubicación u otra PII directamente.
- **Datos de Uso (Anónimos y Agregados - A CONSIDERAR):** Podríamos considerar el uso de herramientas de análisis (como Firebase Analytics, Expo Insights) para recopilar datos anónimos y agregados sobre cómo se usa la App (ej. filtros más populares, frecuencia de uso) para mejorarla. Si se implementa, esto se detallará aquí y se buscará el consentimiento apropiado si es necesario.

## 2. Cómo Usamos tu Información

- **Para Proveer la Funcionalidad de la App:** Usamos las imágenes que proporcionas y los datos de detección facial únicamente para aplicar los filtros y mostrarte la imagen transformada.
- **Para Mejorar la App (si se implementa análisis):** Los datos de uso anónimos nos ayudarían a entender qué características son populares y cómo podemos mejorar la experiencia.

## 3. Compartir tu Información

- **Servicios de IA de Terceros:** Como se mencionó, las imágenes se comparten con servicios de IA de terceros para la transformación. No controlamos sus prácticas de privacidad.
- **Obligaciones Legales:** Podríamos divulgar información si así lo exige la ley.
- **No Vendemos tu Información:** No vendemos tus imágenes ni ningún dato personal a terceros.

## 4. Permisos Solicitados en la App

- **Cámara (`NSCameraUsageDescription` en iOS, `CAMERA` en Android):** Solicitamos este permiso para que puedas tomar fotos directamente desde la App para aplicar los filtros.
- **Galería/Fotos (`NSPhotoLibraryUsageDescription` / `NSPhotoLibraryAddUsageDescription` en iOS, `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` en Android):** Solicitamos este permiso para:
  - Permitirte seleccionar fotos existentes de tu galería para aplicarles filtros.
  - Permitirte guardar las imágenes transformadas en tu galería.

## 5. Seguridad de los Datos

Aunque el MVP minimiza la recopilación de datos y no los almacena en nuestros servidores, tomamos la seguridad de los datos que se procesan momentáneamente con seriedad. Cuando las imágenes se envían a APIs de terceros, la transmisión se realiza generalmente mediante HTTPS.

## 6. Privacidad de los Niños

La App no está dirigida a niños menores de 13 años (o la edad aplicable en tu jurisdicción). No recopilamos intencionadamente información personal de niños. Si eres padre o tutor y crees que tu hijo nos ha proporcionado información, por favor contáctanos.

## 7. Tus Opciones y Derechos

Dado que no creamos cuentas de usuario ni almacenamos tus imágenes en el MVP:

- Puedes negarte a conceder los permisos de cámara o galería, aunque esto limitará la funcionalidad de la App.
- Puedes desinstalar la App en cualquier momento.

## 8. Cambios a esta Política de Privacidad

Podemos actualizar esta Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página o dentro de la App. Se te aconseja revisar esta Política de Privacidad periódicamente para cualquier cambio.

## 9. Contacto

Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos en: [Tu Email de Contacto o Enlace a Formulario de Contacto]
