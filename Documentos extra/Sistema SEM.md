# Sistema Espaciado Macitta (SEM)
> **Filosofía**: "Low Friction, Long Term" (Baja Fricción, Largo Plazo).
> El objetivo es crear un hábito sostenible donde una sesión diaria de pocos minutos sea suficiente para garantizar el dominio del idioma a largo plazo, evitando la fatiga del "burnout" por repeticiones innecesarias.

## 1. El Concepto SEM

A diferencia de los sistemas tradicionales (como Anki) que tratan cada tarjeta como un bloque binario ("La supe" o "No la supe"), el SEM entiende que el conocimiento tiene matices. Utilizamos dos variables críticas para determinar la salud de la memoria:

1.  **Precisión ($A$)**: ¿Qué porcentaje de la respuesta es correcto? (Gracias a nuestro sistema de "Slots").
2.  **Velocidad ($T$)**: ¿Qué tan rápido recuperó el usuario la información? (Retrieval Strength).

Esta combinación nos permite diferenciar entre *"Me la sé de memoria"* (Rápido y Perfecto) y *"Tuve que pensarla mucho"* (Lento y Perfecto), ajustando los repasos acorde.

---

## 2. Estructura de Datos

### La Tarjeta Fragmentada (Slots)
La unidad mínima NO es la tarjeta, es el **Slot**.
Para los verbos, cada tarjeta se compone de 3 cajoncitos:

| Slot | Contenido | Ejemplo |
| :--- | :--- | :--- |
| 1 | **Infinitivo** | *To Be* |
| 2 | **Pasado Simple** | *Was/Were* |
| 3 | **Participio** | *Been* |

Esto permite que el sistema detecte un **2/3 de aciertos** (66% de precisión), lo cual se trata muy diferente a un **0/3** (Olvido total).

---

## 3. La Matemática del Algoritmo

### A. La Matriz de Evaluación
El sistema clasifica automáticamente cada intento en 4 estados sin preguntarle al usuario:

| Precisión ($A$) | Tiempo ($T$) | Clasificación SEM | Significado |
| :--- | :--- | :--- | :--- |
| **100% (3/3)** | **< 3s** (Rayo) | **Easy (Fácil)** | Dominio total. Se aleja agresivamente. |
| **100% (3/3)** | **3s - 7s** (Fluido) | **Good (Bien)** | Memoria sana. Avance estándar. |
| **100% (3/3)** | **> 7s** (Dudoso) | **Hard (Difícil)** | Esfuerzo cognitivo alto. Requiere repaso pronto. |
| **~66% (2/3)** | *Cualquiera* | **Hard (Difícil)** | Fallo parcial. No se reinicia, pero se penaliza. |
| **< 66%** | *Cualquiera* | **Again (Olvido)** | Fallo crítico. Reinicio del ciclo. |

> *Nota: Los tiempos se ajustan dinámicamente según la longitud de la palabra para ser justos con palabras largas.*

### B. La Curva de Crecimiento (Premios)
Buscamos que una palabra se considere "Dominada" en solo **8 pasos exitosos** a lo largo de un año. Si el usuario mantiene el ritmo "Easy", la progresión es exponencial:

1.  **Hoy** (Sesión Inicial)
2.  **3 Días** (Salto inicial seguro)
3.  **1 Semana** (7 días)
4.  **2 Semanas** (16 días)
5.  **1 Mes** (35 días)
6.  **2.5 Meses** (75 días)
7.  **5 Meses** (150 días)
8.  **1 Año** (365 días) -> **DOMINADO 🏆**

### C. El Sistema de Penalización (Castigos)
Si el usuario falla en una etapa avanzada, no reiniciamos "a cero" (Día 1) a menos que sea un olvido total. Aplicamos penalizaciones porcentuales sobre el intervalo actual:

| Clasificación de Fallo | Penalización | Lógica |
| :--- | :--- | :--- |
| **Dudoso (Lento)** | **-15%** | *"Casi la pierdo".* Retrocedo un poco para reforzar. |
| **Parcial (2/3)** | **-50%** | *"Sé partes".* Retrocedo a la mitad del camino. |
| **Grave (1/3)** | **-85%** | *"La perdí".* Reinicio casi total, pero con un mínimo colchón. |
| **Olvido (0/3)** | **-100%** | *"Borrón y cuenta nueva".* Vuelve al día 1. |

Este sistema evita la frustración de perder meses de progreso por un simple error de dedo o un olvido momentáneo.

---

## 4. Implementación Técnica

### Tablas Clave
*   `cards` y `card_slots`: Estructura estática del contenido.
*   `user_items`: Guarda el estado FSRS (`stability`, `difficulty`) y la fecha `due_date`.
*   `study_logs`: Historial detallado con `time_taken_ms` y `accuracy` para auditoría futura.

### Flujo de Datos
1.  **Frontend**: Captura `inputs` y `timeMs`.
2.  **Backend**:
    *   Compara inputs con `accepted_answers`.
    *   Calcula Score final.
    *   Calcula penalización o bono.
    *   Actualiza `user_items` con la nueva fecha.
