# Regla de Mantenimiento de Documentación

Esta regla asegura que el archivo `ARCHITECTURE.md` en la raíz del proyecto no sea solo un registro histórico, sino una representación fiel del **estado actual** del sistema.

## Directrices para el Agente

1. **Sincronización Obligatoria**: Después de cada cambio significativo en la arquitectura (nueva tabla en DB, nuevo servicio core, cambio en el algoritmo SRS), el agente **debe** actualizar el archivo `ARCHITECTURE.md`.
2. **Estado Actual vs Changelog**: 
   - El `CHANGELOG.md` registra qué cambió y cuándo.
   - El `ARCHITECTURE.md` debe describir cómo funciona el sistema **hoy**. Elimina o actualiza secciones obsoletas en lugar de solo añadir "avances".
3. **Secciones Críticas a Mantener**:
   - **Stack Tecnológico**: Si se añade una dependencia core o se cambia de versión.
   - **Modelo de Datos de Supabase**: Mantener el esquema de tablas y relaciones actualizado.
   - **Flujos de Lógica de Negocio**: Cualquier cambio en el cálculo de FSRS o validación de respuestas.
4. **Verificación**: Antes de dar por terminada una sesión de desarrollo, verifica si los cambios afectan a alguna de las secciones de la arquitectura y corrígela proactivamente.

*Esta regla es fundamental para evitar la "deuda de documentación" y facilitar la continuidad del desarrollo.*
