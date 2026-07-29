import type {
    ListeningOption,
    ListeningQuestion,
    ListeningQuestionProgress,
    ListeningSkill,
    ListeningSkillCode,
    ListeningSkillProgress,
    ListeningUnit,
} from "./listening";

const option = (id: "A" | "B" | "C" | "D", text: string): ListeningOption => ({ id, text });

export const LISTENING_SKILLS: ListeningSkill[] = [
    { code: "gist", name_es: "Idea principal", description_es: "Reconocer de qué trata una conversación o charla." },
    { code: "detail", name_es: "Detalle", description_es: "Retener datos, condiciones, fechas y acciones concretas." },
    { code: "inference", name_es: "Inferencia", description_es: "Entender lo que se da a entender sin decirlo de forma literal." },
    { code: "function", name_es: "Función", description_es: "Identificar por qué el hablante usa una frase o pregunta." },
    { code: "idiom", name_es: "Expresión", description_es: "Resolver expresiones comunes por el contexto." },
    { code: "attitude", name_es: "Actitud", description_es: "Detectar la postura, sorpresa o preocupación del hablante." },
    { code: "organization", name_es: "Organización", description_es: "Seguir cómo una charla presenta y conecta sus ideas." },
];

const quick = (id: string, title: string, difficulty: 1 | 2 | 3, transcript: string, seconds: number): ListeningUnit => ({
    id,
    title,
    kind: "quick",
    source_kind: "short_conversation",
    difficulty,
    audio_path: `/audio/toefl-listening/${id}.mp3`,
    duration_seconds: seconds,
    transcript,
    note_prompt_es: "Escucha una vez. No necesitas escribir todo: atrapa la intención y la pista decisiva.",
    accent: "north_american",
    content_version: 1,
    is_published: true,
});

const long = (id: string, title: string, source_kind: ListeningUnit["source_kind"], difficulty: 1 | 2 | 3, transcript: string, seconds: number): ListeningUnit => ({
    id,
    title,
    kind: "long",
    source_kind,
    difficulty,
    audio_path: `/audio/toefl-listening/${id}.mp3`,
    duration_seconds: seconds,
    transcript,
    note_prompt_es: "Toma notas ligeras: tema, cambios, razones y ejemplos. No persigas cada palabra.",
    accent: "north_american",
    content_version: 1,
    is_published: true,
});

export const LISTENING_UNITS: ListeningUnit[] = [
    quick("quick-library-hours", "Horarios de biblioteca", 1, "Woman: I thought the library closed at eight tonight. Man: Usually it does, but during final exams it stays open until ten. Narrator: What does the man mean?", 11),
    quick("quick-adviser-appointment", "La cita con el asesor", 1, "Man: Can I see Professor Morales this afternoon? Woman: Her office hours are over, but she said students with registration problems can email her. Narrator: What does the woman suggest that the man do?", 14),
    quick("quick-cafeteria-line", "La fila de la cafetería", 2, "Woman: I was going to get lunch here, but look at that line. Man: The sandwich shop across the street is usually quieter at this hour. Narrator: What will the woman probably do?", 12),
    quick("quick-printing-fee", "La cuota de impresión", 2, "Man: Why did the computer lab charge me for printing? Woman: The first twenty pages are free. After that, the system deducts money from your student account. Narrator: What does the woman mean?", 12),
    quick("quick-lab-report", "El reporte de laboratorio", 2, "Woman: Are you almost done with the chemistry report? Man: I have the results, but I still need to explain why the second trial was different. Narrator: What does the man imply?", 12),
    quick("quick-dorm-repair", "La reparación del dormitorio", 2, "Man: The heater in my room is making that noise again. Woman: Fill out the online maintenance form before noon, and someone can come today. Narrator: Why does the woman mention noon?", 12),
    quick("quick-history-reading", "La lectura de historia", 3, "Woman: I cannot believe the professor assigned three chapters for Monday. Man: He said the third chapter is optional background, unless you are writing the extra-credit response. Narrator: What does the man mean?", 14),
    quick("quick-bookstore-order", "El pedido de la librería", 1, "Man: Has my economics textbook arrived yet? Woman: The shipment came this morning, but we have not unpacked the boxes. Try again after lunch. Narrator: What will the man probably do?", 12),
    quick("quick-music-ensemble", "El ensamble de música", 3, "Woman: I thought the rehearsal was cancelled. Man: It was moved to the smaller hall, so it is still on, just not where we usually meet. Narrator: What does the man mean?", 11),
    quick("quick-deadline-extension", "La extensión", 3, "Man: Do you think Professor Chen will give us more time for the essay? Woman: She already moved the deadline once, so I would not count on it. Narrator: What does the woman mean by saying, I would not count on it?", 14),
    quick("quick-campus-map", "El mapa del campus", 1, "Woman: Is the science building far from here? Man: It is behind the art museum. If you can see the clock tower, you are already halfway there. Narrator: What does the man imply?", 12),
    quick("quick-group-presentation", "La presentación grupal", 3, "Man: I can make the slides, but someone else should introduce the topic. Woman: Fine. You have a good eye for design, and I have already practiced the opening. Narrator: What will the woman probably do?", 12),
    long("long-field-study", "Una salida de campo", "campus_conversation", 2, "Man: Hi, I am here about the environmental science field trip. I signed up last month, but I just noticed that it starts before the buses run from my neighborhood. Woman: You are in Professor Patel's section, right? The department arranged a van from the east parking lot at seven fifteen. Man: I did not see that in the announcement. Woman: It was added after students mentioned the transportation problem. You need to reserve a seat by Thursday because there are only twelve spaces. Man: That helps. Is there anything else I should bring? Woman: The lab will provide the sampling equipment. Just wear shoes that can get wet and bring your student ID. The weather forecast says it may rain, but the trip will go ahead unless there is lightning. Man: So if it rains, we still collect the samples? Woman: Exactly. In fact, comparing the stream after rain is one reason the professor chose this week. Man: Then I will reserve a van seat today. Narrator: Now answer the questions.", 65),
    long("long-bee-navigation", "Cómo se orientan las abejas", "academic_talk", 3, "Professor: Today we will look at how honeybees tell other bees where food is located. For a long time, researchers noticed that a returning bee performs a repeated movement inside the hive. This movement is called the waggle dance. The direction of the dance indicates the direction of the food source relative to the sun. The length and energy of the central movement provide information about distance. At first, this explanation seemed almost too simple. But when scientists moved food sources and observed the dancers, the changes in the dance matched the new locations. Of course, the dance is not the only source of information. Bees can also use scent left on flowers, and they learn features of the landscape around the hive. The important point is that the dance gives other bees a useful starting point. It does not function like a printed map with exact coordinates. Instead, it helps a bee begin searching in the right direction and at roughly the right distance. This is a good example of animal communication being both precise and flexible. Narrator: Now answer the questions.", 70),
    long("long-city-market", "Un mercado y la ciudad", "academic_talk", 2, "Professor: When historians study an old city, they often begin with its public buildings: temples, government offices, and walls. But market areas can reveal just as much about everyday life. A market brings together people who may otherwise have little reason to meet. Farmers bring food from outside the city, craftspeople sell objects they have made, and travelers exchange news from distant places. Because of this, markets can influence a city's growth in more than one way. First, they make trade more efficient by concentrating buyers and sellers in one location. Second, they create regular paths through the city. Streets near an active market may become wider or more permanent because so many people use them. Finally, governments often begin to regulate markets by setting weights, collecting taxes, or inspecting goods. These rules tell historians what leaders considered important. So, a market is not simply a place to buy food. It is a meeting point where economic activity, movement, and political control become visible at the same time. Narrator: Now answer the questions.", 109),
];

const question = (
    id: string,
    unit_id: string,
    order_index: number,
    primary_skill_code: ListeningSkillCode,
    difficulty: 1 | 2 | 3,
    prompt: string,
    options: ListeningOption[],
    correct_option_id: "A" | "B" | "C" | "D",
    explanation_es: string,
    evidence: string,
): ListeningQuestion => ({ id, unit_id, order_index, primary_skill_code, difficulty, prompt, options, correct_option_id, explanation_es, evidence });

export const LISTENING_QUESTIONS: ListeningQuestion[] = [
    question("q-library-hours", "quick-library-hours", 1, "inference", 1, "What does the man mean?", [option("A", "The library is closed tonight."), option("B", "The library closes later than usual."), option("C", "Final exams end at ten."), option("D", "The woman should return tomorrow.")], "B", "La pista es usually: ocho es el horario normal; durante exámenes la biblioteca cierra a las diez.", "during final exams it stays open until ten"),
    question("q-adviser-appointment", "quick-adviser-appointment", 1, "function", 1, "What does the woman suggest that the man do?", [option("A", "Visit the professor tomorrow."), option("B", "Ask another student for help."), option("C", "Send the professor an email."), option("D", "Change his registration online.")], "C", "Ella ofrece la alternativa disponible después de office hours: escribir un correo por el problema de inscripción.", "students with registration problems can email her"),
    question("q-cafeteria-line", "quick-cafeteria-line", 1, "inference", 2, "What will the woman probably do?", [option("A", "Wait in the cafeteria line."), option("B", "Eat at the sandwich shop."), option("C", "Return after class."), option("D", "Skip lunch.")], "B", "El hombre propone otra opción más tranquila justamente por la fila larga; esa es la acción más probable.", "The sandwich shop across the street is usually quieter"),
    question("q-printing-fee", "quick-printing-fee", 1, "detail", 2, "What does the woman mean?", [option("A", "The lab charged the man by mistake."), option("B", "Only faculty may print for free."), option("C", "The man has already used the free pages."), option("D", "The printer is out of paper.")], "C", "La regla es veinte páginas gratis; después se cobra. La inferencia es que ya rebasó esas veinte.", "After that, the system deducts money"),
    question("q-lab-report", "quick-lab-report", 1, "inference", 2, "What does the man imply?", [option("A", "He has not started the report."), option("B", "He still has part of the report to complete."), option("C", "He lost the results of the trial."), option("D", "He needs a new lab partner.")], "B", "Ya tiene los resultados, pero falta explicar una diferencia; por eso el reporte no está terminado.", "I still need to explain why the second trial was different"),
    question("q-dorm-repair", "quick-dorm-repair", 1, "function", 2, "Why does the woman mention noon?", [option("A", "To explain when the maintenance office opens."), option("B", "To tell the man when he can get help today."), option("C", "To remind the man of a class deadline."), option("D", "To say that the heater will be repaired at noon.")], "B", "Noon es un límite: si llena el formulario antes, alguien puede ir ese mismo día.", "before noon, and someone can come today"),
    question("q-history-reading", "quick-history-reading", 1, "detail", 3, "What does the man mean?", [option("A", "All three chapters are required."), option("B", "The extra-credit response is no longer available."), option("C", "The third chapter is required only in one situation."), option("D", "The professor assigned fewer chapters than expected.")], "C", "La tercera lectura es opcional salvo para quien escriba la respuesta de crédito extra.", "optional background, unless you are writing the extra-credit response"),
    question("q-bookstore-order", "quick-bookstore-order", 1, "inference", 1, "What will the man probably do?", [option("A", "Buy a different textbook."), option("B", "Return to the bookstore later."), option("C", "Help unpack the boxes."), option("D", "Ask his professor for a copy.")], "B", "El libro llegó pero aún no está disponible. La mujer le pide volver después de lunch.", "Try again after lunch"),
    question("q-music-ensemble", "quick-music-ensemble", 1, "inference", 3, "What does the man mean?", [option("A", "The rehearsal will occur in a different place."), option("B", "The rehearsal will be delayed."), option("C", "Only some musicians should attend."), option("D", "The hall is too small for rehearsal.")], "A", "Moved no significa cancelada: sigue en pie, pero en un salón distinto.", "it is still on, just not where we usually meet"),
    question("q-deadline-extension", "quick-deadline-extension", 1, "idiom", 3, "What does the woman mean by saying, I would not count on it?", [option("A", "She thinks an extension is unlikely."), option("B", "She does not know the deadline."), option("C", "She wants to count the essays."), option("D", "She believes the professor forgot the assignment.")], "A", "I would not count on it expresa que no conviene depender de que suceda; la extensión ya se dio una vez.", "She already moved the deadline once"),
    question("q-campus-map", "quick-campus-map", 1, "inference", 1, "What does the man imply?", [option("A", "The woman is near the science building."), option("B", "The museum is closed."), option("C", "The clock tower is behind the art museum."), option("D", "The woman should take a bus.")], "A", "Si la torre está visible, ya recorrió aproximadamente la mitad del trayecto.", "you are already halfway there"),
    question("q-group-presentation", "quick-group-presentation", 1, "function", 3, "What will the woman probably do?", [option("A", "Design the slides."), option("B", "Introduce the presentation."), option("C", "Choose a new topic."), option("D", "Practice the visual design.")], "B", "Ella ya practicó la apertura; por eso toma la introducción mientras él diseña las diapositivas.", "I have already practiced the opening"),

    question("q-field-gist", "long-field-study", 1, "gist", 2, "What is the conversation mainly about?", [option("A", "How to change environmental science sections."), option("B", "Arrangements for an environmental science field trip."), option("C", "A complaint about a bus route."), option("D", "How to borrow sampling equipment.")], "B", "El estudiante consulta transporte, equipo, ropa y clima para la salida de campo.", "the environmental science field trip"),
    question("q-field-van", "long-field-study", 2, "detail", 2, "Why must the man reserve a van seat by Thursday?", [option("A", "The professor needs to change the trip date."), option("B", "The van leaves from a different parking lot."), option("C", "The number of seats is limited."), option("D", "Students must pay for the van in advance.")], "C", "La razón explícita es que solo hay doce espacios.", "there are only twelve spaces"),
    question("q-field-rain", "long-field-study", 3, "inference", 2, "What can be inferred about the field trip?", [option("A", "It will be cancelled if rain is expected."), option("B", "Rain may help the students collect useful data."), option("C", "Students must bring their own equipment if it rains."), option("D", "The stream is normally dry in July.")], "B", "La profesora eligió la semana precisamente porque comparar el arroyo después de lluvia es útil.", "one reason the professor chose this week"),
    question("q-field-function", "long-field-study", 4, "function", 2, "Why does the woman mention shoes that can get wet?", [option("A", "To recommend a brand of hiking shoes."), option("B", "To explain what students should wear for the trip."), option("C", "To tell the man that the van floor is wet."), option("D", "To warn that the laboratory has a dress code.")], "B", "La mujer responde qué debe llevar: ropa práctica para un entorno húmedo.", "wear shoes that can get wet"),
    question("q-field-attitude", "long-field-study", 5, "attitude", 2, "What is the man’s attitude at the end of the conversation?", [option("A", "Relieved that he can attend the trip."), option("B", "Concerned about the sampling equipment."), option("C", "Surprised that the trip was cancelled."), option("D", "Unwilling to travel in rainy weather.")], "A", "Al final dice que reservará el asiento hoy: la solución de transporte resolvió su problema.", "Then I will reserve a van seat today"),

    question("q-bee-gist", "long-bee-navigation", 1, "gist", 3, "What is the lecture mainly about?", [option("A", "Why bees prefer certain flowers."), option("B", "How bees communicate the location of food."), option("C", "How bees build a hive."), option("D", "Why scientists study insect scent.")], "B", "La charla explica la waggle dance y otras pistas que guían a las abejas hacia comida.", "how honeybees tell other bees where food is located"),
    question("q-bee-direction", "long-bee-navigation", 2, "detail", 3, "According to the professor, what does the direction of the dance indicate?", [option("A", "The direction of the food source relative to the sun."), option("B", "The time when flowers open."), option("C", "The direction of the hive entrance."), option("D", "The location of the nearest water source.")], "A", "Es una relación espacial con el sol, no una dirección absoluta en el mapa.", "relative to the sun"),
    question("q-bee-experiment", "long-bee-navigation", 3, "organization", 3, "Why does the professor mention that scientists moved food sources?", [option("A", "To describe an unsuccessful experiment."), option("B", "To show evidence supporting an explanation of the dance."), option("C", "To explain why bees became confused."), option("D", "To contrast wild bees with laboratory bees.")], "B", "El ejemplo aparece después de la teoría y sirve como evidencia: los cambios de danza coincidieron con las nuevas ubicaciones.", "the changes in the dance matched the new locations"),
    question("q-bee-inference", "long-bee-navigation", 4, "inference", 3, "What can be inferred about the waggle dance?", [option("A", "It gives bees a perfectly exact destination."), option("B", "It is the only way bees find flowers."), option("C", "It helps bees begin searching in an appropriate area."), option("D", "It can be understood only by younger bees.")], "C", "No es un mapa con coordenadas exactas; orienta la búsqueda en dirección y distancia aproximadas.", "a useful starting point"),
    question("q-bee-attitude", "long-bee-navigation", 5, "attitude", 3, "How does the professor seem to view bee communication?", [option("A", "As simple but not very useful."), option("B", "As precise while still adaptable."), option("C", "As less important than scent."), option("D", "As impossible for scientists to study.")], "B", "El cierre resume la valoración: precise and flexible.", "both precise and flexible"),

    question("q-market-gist", "long-city-market", 1, "gist", 2, "What is the lecture mainly about?", [option("A", "Why modern cities should build more markets."), option("B", "What markets can reveal about the development of old cities."), option("C", "How farmers transported food in ancient times."), option("D", "Why public buildings are hard for historians to study.")], "B", "La idea central es que los mercados revelan vida cotidiana, comercio, movimiento y control político.", "market areas can reveal just as much about everyday life"),
    question("q-market-trade", "long-city-market", 2, "detail", 2, "What is one way markets influence a city’s growth?", [option("A", "They reduce the need for city streets."), option("B", "They make trade more efficient by bringing buyers and sellers together."), option("C", "They prevent travelers from entering the city."), option("D", "They replace government offices.")], "B", "El primer efecto mencionado es concentrar compradores y vendedores.", "concentrating buyers and sellers in one location"),
    question("q-market-streets", "long-city-market", 3, "inference", 2, "What can be inferred about streets near an active market?", [option("A", "They may change because many people use them regularly."), option("B", "They are usually closed to farmers."), option("C", "They are less permanent than other streets."), option("D", "They lead only to government offices.")], "A", "La alta circulación puede volverlas más anchas o permanentes.", "become wider or more permanent because so many people use them"),
    question("q-market-rules", "long-city-market", 4, "function", 2, "Why does the professor mention weights, taxes, and inspections?", [option("A", "To list goods commonly sold in markets."), option("B", "To explain how governments regulated markets."), option("C", "To show why market workers avoided cities."), option("D", "To describe how historians measure buildings.")], "B", "Son ejemplos de intervención gubernamental y muestran qué era importante para los líderes.", "governments often begin to regulate markets"),
    question("q-market-organization", "long-city-market", 5, "organization", 2, "How is the lecture organized?", [option("A", "It compares two cities and chooses the better one."), option("B", "It introduces markets, then explains several kinds of influence they have."), option("C", "It lists historical dates in chronological order."), option("D", "It presents a problem and then offers one solution.")], "B", "Primero corrige una idea limitada sobre mercados y luego desarrolla efectos: comercio, calles y regulación.", "First... Second... Finally"),
];

export const LISTENING_CATALOG = {
    skills: LISTENING_SKILLS,
    units: LISTENING_UNITS,
    questions: LISTENING_QUESTIONS,
    questionProgress: [] as ListeningQuestionProgress[],
    skillProgress: [] as ListeningSkillProgress[],
};
