# Reglas de Diseño y UI (Stitch MCP)

Esta regla define el estándar para el diseño de interfaces y la integración del MCP de Stitch en el proyecto.

## 1. Integración con Stitch MCP
- **Herramienta Principal**: Utilizar y potenciar el MCP de Stitch de Google para todas las tareas relacionadas con la creación, iteración y revisión visual de componentes UI y pantallas.
- **Flujo de Trabajo**: Antes de codificar nuevas pantallas complejas o rediseñar las existentes, generar prototipos visuales a través de *Stitch MCP* (e.g., usando `generate_screen_from_text` o elaborando sobre proyectos existentes).
- **Consistencia**: Buscar que el código generado (React + Tailwind) o adaptado siga de cerca el diseño propuesto y validado a través de Stitch, garantizando diseños profesionales, vivos y con estética premium.

## 2. Estética "Academic Studio" (Refined Brutalism)
- **Concepto**: Un estilo vibrante y claro para educación "Solid & Playful".
- **Colores y Sombras**: 
  - Usar temas oscuros (fondo `void: #050505`) contrastados con colores pastel sólidos y brillantes (Digital Mint, Electric Lavender).
  - En lugar de efectos de `backdrop-blur` (glassmorphism), usar sombras proyectadas sin desenfoque (offset shadows) y bordes definidos de 2px para definir capas.
- **Tipografía**:
  - Preferir fuentes tipo Serif o elegantes para encabezados/títulos para un toque académico.
  - Usar fuentes geométricas/Sans-serif para lectura, inputs y datos.
- **Interacciones**: Transiciones finas, resaltados de borde en lugar de parpadeos intrusivos. Las tarjetas deben tener un `active` state con offset 0 para simular presión mecánica robusta.
