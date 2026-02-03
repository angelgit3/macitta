# 📚 Documentación Completa: Importación JSON de Mazos

> **Versión 2.0** - Guía definitiva para crear mazos con multimedia y respuestas avanzadas

---

## 🎯 **Modos de importación soportados**

Kyan soporta dos modos de importación en formato JSON:

1. **🚀 Mazo completo (recomendado)** — Estructura con `deck` y `cards` (ver abajo).
2. **🧩 Solo tarjetas en mazo existente** — Estructura mínima `{ "cards": [...] }` que se importa desde la vista del mazo.

---

## 🚀 **FORMATO NUEVO (RECOMENDADO)**

### 🏗️ Estructura Base

```json
{
  "deck": {
    "name": "Nombre del Mazo",
    "description": "Descripción opcional del mazo",
    "question_labels": ["Pregunta"],
    "answer_labels": ["Respuesta1", "Respuesta2", "Respuesta3"],
    "color": "#06B6D4"
  },
  "cards": [
    {
      "front_text": "Texto del frente de la tarjeta",
      "front_media": {
        "image": "frente-imagen.jpg",
        "audio": "frente-audio.mp3"
      },
      "answers": [
        {
          "field": "Respuesta1",
          "text": "texto-simple-o-avanzado",
          "media": {
            "image": "respuesta-imagen.jpg",
            "audio": "respuesta-audio.mp3"
          }
        }
      ]
    }
  ]
}
```

### 📋 **Campos del Objeto `deck`**

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| `name` | `string` | ✅ | Nombre del mazo (máx. 100 caracteres) | `"Verbos Irregulares"` |
| `description` | `string` | ❌ | Descripción detallada | `"Lista completa de verbos irregulares en inglés"` |
| `question_labels` | `string[]` | ✅ | Etiquetas para preguntas | `["Español", "Contexto"]` |
| `answer_labels` | `string[]` | ✅ | Etiquetas para respuestas | `["Infinitivo", "Pasado", "Participio"]` |
| `color` | `string` | ❌ | Color en hexadecimal | `"#06B6D4"`, `"#FF5733"` |

### 🎨 **Campos de una Tarjeta**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `front_text` | `string` | ✅ | Texto principal del frente |
| `front_media` | `object` | ❌ | Multimedia del frente |
| `answers` | `array` | ✅ | Array de respuestas/conceptos |

### 🎵 **Estructura de Multimedia (`front_media` o `answer.media`)**

```json
{
  "image": "nombre-archivo.jpg",  // Opcional: imagen
  "audio": "nombre-archivo.mp3"   // Opcional: audio
}
```

**Formatos soportados:**
- **Imágenes**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- **Audio**: `.mp3`, `.wav`, `.ogg`, `.m4a`

---

## 🎯 **Tipos de Respuestas Avanzadas**

### 1. 📝 **Respuesta Simple**
```json
{
  "field": "Capital de Francia",
  "text": "París"
}
```
- **Comportamiento**: Acepta exactamente "París"
- **Evaluación**: Modo `any` automático

### 2. 🔀 **Respuestas Múltiples (Array)**
```json
{
  "field": "Formas del Verbo",
  "text": ["París", "Paris", "paris"]
}
```
- **Comportamiento**: Acepta cualquiera de las opciones
- **Ejemplo**: "paris" ✅, "Paris" ✅, "Londres" ❌

### 3. 🎲 **anyOf Explícito**
```json
{
  "field": "Sinónimos",
  "text": {
    "anyOf": ["grande", "enorme", "gigante", "inmenso"]
  }
}
```
- **Comportamiento**: Acepta cualquier sinónimo
- **Ejemplo**: "grande" ✅, "enorme" ✅, "pequeño" ❌

### 4. ✅ **allOf - Todas las Respuestas**
```json
{
  "field": "Colores Primarios",
  "text": {
    "allOf": ["rojo", "azul", "amarillo"]
  }
}
```
- **Comportamiento**: Debe incluir TODOS los colores
- **Ejemplo**: "rojo, azul, amarillo" ✅, "rojo, azul" ❌

### 5. 📊 **allOf Ordenado**
```json
{
  "field": "Pasos del Algoritmo",
  "text": {
    "allOf": ["inicializar", "procesar", "finalizar"],
    "ordered": true
  }
}
```
- **Comportamiento**: Debe aparecer en orden específico
- **Ejemplo**: "inicializar, procesar, finalizar" ✅, "procesar, inicializar, finalizar" ❌

### 6. 🎯 **kOf - Al Menos K de N**
```json
{
  "field": "Características de la Democracia",
  "text": {
    "kOf": {
      "of": ["libertad", "igualdad", "fraternidad", "justicia", "transparencia"],
      "atLeast": 3
    }
  }
}
```
- **Comportamiento**: Debe dar al menos 3 de las 5 características
- **Ejemplo**: "libertad, igualdad, justicia" ✅, "libertad, igualdad" ❌

### 7. 🚫 **Respuestas con Restricciones**
```json
{
  "field": "Color en Inglés",
  "text": {
    "anyOf": ["color", "colour"],
    "forbid": ["paint", "dye"],
    "allowSuperset": false
  }
}
```
- **Metadatos**:
  - `forbid`: Palabras que invalidan la respuesta
  - `allowSuperset`: Si permite respuestas adicionales

---

## 🌟 **Ejemplos Completos**

### 📖 **Ejemplo 1: Verbos Irregulares (Básico)**

```json
{
  "deck": {
    "name": "Verbos Irregulares - Inglés",
    "description": "Práctica de verbos irregulares en inglés",
    "question_labels": ["Español"],
    "answer_labels": ["Infinitivo", "Pasado Simple", "Participio"],
    "color": "#06B6D4"
  },
  "cards": [
    {
      "front_text": "Ser/Estar",
      "answers": [
        {
          "field": "Infinitivo",
          "text": "be"
        },
        {
          "field": "Pasado Simple",
          "text": ["was", "were"]
        },
        {
          "field": "Participio",
          "text": "been"
        }
      ]
    },
    {
      "front_text": "Quemar",
      "answers": [
        {
          "field": "Infinitivo",
          "text": "burn"
        },
        {
          "field": "Pasado Simple",
          "text": {
            "anyOf": ["burned", "burnt"]
          }
        },
        {
          "field": "Participio",
          "text": {
            "anyOf": ["burned", "burnt"]
          }
        }
      ]
    }
  ]
}
```

### 🎵 **Ejemplo 2: Verbos con Multimedia**

```json
{
  "deck": {
    "name": "Verbos con Pronunciación",
    "description": "Verbos irregulares con audio de pronunciación",
    "question_labels": ["Español"],
    "answer_labels": ["Infinitivo", "Pasado", "Participio"],
    "color": "#FF6B6B"
  },
  "cards": [
    {
      "front_text": "Ser/Estar",
      "front_media": {
        "image": "ser-estar.jpg",
        "audio": "ser-estar-es.mp3"
      },
      "answers": [
        {
          "field": "Infinitivo",
          "text": "be",
          "media": {
            "audio": "be-pronunciation.mp3"
          }
        },
        {
          "field": "Pasado",
          "text": ["was", "were"],
          "media": {
            "audio": "was-were-pronunciation.mp3"
          }
        },
        {
          "field": "Participio",
          "text": "been",
          "media": {
            "audio": "been-pronunciation.mp3"
          }
        }
      ]
    }
  ]
}
```

### 🧠 **Ejemplo 3: Ciencias (Respuestas Avanzadas)**

```json
{
  "deck": {
    "name": "Biología Celular",
    "description": "Componentes y funciones celulares",
    "question_labels": ["Pregunta"],
    "answer_labels": ["Organelos", "Funciones", "Ejemplos"],
    "color": "#4ECDC4"
  },
  "cards": [
    {
      "front_text": "¿Cuáles son los organelos principales de la célula animal?",
      "answers": [
        {
          "field": "Organelos",
          "text": {
            "kOf": {
              "of": ["núcleo", "mitocondrias", "ribosomas", "retículo", "golgi", "lisosomas"],
              "atLeast": 4
            }
          }
        },
        {
          "field": "Funciones",
          "text": {
            "allOf": ["respiración celular", "síntesis de proteínas", "digestión celular"],
            "ordered": false
          }
        }
      ]
    },
    {
      "front_text": "Proceso de respiración celular",
      "answers": [
        {
          "field": "Pasos",
          "text": {
            "allOf": ["glucólisis", "ciclo de Krebs", "cadena de transporte"],
            "ordered": true
          }
        },
        {
          "field": "Productos",
          "text": {
            "anyOf": ["ATP", "adenosín trifosfato"],
            "forbid": ["ADP", "glucosa"]
          }
        }
      ]
    }
  ]
}
```

---

## 🧩 **Importación solo de tarjetas (en mazo existente)**

- Usar cuando ya tienes un mazo creado y quieres añadir tarjetas en la vista del mazo.
- Endpoint/UI espera un JSON con esta forma mínima:

```json
{
  "cards": [
    {
      "front_text": "Texto del frente",
      "front_media": { "image": "https://...", "audio": "https://..." },
      "answers": [
        { "field": "Etiqueta 1", "text": "respuesta simple", "media": { "image": "https://..." } },
        { "field": "Etiqueta 2", "text": ["opcion1", "opcion2"] },
        { "field": "Etiqueta 3", "text": { "anyOf": ["a", "b"] } }
      ]
    }
  ]
}
```

- Reglas:
  - Máximo **5 respuestas** por tarjeta (`answers[0..4]`).
  - `text` soporta `string` | `string[]` | `{ anyOf }` | `{ allOf, ordered? }` | `{ kOf: { of[], atLeast }, allowSuperset? }` | `forbid?`.
  - `media.image` y `media.audio` aceptan **URLs directas** (ver sección Multimedia).

---

## 🎨 **Multimedia (URLs externas)**

- Actualmente, la importación usa **enlaces externos** (no se suben archivos locales).
- Acepta imágenes y audio en `front_media` y en `answer.media`.
- Recomendaciones:
  - Usa **enlaces directos** (no páginas de “share”).
  - Proveedores soportados y normalizados automáticamente: **Google Drive**, **Dropbox**, **GitHub raw**, **Cloudinary**, **Supabase Storage**.
  - Drive: puedes pegar `https://drive.google.com/file/d/ID/view` y se convertirá a un enlace directo.

### ✅ Ejemplos
- Drive directo imagen: `https://drive.usercontent.google.com/uc?id=FILE_ID&export=view`
- Drive directo audio: `https://drive.usercontent.google.com/uc?id=FILE_ID&export=download`
- Dropbox directo: `https://dl.dropboxusercontent.com/s/.../file.jpg`
- GitHub raw: `https://raw.githubusercontent.com/user/repo/branch/path/file.png`

### 🛡️ Notas
- Para audio, si el host limita streaming, la app usa un **proxy seguro** para permitir reproducción.
- Se validan URLs y se muestran estados de “Válida/Inválida”.
- Mantén un **formato cuadrado** para imágenes si es posible (mejor ajuste visual), aunque no es obligatorio.

---

## ✅ **Plantilla Base para Nuevo Formato**

```json
{
  "deck": {
    "name": "TU_NOMBRE_DE_MAZO",
    "description": "Descripción opcional",
    "question_labels": ["Pregunta"],
    "answer_labels": ["Respuesta1", "Respuesta2"],
    "color": "#06B6D4"
  },
  "cards": [
    {
      "front_text": "Pregunta o concepto",
      "front_media": {
        "image": "imagen-opcional.jpg",
        "audio": "audio-opcional.mp3"
      },
      "answers": [
        {
          "field": "Respuesta1",
          "text": "respuesta simple o array o objeto avanzado",
          "media": {
            "image": "imagen-respuesta.jpg",
            "audio": "audio-respuesta.mp3"
          }
        }
      ]
    }
  ]
}
```

---

## 🔧 **Tips y Mejores Prácticas**

### ✨ **Para Principiantes**
1. **Comienza simple**: Usa respuestas de tipo `string` primero
2. **Sin multimedia**: Omite los campos `front_media` y `media` inicialmente
3. **Pocos campos**: Empieza con 2-3 campos de respuesta máximo

### 🚀 **Para Usuarios Avanzados**
1. **Planifica multimedia**: Organiza tus archivos antes de crear el JSON
2. **Usa colores**: Personaliza con colores en hexadecimal
3. **Respuestas inteligentes**: Aprovecha `anyOf`, `allOf`, `kOf` según el contexto
4. **Restricciones útiles**: Usa `forbid` para evitar respuestas incorrectas comunes

### 🎯 **Casos de Uso Recomendados**

| Tipo de Contenido | Formato Recomendado | Ejemplo |
|------------------|-------------------|---------|
| **Vocabulario simple** | `string` o `array` | `"hello"` o `["hello", "hi"]` |
| **Sinónimos/Antónimos** | `anyOf` | `{"anyOf": ["big", "large", "huge"]}` |
| **Listas completas** | `allOf` | `{"allOf": ["red", "blue", "yellow"]}` |
| **Secuencias ordenadas** | `allOf` + `ordered: true` | Pasos de algoritmos |
| **Respuestas parciales** | `kOf` | Al menos 3 de 5 elementos |

---

## 🆘 **Solución de Problemas**

### ❌ **Errores Comunes**

1. **"Tarjetas saltadas"**
   - **Causa**: `front_text` vacío o `answers` array vacío
   - **Solución**: Verifica que cada tarjeta tenga contenido válido

2. **"Archivo multimedia no encontrado"**
   - **Causa**: Referencia a archivo que no se subió
   - **Solución**: Sube todos los archivos referenciados en el JSON

3. **"Estructura JSON inválida"**
   - **Causa**: JSON mal formateado
   - **Solución**: Usa un validador de JSON online

### ✅ **Validación Automática**

El sistema valida automáticamente:
- ✅ Estructura correcta del JSON
- ✅ Campos requeridos presentes
- ✅ Tipos de datos correctos
- ✅ Referencias de archivos multimedia
- ✅ Formato de colores hexadecimales

---

## 🎉 **¡Listo para Crear!**

Ya tienes toda la información necesaria para crear mazos increíbles con el formato JSON. 

**¿Necesitas ayuda?**
- 🔧 **Conversión**: Te ayudo a convertir tu JSON legacy al formato nuevo
- 🎨 **Personalización**: Te asisto con respuestas avanzadas y multimedia
- 🐛 **Debugging**: Te ayudo a solucionar problemas de importación

¡Empieza con la plantilla base y experimenta con diferentes tipos de respuestas!