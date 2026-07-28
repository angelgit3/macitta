# Investigación maestra: práctica adaptativa de Grammar

## 1. Resumen ejecutivo

La dirección propuesta encaja mejor con la filosofía de Macitta que un simulador
completo: sesiones pequeñas, recuperación frecuente y progreso acumulativo. El
producto debe posicionarse como un sistema de práctica adaptativa para
**Structure and Written Expression de TOEFL ITP**, no como preparación de la
sección Writing del TOEFL iBT actual.

La investigación sostiene cinco decisiones:

1. Conservar el motor SREM y separar la forma de calificar Grammar de la forma
   de calificar tarjetas.
2. Tratar cada ejercicio como unidad programable y cada habilidad gramatical
   como unidad diagnóstica.
3. Usar sesiones de cinco que mezclen vencidos, débiles y nuevos, sin ordenar
   ciegamente toda la experiencia por el puntaje más bajo.
4. Considerar “completado” un estado de salida del aprendizaje activo, no una
   promesa de dominio permanente.
5. Construir un banco editorial por cobertura. Cien reactivos sirven para el
   piloto; el núcleo recomendable es 350 y el horizonte maduro es 700 o más.

## 2. Preguntas investigadas

- ¿Qué examen y qué constructo representan los dos formatos descritos?
- ¿Qué proporción y condiciones tienen esos formatos?
- ¿Qué taxonomía cubre las habilidades que ETS declara y las que aparecen en
  muestras oficiales?
- ¿Cómo se reutiliza SREM sin castigar la lectura cuidadosa?
- ¿Qué significa completar o dominar un ejercicio?
- ¿Cómo se forma una sesión de cinco sin generar monotonía ni olvido?
- ¿Cuántos ejercicios hacen falta para medir transferencia y no memoria?
- ¿Cómo debe modelarse el contenido, el progreso y el historial?
- ¿Qué controles evitan claves incorrectas, ambigüedad, sesgo y distractores
  inútiles?
- ¿Qué métricas permiten mejorar el sistema sin inventar un score TOEFL?

## 3. Alcance real del examen

### 3.1 TOEFL ITP, no TOEFL iBT

ETS describe Structure and Written Expression como reconocimiento de elementos
estructurales y gramaticales del inglés escrito estándar. En TOEFL ITP Level 1
la sección contiene 40 reactivos y concede 25 minutos. ETS indica que el
contenido usa temas académicos y sociales diversos sin exigir conocimiento
especializado.

El TOEFL iBT actual no tiene una sección independiente con estos dos formatos.
Por ello, la UI y el contenido deben decir explícitamente “TOEFL ITP” cuando se
haga referencia al examen. “Grammar” puede seguir siendo el nombre corto del
módulo.

### 3.2 Los dos formatos

La muestra oficial confirma:

| Formato | Posiciones | Cantidad | Acción |
|---|---:|---:|---|
| Structure / sentence completion | 1–15 | 15 | Elegir la palabra o frase que completa correctamente una oración |
| Written Expression / error identification | 16–40 | 25 | Elegir uno de cuatro segmentos que debe cambiar |

La relación oficial es 37.5% completion y 62.5% error identification. Para una
sesión mixta de cinco, la aproximación natural es 2 + 3. No es una restricción:
la cola adaptativa puede apartarse de esa mezcla cuando haya vencimientos o una
necesidad concreta.

El ritmo medio de la sección oficial es de 37.5 segundos por reactivo. Este dato
sirve para modo examen y analítica; no debe convertirse en un umbral universal
de aprendizaje.

### 3.3 Qué mide y qué no mide

El formato mide reconocimiento de gramática escrita estándar. No demuestra por
sí solo que el usuario produzca espontáneamente la estructura al escribir o
hablar. Macitta debe evitar una inferencia exagerada:

- “Reconoce correctamente cláusulas relativas” es defendible.
- “Domina las cláusulas relativas en toda comunicación” no lo es.

El producto puede usar `recognition_mastery` internamente o expresar el avance
como “habilidad consolidada en ejercicios”.

## 4. Evidencia pedagógica aplicable

### 4.1 Recuperación

La práctica de recuperación mejora la retención a largo plazo frente a limitarse
a releer. Resolver un reactivo obliga a discriminar una forma correcta entre
alternativas y por ello funciona como recuperación guiada. Esto respalda una
experiencia centrada en ejercicios frecuentes.

### 4.2 Espaciado

La síntesis de Cepeda y colaboradores reunió cientos de experimentos y encontró
una ventaja consistente de distribuir las oportunidades de aprendizaje. El
intervalo apropiado depende del tiempo durante el cual se desea retener. Esto
respalda SREM y contradice la idea de otorgar dominio por dos intentos
consecutivos en el mismo minuto.

### 4.3 Intercalado

Intercalar categorías puede mejorar la discriminación entre conceptos parecidos.
En Grammar importa distinguir, por ejemplo, una cláusula relativa de una
aposición o un adjetivo de un adverbio. La cola debe evitar bloques demasiado
largos de una misma microhabilidad en la práctica general.

El intercalado no significa caos. El usuario puede elegir una práctica enfocada
cuando quiere aprender una regla; la cola diaria predeterminada sí debe mezclar.

### 4.4 Retroalimentación

La retroalimentación posterior a reactivos de opción múltiple reduce el riesgo de
retener distractores y mejora la corrección de errores. También puede beneficiar
respuestas correctas de baja confianza. Por eso la experiencia debe:

- confirmar la selección;
- mostrar la forma corregida;
- nombrar la regla;
- explicar por qué la opción elegida es incorrecta;
- no obligar a esperar hasta el final de cinco para aprender del error.

### 4.5 Límites de la evidencia

Los efectos de recuperación y espaciado están muy establecidos, pero no existe
evidencia que valide directamente los pesos exactos de la cola propuesta para
Macitta. La selección inicial es una hipótesis de producto que debe medirse y
ajustarse.

## 5. Auditoría de Macitta

### 5.1 Lo reutilizable

El SREM actual ya ofrece:

- curva de nueve pasos: 0, 1, 3, 7, 16, 35, 75, 150 y 365 días;
- estados `new`, `learning`, `review` y `mastered`;
- dificultad de 1 a 10;
- historial de lapsos;
- penalización según tiempo real desde el último repaso;
- protección contra promoción excesiva tras fallos;
- cola normal por vencimiento;
- Rush Mode con una puntuación de debilidad;
- persistencia offline-first y sincronización diferida.

No hace falta inventar otro planificador.

### 5.2 Lo que no debe reutilizarse literalmente

El adaptador de tarjetas calcula `Easy`, `Good`, `Hard` o `Again` con exactitud
por slots y tiempo de respuesta. En Grammar la exactitud es binaria y el tiempo
varía por:

- longitud de oración;
- cantidad de cláusulas;
- dificultad léxica;
- formato completion o error identification;
- accesibilidad y dispositivo.

Aplicar los umbrales actuales de 3 y 7 segundos convertiría muchas respuestas
correctas en `Hard`. Eso sería una penalización de lectura, no de gramática.

### 5.3 Estado remoto actual

Supabase contiene dos “exámenes” de Grammar y siete preguntas, todas de sentence
completion. No hay ejercicios de error identification. El contenido es
insuficiente para una cola adaptativa o un diagnóstico por habilidad.

Se confirmó además un reactivo con clave incorrecta: la oración que inicia con
una frase participial sobre terminar un experimento marca como correcta una
continuación pasiva cuyo sujeto gramatical es “the data”. Esa construcción deja
el modificador sin referente lógico; la opción con “the research team” como
sujeto es la correcta. Este reactivo debe retirarse o corregirse antes de
cualquier reutilización.

Conclusión: los siete reactivos actuales son material de prototipo, no semilla
editorial confiable.

### 5.4 Modelo remoto actual

`questions` pertenece obligatoriamente a `exams`, y
`user_question_answers` pertenece a un intento de examen. `user_items` solo
acepta `card_id`. Forzar Grammar dentro de cualquiera de esos modelos produciría
acoplamiento artificial:

- un ejercicio no necesita un examen;
- una revisión no debe crear un intento TOEFL completo;
- una tarjeta y un ejercicio tienen payloads y feedback diferentes;
- una clave polimórfica perdería integridad referencial.

La recomendación es compartir el motor SREM en código y mantener tablas de
progreso específicas para Grammar.

## 6. Taxonomía propuesta

### 6.1 Principios

La taxonomía combina:

- descriptores oficiales de ETS por bandas A2–C1;
- patrones observados en dos pruebas oficiales de práctica;
- organización habitual de gramática pedagógica;
- English Grammar Profile, que deriva descriptores de corpus de aprendices.

CEFR no prescribe una lista universal de gramática. El English Grammar Profile
es una referencia descriptiva basada en usos reales, no una secuencia rígida.
Macitta debe almacenar CEFR como banda orientativa y validar su dificultad con
datos propios.

Cada ejercicio tendrá:

- una microhabilidad primaria;
- cero o más habilidades secundarias;
- un nivel CEFR orientativo;
- dificultad propia de 1 a 3;
- formato;
- tipo de error o distractor.

CEFR y dificultad no son lo mismo: una regla A2 puede aparecer en una oración
difícil y una estructura C1 puede presentarse en un reactivo relativamente
transparente.

### 6.2 Siete dominios y 35 microhabilidades

| Dominio | Código | Microhabilidad |
|---|---|---|
| Arquitectura de oración | `SEN_COMPLETE` | Completitud de sujeto y predicado |
|  | `SEN_WORD_ORDER` | Orden canónico de constituyentes |
|  | `SEN_EXPLETIVE` | `there`/`it` expletivos |
|  | `SEN_INVERSION` | Inversión tras negativos, énfasis o condición |
|  | `SEN_BOUNDARY` | Coordinación y límites entre cláusulas |
| Sistema verbal | `VERB_AGREEMENT` | Concordancia sujeto-verbo |
|  | `VERB_TENSE` | Tiempo y referencia temporal |
|  | `VERB_ASPECT` | Perfecto y progresivo |
|  | `VERB_VOICE` | Voz pasiva y causativos |
|  | `VERB_MODAL` | Modales y modalidad |
|  | `VERB_SUBJUNCTIVE` | Subjuntivo y mandatos formales |
|  | `VERB_COMPLEMENT` | Infinitivo, gerundio y forma base |
|  | `VERB_TRANSITIVITY` | Objetos y complementos requeridos |
| Cláusulas y reducción | `CLAUSE_NOUN` | Cláusulas nominales y preguntas indirectas |
|  | `CLAUSE_RELATIVE` | Relativas restrictivas y no restrictivas |
|  | `CLAUSE_ADVERB` | Cláusulas adverbiales y conectores |
|  | `CLAUSE_REDUCED_REL` | Relativas reducidas |
|  | `CLAUSE_REDUCED_ADV` | Adverbiales reducidas |
|  | `CLAUSE_PARTICIPIAL` | Frases participiales y modificadores colgantes |
| Frase nominal | `NOUN_NUMBER` | Número y sustantivos contables/no contables |
|  | `NOUN_ARTICLE` | Artículos y determinantes |
|  | `NOUN_QUANTIFIER` | Cuantificadores y expresiones partitivas |
|  | `NOUN_PRONOUN` | Pronombres, posesivos y referencia |
|  | `NOUN_APPOSITION` | Aposición y modificación nominal |
| Modificación | `MOD_ADJ_ADV` | Elección adjetivo/adverbio |
|  | `MOD_ORDER` | Orden y posición de modificadores |
|  | `MOD_COMPARISON` | Comparativos, superlativos y grado |
|  | `MOD_ATTACHMENT` | Alcance, referencia y modificadores colgantes |
| Morfología y gramática léxica | `LEX_WORD_FORM` | Derivación y categoría morfológica |
|  | `LEX_PREPOSITION` | Preposiciones y preposiciones dependientes |
|  | `LEX_COLLOCATION` | Colocaciones y phrasal verbs |
|  | `LEX_IDIOM` | Construcciones fijas e idiomáticas |
| Estructura lógica | `LOGIC_PARALLEL` | Paralelismo |
|  | `LOGIC_CORRELATIVE` | Pares correlativos |
|  | `LOGIC_NEGATION` | Negación, alcance y concordancia negativa |

El catálogo propuesto contiene 35 microhabilidades. Antes de sembrar contenido
debe aprobarse y congelarse su primera versión. La regla editorial es **10
ejercicios revisados por microhabilidad**, por lo que el banco núcleo contiene
350 reactivos.

### 6.3 Bandas orientativas según ETS

| Banda | Capacidades relevantes descritas por ETS |
|---|---|
| A2 | Tiempos frecuentes, sujeto singular/plural sencillo, linking verbs, objetos nominales, comparativos, conjunciones y preposiciones comunes |
| B1 | Tiempos comunes y pasiva, `there`, complementos verbales, cláusulas con conectores comunes, sujeto y verbo separados moderadamente |
| B2 | Formación de palabras, participios, relativas, aposiciones, usos menos frecuentes, preposiciones dependientes y excepciones |
| C1 | Tiempos menos frecuentes, subjuntivo, cláusulas reducidas, interacción de múltiples elementos, inversiones, abstracción y formalidad |

Estas bandas sirven para ordenar contenido, no para convertir automáticamente el
progreso de Macitta en una certificación CEFR.

## 7. Diseño del banco de ejercicios

### 7.1 Cantidad

| Etapa | Tamaño | Propósito |
|---|---:|---|
| Lote de calibración | 30–50 | Probar renderer, esquema y revisión |
| Piloto útil | 100 | Validar sesión, feedback y sincronización |
| Banco núcleo | 350 | 10 por cada una de 35 microhabilidades |
| Banco maduro | 700+ | 20 o más por microhabilidad |

Cien ejercicios producen solo 20 sesiones de primera exposición. También dejan
muy pocas variantes cuando se distribuyen por habilidad, formato y dificultad.
Por eso son una fase, no el destino.

### 7.2 Distribución

En el banco global se buscará la proporción de formato 37.5/62.5 de ETS. No cada
microhabilidad admite ambos formatos con igual naturalidad. La cobertura debe
priorizar validez lingüística sobre simetría.

Para cada microhabilidad:

- mínimo 10 ejercicios en el núcleo;
- al menos 3 contextos léxicos distintos;
- al menos 3 niveles de complejidad cuando la habilidad lo permita;
- más de una posición de respuesta correcta;
- distractores ligados a errores plausibles;
- nunca dos reactivos que cambien solo nombres propios.

### 7.3 Payload por formato

`sentence_completion`:

- oración con exactamente un espacio;
- cuatro opciones;
- una sola continuación correcta;
- oración completa corregida;
- regla y explicación;
- retroalimentación opcional por distractor.

`error_identification`:

- oración segmentada;
- exactamente cuatro segmentos seleccionables A–D;
- exactamente uno que debe cambiar;
- sustitución correcta del segmento;
- oración completa corregida;
- explicación de la regla;
- retroalimentación por segmentos plausibles.

Los segmentos deben ser datos, no HTML preconstruido. Así se conservan
accesibilidad, selección por teclado, lectores de pantalla y estilos responsivos.

### 7.4 Temas

Los temas pueden ser académicos y sociales, pero el conocimiento del tema nunca
debe ser necesario para responder. Se debe:

- evitar jerga rara salvo que no afecte la decisión gramatical;
- repartir ciencias, artes, vida universitaria, historia y situaciones cotidianas;
- evitar estereotipos culturales;
- evitar contenido sensible innecesario;
- usar inglés estadounidense estándar compatible con el objetivo;
- mantener una longitud calibrada por dificultad.

### 7.5 Originalidad

Las muestras oficiales se usan para estudiar formato y constructo. Los reactivos
publicados en Macitta serán originales. La aplicación no debe copiar bancos
oficiales ni usar lenguaje que sugiera afiliación o aprobación de ETS.

## 8. Calidad editorial

### 8.1 Regla de publicación

Ningún reactivo pasa directamente de generación a producción. El pipeline es:

1. Borrador original.
2. Validación automática de esquema.
3. Revisión lingüística de clave y explicación.
4. Revisión independiente de ambigüedad, accesibilidad y sesgo.
5. Prueba en lote de calibración.
6. Publicación versionada.
7. Monitoreo psicométrico.
8. Corrección mediante nueva versión o retiro.

### 8.2 Checklist lingüístico

- Hay exactamente una respuesta defendible.
- La oración corregida es natural, no solo técnicamente posible.
- La habilidad primaria es realmente necesaria para resolver.
- El vocabulario no decide accidentalmente la respuesta.
- Los distractores son plausibles y pertenecen a la misma dimensión.
- Longitud o estilo no revelan la respuesta.
- La explicación menciona la regla y la aplica a la oración.
- En error identification solo un segmento requiere cambio.
- La corrección no introduce un segundo error.
- No existe modificador colgante ni antecedente ambiguo no intencional.

### 8.3 Validaciones automáticas

- ID estable y único.
- Formato permitido.
- Código de habilidad existente.
- CEFR y dificultad válidos.
- Cuatro opciones o segmentos A–D.
- Una clave correcta.
- Opciones no duplicadas.
- Un blank en completion.
- Cuatro segmentos seleccionables en error identification.
- Oración corregida presente.
- Explicación con longitud mínima.
- Balance de claves A–D por lote.
- Cobertura mínima por habilidad, formato y dificultad.
- Detección de texto duplicado o casi duplicado.
- Prohibición de marcas o frases de fuente protegida.

### 8.4 Monitoreo después de publicar

Con una muestra suficiente:

- tasa de acierto por primera exposición;
- tasa de acierto por revisión;
- selección de cada distractor;
- distractores no funcionales;
- tiempo mediano por formato y dificultad;
- discriminación entre usuarios de desempeño alto y bajo;
- frecuencia de reportes de ambigüedad;
- lapsos posteriores a consolidación.

No se debe retirar automáticamente un reactivo solo por ser difícil. Primero se
revisa si mide una habilidad avanzada o si está defectuoso.

## 9. Adaptación de SREM

### 9.1 Separar transición y calificación

El motor debe evolucionar hacia:

- una función común que aplica una calificación SREM al estado;
- un adaptador de tarjetas que calcula grado con slots y tiempo;
- un adaptador de Grammar que calcula grado con corrección binaria.

Esto evita duplicar intervalos y conserva las pruebas existentes.

### 9.2 Calificación V1

| Resultado | Grado SREM | Razón |
|---|---|---|
| Correcto en el primer intento | `Good` | Evidencia válida de reconocimiento |
| Incorrecto | `Again` | Fallo de reconocimiento |
| Corrección después de ver feedback | No actualiza SREM | Es aprendizaje asistido, no recuperación |
| Respuesta lenta pero correcta | `Good` | El tiempo aún no está calibrado |

`Hard` y `Easy` quedan disponibles para una fase posterior. Podrían depender de
pistas, confianza y tiempos normalizados por reactivo, pero no de umbrales
globales arbitrarios.

### 9.3 Completado frente a dominado

Con la curva actual:

- Paso 0: nuevo.
- Paso 1: aprendiendo.
- Paso 2–7: completado/consolidación.
- Paso 8: dominado.

Dos respuestas `Good` en encuentros vencidos separados llevan del paso 0 al 2.
Esto materializa la idea de “dos puntos”:

- el reactivo sale de la cola de aprendizaje frecuente;
- aparece en Completados;
- conserva una fecha futura;
- cuando venza puede volver como mantenimiento;
- un fallo posterior lo devuelve a una práctica más frecuente.

Dos selecciones correctas dentro de la misma sesión no cuentan como dos repasos.

### 9.4 Progreso por habilidad

No se debe promediar únicamente el puntaje de los ejercicios vistos; eso premia
evitar contenido nuevo. Las métricas recomendadas son:

- `coverage`: ejercicios vistos / publicados;
- `consolidated`: ejercicios en paso 2 o superior;
- `mastered`: ejercicios en paso 8;
- `first_try_accuracy`: precisión de primera exposición;
- `review_accuracy`: precisión en revisiones;
- `due_count`: ejercicios vencidos;
- `lapse_rate`: proporción de repasos que regresan a Again.

La UI puede traducirlas a:

- Sin explorar.
- En desarrollo.
- Consistente.
- Fuerte.

Los umbrales definitivos deben calibrarse con datos, no venderse como nivel CEFR.

## 10. Cola adaptativa de cinco

### 10.1 Orden de elegibilidad

1. Ejercicios vencidos.
2. Ejercicios con lapsos y alta dificultad.
3. Ejercicios nuevos de habilidades con baja cobertura.
4. Mantenimiento vencido de ejercicios completados o dominados.

### 10.2 Composición

- Si hay cinco o más vencidos: la sesión atiende el atraso antes de añadir nuevos.
- Si hay menos de cinco vencidos: se completan los espacios restantes con
  contenido nuevo; así un usuario nuevo recibe un grupo completo de cinco.
- Si no hay vencidos: se ofrecen cinco nuevos o una mezcla de nuevos y
  mantenimiento disponible.
- No más de dos ejercicios del mismo dominio en una sesión general.
- Evitar dos ejercicios consecutivos con la misma microhabilidad.
- Aproximar 2 completion + 3 error identification cuando el conjunto elegible lo
  permita.
- No repetir el mismo ejercicio el mismo día después de mostrar su respuesta.

### 10.3 Desempate

Entre candidatos equivalentes:

1. fecha de vencimiento más antigua;
2. más lapsos;
3. mayor dificultad SREM;
4. habilidad globalmente más débil;
5. menor exposición total;
6. variación pseudoaleatoria estable.

La variación estable evita que dos recargas cambien toda la sesión y permite
reproducir errores.

### 10.4 Modos

- **Repaso diario**: cola adaptativa descrita arriba.
- **Practicar una habilidad**: filtro elegido por el usuario, sin falsear el
  estado SREM.
- **Errores recientes**: práctica adicional tipo Rush; registra intento, pero no
  debe adelantar fechas por repetición masiva.
- **Completados**: exploración manual; por defecto no modifica SREM salvo que el
  ejercicio esté vencido.

## 11. Experiencia de usuario

### 11.1 Inicio de Grammar

Debe mostrar:

- CTA “Repasar 5”.
- Ejercicios para hoy.
- Nuevos disponibles.
- Completados.
- Resumen por dominio.
- Acceso a practicar una habilidad.

No debe abrir con una pared de 350 ejercicios ni con una elección de examen.

### 11.2 Ejercicio

- Progreso 1/5.
- Nombre discreto de la habilidad, opcional durante diagnóstico.
- Oración y selección accesible.
- Sin temporizador visible por defecto.
- Feedback inmediato.
- Forma corregida.
- Explicación breve en español y ejemplo en inglés.
- Botón continuar.

Mostrar la habilidad antes de responder puede dar una pista. En la cola general
se recomienda revelarla después de contestar; en práctica enfocada sí puede
mostrarse desde el inicio.

### 11.3 Resumen

- Aciertos de primera intención.
- Ejercicios que avanzaron.
- Ejercicios que necesitan volver.
- Habilidad destacada.
- CTA “Otros 5”.
- Salida clara sin castigar al usuario.

No mostrar score 0–30 ni conversión TOEFL en esta experiencia.

### 11.4 Completados

La zona permite:

- filtrar por dominio y habilidad;
- ver estado SREM y próximo mantenimiento;
- practicar manualmente;
- entender que un elemento puede volver cuando toque reforzarlo;
- distinguir completado de dominado.

## 12. Datos y sincronización

### 12.1 Entidades recomendadas

- `grammar_domains`: catálogo estable de dominios.
- `grammar_skills`: microhabilidades y banda orientativa.
- `grammar_exercises`: contenido versionado.
- `grammar_exercise_skills`: etiquetas secundarias.
- `grammar_user_progress`: proyección SREM por usuario y ejercicio.
- `grammar_sessions`: grupos de cinco.
- `grammar_attempts`: historial append-only.

### 12.2 Payload de contenido

La metadata consultable debe ser relacional. El prompt específico del formato
puede ser `jsonb` porque su forma varía entre blank y segmentos. El payload se
valida con una unión discriminada compartida en TypeScript y con constraints
básicos en Postgres.

No conviene almacenar toda la taxonomía dentro de JSON: se perderían integridad,
joins, filtros e índices.

### 12.3 Progreso

Campos esenciales:

- `user_id`;
- `exercise_id`;
- `step`;
- `interval_days`;
- `difficulty`;
- `reps`;
- `lapses`;
- `state`;
- `last_review_at`;
- `due_at`;
- `first_seen_at`;
- `correct_attempts`;
- `total_attempts`;
- `revision`;
- `updated_at`.

Clave primaria compuesta: `(user_id, exercise_id)`.

Índices:

- `(user_id, due_at)` para la cola;
- parcial sobre `(user_id, due_at)` donde el estado no sea `mastered`, si el
  patrón real de consulta lo justifica;
- `exercise_id` para joins y cascadas;
- foreign keys en todas las relaciones.

### 12.4 Intentos

Cada intento usa un UUID generado en cliente y contiene:

- usuario, ejercicio y sesión;
- opción seleccionada;
- corrección;
- grado SREM;
- paso anterior y posterior;
- tiempo de respuesta;
- si estaba vencido;
- versión de contenido;
- timestamp del cliente y del servidor.

La inserción debe ser idempotente (`on conflict do nothing`). El historial no se
actualiza ni se borra durante sincronización normal.

### 12.5 Offline-first

1. Descargar catálogos y contenido publicado a Dexie.
2. Construir la cola desde progreso local.
3. Guardar intento y proyección inmediatamente.
4. Encolar el intento y el upsert de progreso.
5. Sincronizar eventos antes de confirmar la proyección.
6. Resolver conflictos mediante `revision` o reconstrucción ordenada.

Para V1 puede aceptarse last-write-wins en un solo dispositivo, pero el esquema
de eventos debe permitir evolucionar a replay sin migrar todo el historial.

### 12.6 Seguridad

- RLS activa en todas las tablas expuestas.
- Catálogos y ejercicios: `SELECT` para `authenticated`.
- Progreso, sesiones e intentos: solo el usuario propietario.
- Políticas con `to authenticated`.
- Comparaciones con `(select auth.uid())`.
- Índice en `user_id`.
- `SELECT`, `INSERT` y `UPDATE` coherentes para upsert.
- Ninguna clave `service_role` en cliente.

## 13. Analítica

### 13.1 Aprendizaje

- Sesiones iniciadas y completadas.
- Ejercicios por día y semana.
- Precisión de primera exposición y de repaso.
- Retención después de 1, 3, 7, 16 y 35 días.
- Tasa de lapsos.
- Tiempo hasta completar un ejercicio.
- Cobertura y consolidación por habilidad.

### 13.2 Producto

- Porcentaje que termina el primer grupo de cinco.
- Porcentaje que elige “Otros 5”.
- Días activos con Grammar.
- Retorno a 1, 7 y 30 días.
- Tamaño de atraso vencido.
- Uso de Completados y práctica enfocada.

### 13.3 Contenido

- Facilidad del reactivo.
- Discriminación.
- Distractores seleccionados.
- Tiempo mediano.
- Reportes.
- Diferencias inesperadas por dispositivo o idioma base, si se cuenta con datos
  legítimos y suficientes.

## 14. Estrategia de entrega

### Fase 0: contrato y prototipo técnico

- Congelar taxonomía.
- Definir unión de payloads.
- Extraer transición SREM por grado.
- Prototipo con 30–50 ejercicios.
- Validar ambos renderers y accesibilidad.

### Fase 1: piloto de 100

- Cola de cinco.
- Feedback inmediato.
- Progreso por ejercicio.
- Completados.
- Offline y RLS.
- Métricas esenciales.
- Revisión editorial completa.

### Fase 2: banco núcleo

- Llegar a 10 reactivos por microhabilidad.
- Añadir panel por habilidad.
- Analizar distractores.
- Retirar o revisar reactivos defectuosos.

### Fase 3: madurez

- Duplicar variantes.
- Calibrar dificultad y, solo si hay evidencia, fluidez.
- Añadir diagnóstico inicial opcional.
- Evaluar una experiencia separada de simulacro construida con el mismo banco.

## 15. Decisiones que quedan por confirmar

No bloquean el inicio técnico, pero deben resolverse antes de publicar:

1. Nombre visible: “Completados”, “Consolidados” o “Aprendidos”.
2. Si el módulo conserva la ruta `/toefl` o migra a `/grammar`.
3. Si el usuario puede reportar una pregunta desde el feedback.
4. Quién realiza la segunda revisión lingüística.
5. Si el piloto se dirige primero a Level 1 completo o prioriza B1–C1.
6. Política de corrección de un reactivo que ya tiene intentos.

## 16. Fuentes

### Formato y constructo

- ETS, TOEFL ITP Test Content:
  https://www.ets.org/toefl/itp/test-content.html
- ETS, TOEFL ITP Test Taker Handbook:
  https://www.ets.org/pdfs/toefl-itp-test-taker-handbook.pdf
- ETS, TOEFL ITP Practice Tests Level 1, Volume 3:
  https://www.ets.org/s/toefl-itp/l1v3_ebook/itp-practice-test-level-1-volume-3-ebook.pdf
- ETS, TOEFL ITP Scoring:
  https://www.ets.org/toefl/itp/scoring.html
- ETS, Level 1 Score Descriptors:
  https://www.ets.org/pdfs/toefl/toefl-itp-level-1-score-descriptors.pdf

### Taxonomía

- Cambridge, English Grammar Profile methodology:
  https://www.cambridge.org/elt/blog/2015/11/11/introducing-english-grammar-profile-1-building-profile/
- Verratti-Souto et al., quantitative verification of the English Grammar
  Profile:
  https://doi.org/10.1017/S0267190525100093
- Council of Europe, CEFR descriptors:
  https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors

### Aprendizaje

- Roediger y Karpicke, Test-Enhanced Learning:
  https://doi.org/10.1111/j.1467-9280.2006.01693.x
- Cepeda et al., Distributed Practice:
  https://doi.org/10.1037/0033-2909.132.3.354
- Birnbaum et al., Why Interleaving Enhances Inductive Learning:
  https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/Birnbaum_Kornell_EBjork_RBjork_inpress.pdf
- Butler y Roediger, feedback in multiple-choice testing:
  https://pubmed.ncbi.nlm.nih.gov/18491500/

### Calidad y datos

- ETS, Best Practices for Validity and Fairness:
  https://www.ets.org/research/policy_research_reports/publications/publication/2013/jrcs.html
- ETS, Standards for Quality and Fairness:
  https://www.ets.org/pdfs/about/standards-quality-fairness.pdf
- Supabase, Row Level Security:
  https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase, Managing Indexes:
  https://supabase.com/docs/guides/database/postgres/indexes
- Supabase, JSON and unstructured data:
  https://supabase.com/docs/guides/database/json
