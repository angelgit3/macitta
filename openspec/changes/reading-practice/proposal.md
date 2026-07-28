# Reading Practice

## Problema

El simulador TOEFL existente sirve para medir una sesión completa, pero no para
construir el hábito de lectura ni aislar debilidades. Repetir el mismo pasaje
también puede medir memoria de la respuesta en lugar de transferencia.

## Cambio

Se incorpora un módulo independiente de TOEFL ITP Reading Comprehension:

- sesiones predeterminadas de cinco preguntas sobre una lectura coherente;
- lecturas largas divididas en dos bloques continuables de cinco;
- dos puntos por reactivo y una zona de completados;
- SREM por habilidad, priorizando debilidades con preguntas frescas;
- feedback inmediato, evidencia marcada y explicación de cada distractor;
- catálogo original, versionado y revisado;
- funcionamiento offline posterior a la primera carga y sincronización
  optimista al recuperar conexión.

El simulador y su historial no cambian.

