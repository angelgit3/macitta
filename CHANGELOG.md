# Changelog

## Unreleased

### Version v1 prueba de estudio (2026-02-03)

#### Features
- **Study Interface:** Implementada la interfaz de estudio activa (`/estudio`) conectada a Supabase.
- **StudyCard Component:**
  - Soporte para múltiples slots de respuesta (Infinitivo, Pasado Simple, Participio).
  - Feedaback visual instantáneo (Verde/Rojo).
  - **Navegación por Teclado:** 
    - `Enter`: Avanzar de input -> Comprobar -> Siguiente Tarjeta.
    - `Backspace`: Regresar al input anterior si el actual está vacío.
- **Lógica de Validación:**
  - Soporte estricto para `match_type`:
    - 'any': Acepta sinónimos (ej: "begin" o "start").
    - 'all': (Preparado) Requerirá todas las respuestas correctas.
  - Implementado en `useStudySession` hook.

#### Testing / Muestras
- **Base de Datos:**
  - Se añadieron manualmente los verbos "Empezar", "Apostar" y "Morder" para pruebas.
  - Se actualizó "Empezar" para aceptar ["begin", "start"] como prueba de la lógica `anyOf`.
- **Sesión de Estudio:**
  - Hardcoded temporalmente para cargar siempre los mismos 5 verbos para validación:
    1. Ser / Estar
    2. Vencer
    3. Empezar (Prueba de sinónimos)
    4. Apostar
    5. Morder

#### Próximos Pasos (To-Do)
- Remover la lista hardcoded de verbos y reactivar el algoritmo SRS/aleatorio.
- Implementar el guardado de progreso (Update User Progress) al terminar una carta.
- Añadir página de resultados al finalizar la sesión con estadísticas reales.
