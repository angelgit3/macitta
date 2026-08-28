import type {
    GrammarDomain,
    GrammarExercise,
    GrammarOptionId,
    GrammarSkill,
} from "./grammar";

type CompletionSeed = readonly [
    id: string,
    before: string,
    after: string,
    correct: string,
    wrongs: readonly [string, string, string],
    corrected: string,
    explanation: string,
    misconception: string,
];

type ErrorSeed = readonly [
    id: string,
    a: string,
    b: string,
    c: string,
    d: string,
    wrongId: GrammarOptionId,
    corrected: string,
    explanation: string,
];

interface SkillBlueprint {
    code: string;
    name: string;
    description: string;
    cefr: GrammarSkill["cefr_min"];
    completion: readonly CompletionSeed[];
    errors: readonly ErrorSeed[];
}

interface DomainBlueprint {
    code: string;
    name: string;
    skills: readonly SkillBlueprint[];
}

export interface GrammarAuthoredReviewIssue {
    skillCode: string;
    item: number;
    declaredSegment: GrammarOptionId;
    changedSegments: GrammarOptionId[];
    original: string;
    corrected: string;
}

const c = (...seed: CompletionSeed): CompletionSeed => {
    const marker = "______";
    const markerIndex = seed[1].indexOf(marker);
    if (markerIndex < 0) return seed;
    return [
        seed[0],
        seed[1].slice(0, markerIndex),
        `${seed[1].slice(markerIndex + marker.length)}${seed[2]}`,
        seed[3],
        seed[4],
        seed[5],
        seed[6],
        seed[7],
    ];
};
const e = (...seed: ErrorSeed): ErrorSeed => seed;

const DOMAINS: readonly DomainBlueprint[] = [
    {
        code: "sentence_architecture",
        name: "Arquitectura de la oración",
        skills: [
            {
                code: "SEN_COMPLETE",
                name: "Oraciones completas",
                description: "Distinguir cláusulas completas de fragmentos y estructuras sin sujeto o verbo principal.",
                cefr: "A2",
                completion: [
                    c("30000000-0000-4000-8000-000000000001", "The new laboratory ", " near the engineering building.", "is located", ["locating", "which located", "location"], "The new laboratory is located near the engineering building.", "Una oración completa necesita un verbo finito; «is located» aporta verbo y completa el predicado.", "Las otras formas dejan la oración sin verbo principal o sustituyen el verbo por un sustantivo."),
                    c("30000000-0000-4000-8000-000000000002", "Several rare manuscripts ", " during the library renovation.", "were discovered", ["discovering", "that discovered", "the discovery"], "Several rare manuscripts were discovered during the library renovation.", "El sujeto plural «manuscripts» requiere un verbo finito; la pasiva «were discovered» forma una oración completa.", "Un participio o una cláusula relativa aislada no puede funcionar como predicado principal."),
                    c("30000000-0000-4000-8000-000000000003", "The committee's final recommendation ", " after three hours of debate.", "surprised the audience", ["surprising the audience", "which surprised the audience", "the audience's surprise"], "The committee's final recommendation surprised the audience after three hours of debate.", "«Surprised» es el verbo principal en pasado y convierte el grupo nominal inicial en una oración completa.", "Las formas no finitas y los grupos nominales crean fragmentos cuando no hay otro verbo principal."),
                    c("30000000-0000-4000-8000-000000000004", "What the researchers found ", " the original hypothesis.", "contradicted", ["contradicting", "a contradiction of", "which contradicted"], "What the researchers found contradicted the original hypothesis.", "La cláusula nominal funciona como sujeto y necesita el verbo finito «contradicted» para completar la oración.", "Aunque el sujeto sea una cláusula, el predicado aún necesita un verbo conjugado."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000005", "The annual report", "containing detailed charts", "and was distributed", "to every department.", "B", "The annual report contained detailed charts and was distributed to every department.", "Dos predicados coordinados deben compartir una forma finita; «containing» debe cambiar a «contained»."),
                    e("30000000-0000-4000-8000-000000000006", "Because the roads were icy,", "the morning buses", "arriving at the station", "more than an hour late.", "C", "Because the roads were icy, the morning buses arrived at the station more than an hour late.", "La cláusula principal carece de verbo finito; «arriving» debe ser «arrived»."),
                    e("30000000-0000-4000-8000-000000000007", "The fossils discovered in the valley", "provide important evidence", "about a species that", "once living there.", "D", "The fossils discovered in the valley provide important evidence about a species that once lived there.", "Después del sujeto relativo «that» se necesita el verbo finito «lived», no el participio «living»."),
                    e("30000000-0000-4000-8000-000000000008", "How the device operates", "still a mystery", "to many engineers", "working on the project.", "B", "How the device operates is still a mystery to many engineers working on the project.", "La cláusula nominal inicial es el sujeto y necesita la cópula «is» antes del complemento."),
                    e("30000000-0000-4000-8000-000000000009", "The lecture on marine ecosystems,", "which lasted nearly two hours,", "it attracted", "a large audience.", "C", "The lecture on marine ecosystems, which lasted nearly two hours, attracted a large audience.", "El sujeto ya es «the lecture»; el pronombre «it» crea un doble sujeto y debe eliminarse."),
                    e("30000000-0000-4000-8000-000000000010", "A collection of early photographs", "from the northern provinces", "on display", "in the main gallery.", "C", "A collection of early photographs from the northern provinces is on display in the main gallery.", "El grupo nominal necesita la cópula «is» para formar una oración completa."),
                ],
            },
            {
                code: "SEN_WORD_ORDER",
                name: "Orden de palabras",
                description: "Controlar el orden canónico y las posiciones de sujeto, verbo, objeto y adverbios.",
                cefr: "A2",
                completion: [
                    c("30000000-0000-4000-8000-000000000011", "The guide explained ", " to the visitors.", "the safety rules clearly", ["clearly the safety rules", "the clearly safety rules", "to clearly the safety rules"], "The guide explained the safety rules clearly to the visitors.", "El objeto directo «the safety rules» sigue al verbo y el adverbio de modo puede colocarse después del objeto.", "En inglés el adverbio no debe separar el determinante de su sustantivo ni introducir el objeto con «to»."),
                    c("30000000-0000-4000-8000-000000000012", "The astronomers ", " from the desert observatory.", "carefully recorded the signal", ["recorded carefully the signal", "the signal carefully recorded", "carefully the signal recorded"], "The astronomers carefully recorded the signal from the desert observatory.", "Un adverbio de modo puede aparecer antes del verbo léxico; el orden básico sigue siendo sujeto–verbo–objeto.", "Mover el objeto antes del verbo sin una construcción especial produce un orden no canónico."),
                    c("30000000-0000-4000-8000-000000000013", "Only after the inspection ", " the building.", "did the workers enter", ["the workers entered", "entered the workers", "the workers did enter"], "Only after the inspection did the workers enter the building.", "Una expresión negativa o restrictiva inicial como «only after» exige inversión auxiliar–sujeto.", "La inversión requiere «did» seguido de sujeto y verbo en forma base."),
                    c("30000000-0000-4000-8000-000000000014", "The professor asked ", " before Friday.", "the students to submit their drafts", ["to submit the students their drafts", "their drafts the students to submit", "the students their drafts submit"], "The professor asked the students to submit their drafts before Friday.", "Con «ask», el orden es verbo + persona + infinitivo con «to» + objeto del infinitivo.", "Los complementos no pueden desplazarse libremente sin alterar la estructura verbal."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000015", "The technician", "installed carefully", "the new sensor", "inside the chamber.", "B", "The technician carefully installed the new sensor inside the chamber.", "Con un objeto relativamente largo, el adverbio de modo se coloca naturalmente antes del verbo o después del objeto, no entre verbo y objeto."),
                    e("30000000-0000-4000-8000-000000000016", "The research team", "every morning checks", "the temperature", "of the storage room.", "B", "The research team checks the temperature of the storage room every morning.", "Los adverbios de frecuencia definida suelen ir al final; no deben interrumpir el orden sujeto–verbo de este modo."),
                    e("30000000-0000-4000-8000-000000000017", "The museum displayed", "in the central hall", "a sculpture", "made of recycled glass.", "B", "The museum displayed a sculpture made of recycled glass in the central hall.", "El objeto directo debe seguir al verbo antes del complemento de lugar cuando no hay razón discursiva para invertirlos."),
                    e("30000000-0000-4000-8000-000000000018", "The students wanted to know", "why had the experiment failed", "despite the careful planning", "of the research team.", "B", "The students wanted to know why the experiment had failed despite the careful planning of the research team.", "Las preguntas indirectas conservan el orden declarativo sujeto–auxiliar: «why the experiment had failed»."),
                    e("30000000-0000-4000-8000-000000000019", "The editor", "sent yesterday", "the revised manuscript", "to the publisher.", "B", "The editor sent the revised manuscript to the publisher yesterday.", "El adverbio de tiempo definido suele ir al final y no debe separar el verbo transitivo de su objeto."),
                    e("30000000-0000-4000-8000-000000000020", "The documentary shows", "how do coastal communities adapt", "to seasonal flooding", "and rising tides.", "B", "The documentary shows how coastal communities adapt to seasonal flooding and rising tides.", "Después de «how» en una cláusula subordinada se usa orden declarativo, no inversión de pregunta."),
                ],
            },
            {
                code: "SEN_EXPLETIVE",
                name: "Sujetos formales it/there",
                description: "Usar correctamente it y there como sujetos formales y concordar con el sujeto lógico.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000021", "______ several possible explanations for the sudden decline.", "", "There are", ["It is", "There is", "They are"], "There are several possible explanations for the sudden decline.", "«There» introduce existencia y el verbo concuerda con el sustantivo plural «explanations».", "«It» no introduce una lista existente y «there is» no concuerda con un sustantivo plural."),
                    c("30000000-0000-4000-8000-000000000022", "______ essential to calibrate the instrument before each use.", "", "It is", ["There is", "It has", "There are"], "It is essential to calibrate the instrument before each use.", "«It» funciona como sujeto formal antes del adjetivo y desplaza el infinitivo al final.", "La construcción existencial con «there» no puede introducir directamente un adjetivo seguido de infinitivo."),
                    c("30000000-0000-4000-8000-000000000023", "______ no evidence that the species migrated during winter.", "", "There is", ["It is", "There are", "It has"], "There is no evidence that the species migrated during winter.", "La estructura existencial usa «there is» porque «evidence» es incontable y singular gramaticalmente.", "«Evidence» no admite concordancia plural y «it» cambiaría la estructura."),
                    c("30000000-0000-4000-8000-000000000024", "______ surprising that the two samples produced identical results.", "", "It was", ["There was", "That was", "What was"], "It was surprising that the two samples produced identical results.", "«It» anticipatorio ocupa la posición de sujeto y la cláusula con «that» expresa el contenido real.", "La construcción necesita el sujeto formal «it» antes del adjetivo evaluativo."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000025", "There was", "many objections", "to the proposed schedule", "at yesterday's meeting.", "A", "There were many objections to the proposed schedule at yesterday's meeting.", "En una construcción existencial, el verbo concuerda con el grupo nominal plural «many objections»."),
                    e("30000000-0000-4000-8000-000000000026", "It are", "unlikely that the glacier", "will recover completely", "within a decade.", "A", "It is unlikely that the glacier will recover completely within a decade.", "El sujeto formal singular «it» requiere la forma singular «is»."),
                    e("30000000-0000-4000-8000-000000000027", "There appear to be", "a significant difference", "between the two methods", "used in the survey.", "A", "There appears to be a significant difference between the two methods used in the survey.", "El verbo «appears» concuerda con el sujeto lógico singular «a significant difference»."),
                    e("30000000-0000-4000-8000-000000000028", "There is", "several reasons", "why the archive", "closed early today.", "A", "There are several reasons why the archive closed early today.", "El sustantivo plural «reasons» exige «there are»."),
                    e("30000000-0000-4000-8000-000000000029", "It seems that", "the new policy", "has reduced delays", "is encouraging.", "A", "That the new policy has reduced delays is encouraging.", "La oración mezcla «it seems that» con otra cópula; la cláusula con «that» debe funcionar directamente como sujeto de «is encouraging»."),
                    e("30000000-0000-4000-8000-000000000030", "There remains", "two unresolved questions", "about the origin", "of the stone tools.", "A", "There remain two unresolved questions about the origin of the stone tools.", "Con «there» existencial, «remain» concuerda con el sujeto lógico plural «two questions»."),
                ],
            },
            {
                code: "SEN_INVERSION",
                name: "Inversión",
                description: "Aplicar inversión tras expresiones negativas, restrictivas y condicionales formales.",
                cefr: "B2",
                completion: [
                    c("30000000-0000-4000-8000-000000000031", "Rarely ______ such a well-preserved fossil before.", "", "have scientists found", ["scientists have found", "scientists found", "did scientists found"], "Rarely have scientists found such a well-preserved fossil before.", "El adverbio negativo inicial «rarely» exige inversión entre auxiliar y sujeto.", "La inversión usa auxiliar + sujeto + participio; después de «did» iría la forma base."),
                    c("30000000-0000-4000-8000-000000000032", "Not until the lights went out ______ the wiring problem.", "", "did the staff notice", ["the staff noticed", "had the staff noticed", "the staff did notice"], "Not until the lights went out did the staff notice the wiring problem.", "«Not until» al inicio activa inversión en la cláusula principal: «did + sujeto + verbo base».", "La cláusula temporal no se invierte; la inversión ocurre en el resultado principal."),
                    c("30000000-0000-4000-8000-000000000033", "Had the warning arrived earlier, ______ enough time to evacuate.", "", "the residents would have had", ["would the residents have had", "the residents had", "the residents will have"], "Had the warning arrived earlier, the residents would have had enough time to evacuate.", "La inversión «Had + sujeto + participio» sustituye a «if» en una condicional pasada.", "La cláusula de resultado mantiene orden normal y usa «would have + participio»."),
                    c("30000000-0000-4000-8000-000000000034", "Only by comparing both samples ______ the contamination.", "", "can we detect", ["we can detect", "we detect can", "can detect we"], "Only by comparing both samples can we detect the contamination.", "«Only by» al inicio exige inversión del modal «can» y el sujeto.", "El modal debe preceder al sujeto, y el verbo léxico permanece en forma base."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000035", "Never before", "researchers observed", "such rapid changes", "in the upper atmosphere.", "B", "Never before have researchers observed such rapid changes in the upper atmosphere.", "La expresión negativa inicial requiere inversión con el auxiliar perfecto «have»."),
                    e("30000000-0000-4000-8000-000000000036", "Only after the samples cooled", "the technician could", "measure their density", "with reasonable accuracy.", "B", "Only after the samples cooled could the technician measure their density with reasonable accuracy.", "«Only after» exige que el modal aparezca antes del sujeto en la cláusula principal."),
                    e("30000000-0000-4000-8000-000000000037", "No sooner had the lecture begun", "when the fire alarm", "forced everyone", "to leave the hall.", "B", "No sooner had the lecture begun than the fire alarm forced everyone to leave the hall.", "La correlación fija es «no sooner ... than», no «when»."),
                    e("30000000-0000-4000-8000-000000000038", "Should the weather improves", "the field team", "will resume work", "at sunrise.", "A", "Should the weather improve, the field team will resume work at sunrise.", "En la condicional invertida con «should», el verbo siguiente debe ir en forma base: «improve»."),
                    e("30000000-0000-4000-8000-000000000039", "Seldom the river rises", "above this level", "before the beginning", "of the rainy season.", "A", "Seldom does the river rise above this level before the beginning of the rainy season.", "«Seldom» inicial requiere «does + sujeto + verbo base»."),
                    e("30000000-0000-4000-8000-000000000040", "Under no circumstances", "visitors should touch", "the fragile textiles", "displayed in this room.", "B", "Under no circumstances should visitors touch the fragile textiles displayed in this room.", "La frase negativa inicial obliga a invertir el modal y el sujeto: «should visitors»."),
                ],
            },
            {
                code: "SEN_BOUNDARY",
                name: "Límites y conexión de oraciones",
                description: "Evitar fragmentos, run-ons y comma splices mediante coordinación y subordinación correctas.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000041", "The first trial failed; ______, the team adjusted the temperature.", "", "therefore", ["because", "although", "so that"], "The first trial failed; therefore, the team adjusted the temperature.", "Un adverbio conjuntivo como «therefore» puede unir dos oraciones independientes después de punto y coma.", "Las conjunciones subordinantes necesitarían integrarse en una sola estructura, no seguir a un punto y coma así."),
                    c("30000000-0000-4000-8000-000000000042", "______ the road was flooded, the delivery arrived on time.", "", "Although", ["Despite", "However", "Therefore"], "Although the road was flooded, the delivery arrived on time.", "«Although» introduce una cláusula concesiva completa con sujeto y verbo.", "«Despite» necesita un sustantivo o gerundio; los adverbios conjuntivos requieren otra puntuación."),
                    c("30000000-0000-4000-8000-000000000043", "The survey was repeated ______ the original sample was too small.", "", "because", ["because of", "despite", "however"], "The survey was repeated because the original sample was too small.", "«Because» introduce una cláusula con sujeto y verbo y expresa la causa.", "«Because of» y «despite» exigen grupos nominales, mientras «however» no subordina."),
                    c("30000000-0000-4000-8000-000000000044", "The device is inexpensive, ______ it performs as reliably as larger models.", "", "yet", ["because of", "unless", "therefore"], "The device is inexpensive, yet it performs as reliably as larger models.", "La conjunción coordinante «yet» conecta dos cláusulas independientes y marca contraste.", "Un adverbio conjuntivo como «therefore» no puede seguir solo a una coma entre dos oraciones."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000045", "The storm ended before dawn,", "the field crew", "began its inspection", "at seven o'clock.", "A", "The storm ended before dawn, and the field crew began its inspection at seven o'clock.", "Dos cláusulas independientes no deben unirse solo con coma; hace falta una conjunción o un punto."),
                    e("30000000-0000-4000-8000-000000000046", "Because the original map", "was drawn without accurate instruments.", "The distances between villages", "are only approximate.", "B", "Because the original map was drawn without accurate instruments, the distances between villages are only approximate.", "La cláusula con «because» no debe cerrarse como fragmento; se une a la cláusula principal con coma."),
                    e("30000000-0000-4000-8000-000000000047", "The water level dropped rapidly", "however, the bridge", "remained closed", "for another day.", "A", "The water level dropped rapidly; however, the bridge remained closed for another day.", "Antes de «however» entre dos cláusulas independientes se necesita punto y coma o punto."),
                    e("30000000-0000-4000-8000-000000000048", "Although the treatment was expensive,", "but it produced", "better results", "than the previous method.", "B", "Although the treatment was expensive, it produced better results than the previous method.", "«Although» ya marca la subordinación; añadir «but» duplica el conector."),
                    e("30000000-0000-4000-8000-000000000049", "The archive reopened in May,", "after being closed", "for structural repairs", "since nearly a year.", "D", "The archive reopened in May, after being closed for structural repairs for nearly a year.", "Una duración completa usa «for», no «since»; la coma puede conservarse si el complemento se presenta como información adicional."),
                    e("30000000-0000-4000-8000-000000000050", "The samples must remain frozen", "otherwise they may deteriorate", "before the laboratory", "can analyze them.", "A", "The samples must remain frozen; otherwise, they may deteriorate before the laboratory can analyze them.", "«Otherwise» conecta dos cláusulas independientes y necesita punto y coma o punto antes."),
                ],
            },
        ],
    },
    {
        code: "verb_system",
        name: "Sistema verbal",
        skills: [
            {
                code: "VERB_AGREEMENT",
                name: "Concordancia sujeto-verbo",
                description: "Hacer concordar el verbo con el núcleo real del sujeto en estructuras simples y complejas.",
                cefr: "A2",
                completion: [
                    c("30000000-0000-4000-8000-000000000051", "The quality of the soil samples ______ considerably across the region.", "", "varies", ["vary", "have varied", "are varying"], "The quality of the soil samples varies considerably across the region.", "El núcleo del sujeto es el singular «quality», no el sustantivo plural de la frase con «of».", "La cercanía de «samples» puede atraer erróneamente un verbo plural."),
                    c("30000000-0000-4000-8000-000000000052", "Neither the director nor the assistants ______ available this afternoon.", "", "are", ["is", "was", "has been"], "Neither the director nor the assistants are available this afternoon.", "Con «neither ... nor», el verbo suele concordar con el elemento más cercano, aquí «assistants».", "El primer sustantivo no controla necesariamente la concordancia en esta correlación."),
                    c("30000000-0000-4000-8000-000000000053", "Each of the proposals ______ a different funding strategy.", "", "requires", ["require", "requiring", "have required"], "Each of the proposals requires a different funding strategy.", "«Each» es singular aunque vaya seguido de un grupo plural con «of».", "El plural «proposals» no es el núcleo gramatical del sujeto."),
                    c("30000000-0000-4000-8000-000000000054", "A series of unexpected delays ______ the launch schedule.", "", "has affected", ["have affected", "affect", "are affecting"], "A series of unexpected delays has affected the launch schedule.", "El núcleo «series» es singular en esta expresión y requiere «has».", "El plural cercano «delays» no determina la concordancia."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000055", "The effects of the new regulation", "has become", "clearer during", "the past few months.", "B", "The effects of the new regulation have become clearer during the past few months.", "El núcleo plural «effects» requiere el auxiliar plural «have»."),
                    e("30000000-0000-4000-8000-000000000056", "Every student and instructor", "were asked", "to complete the survey", "before leaving campus.", "B", "Every student and instructor was asked to complete the survey before leaving campus.", "Cuando «every» modifica cada elemento coordinado, el sujeto se interpreta como singular distributivo."),
                    e("30000000-0000-4000-8000-000000000057", "The number of applications", "have increased", "steadily since", "the program began.", "B", "The number of applications has increased steadily since the program began.", "«The number» es un núcleo singular; se diferencia de «a number of», que suele ser plural."),
                    e("30000000-0000-4000-8000-000000000058", "There is", "several factors that influence", "the rate of evaporation", "in an open container.", "A", "There are several factors that influence the rate of evaporation in an open container.", "En la construcción existencial, el verbo concuerda con «several factors»."),
                    e("30000000-0000-4000-8000-000000000059", "One of the researchers", "who works in this laboratory", "specialize in", "marine chemistry.", "C", "One of the researchers who works in this laboratory specializes in marine chemistry.", "El sujeto principal «one» es singular y requiere «specializes»."),
                    e("30000000-0000-4000-8000-000000000060", "Neither the photographs nor the written report", "provide", "enough evidence", "to confirm the date.", "B", "Neither the photographs nor the written report provides enough evidence to confirm the date.", "El elemento más cercano al verbo, «the written report», es singular y controla la concordancia."),
                ],
            },
            {
                code: "VERB_TENSE",
                name: "Tiempos verbales",
                description: "Seleccionar tiempos verbales coherentes con relaciones temporales explícitas e implícitas.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000061", "By the time the rescue team arrived, the hikers ______ shelter.", "", "had already found", ["already found", "have already found", "were already finding"], "By the time the rescue team arrived, the hikers had already found shelter.", "El past perfect marca que encontrar refugio ocurrió antes de otra acción pasada.", "El pasado simple no expresa con igual claridad la anterioridad respecto de «arrived»."),
                    c("30000000-0000-4000-8000-000000000062", "Since the observatory opened in 1998, it ______ thousands of visitors.", "", "has welcomed", ["welcomed", "had welcomed", "welcomes"], "Since the observatory opened in 1998, it has welcomed thousands of visitors.", "«Since» con un punto inicial pasado y resultado hasta el presente favorece el present perfect.", "El pasado simple cerraría la acción y perdería la conexión con el presente."),
                    c("30000000-0000-4000-8000-000000000063", "The conference ______ next Monday at nine o'clock.", "", "begins", ["began", "has begun", "beginning"], "The conference begins next Monday at nine o'clock.", "El presente simple puede expresar horarios oficiales futuros.", "La referencia futura no obliga a usar «will» cuando se trata de un calendario establecido."),
                    c("30000000-0000-4000-8000-000000000064", "When the lights went out, the technicians ______ the final test.", "", "were conducting", ["conducted", "have conducted", "had conduct"], "When the lights went out, the technicians were conducting the final test.", "El past progressive describe una acción en curso interrumpida por un evento puntual pasado.", "La forma progresiva establece el fondo temporal en el momento del apagón."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000065", "Last year the institute", "has launched", "a program to support", "early-career researchers.", "B", "Last year the institute launched a program to support early-career researchers.", "Un tiempo pasado terminado como «last year» requiere pasado simple, no present perfect."),
                    e("30000000-0000-4000-8000-000000000066", "The river has supplied water", "to nearby farms", "until the dam was built", "in the 1960s.", "A", "The river supplied water to nearby farms until the dam was built in the 1960s.", "El período terminó en el pasado, por lo que corresponde el pasado simple."),
                    e("30000000-0000-4000-8000-000000000067", "By next June,", "the restoration team completes", "all work on", "the eastern wing.", "B", "By next June, the restoration team will have completed all work on the eastern wing.", "«By» más un punto futuro pide future perfect para una acción ya terminada entonces."),
                    e("30000000-0000-4000-8000-000000000068", "The researchers noticed that", "the solution changes color", "after it had been exposed", "to direct sunlight.", "B", "The researchers noticed that the solution had changed color after it had been exposed to direct sunlight.", "El cambio ocurrió antes de que los investigadores lo notaran; se marca con past perfect."),
                    e("30000000-0000-4000-8000-000000000069", "For the past three weeks,", "the engineers tested", "a new cooling system", "under extreme conditions.", "B", "For the past three weeks, the engineers have been testing a new cooling system under extreme conditions.", "Una actividad iniciada en el pasado y aún en curso usa present perfect progressive."),
                    e("30000000-0000-4000-8000-000000000070", "When the museum will reopen", "next spring,", "visitors will see", "the restored murals.", "A", "When the museum reopens next spring, visitors will see the restored murals.", "En cláusulas temporales futuras con «when» se usa presente simple, no «will»."),
                ],
            },
            {
                code: "VERB_ASPECT",
                name: "Aspecto y duración",
                description: "Expresar continuidad, resultado y duración con formas perfectas y progresivas.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000071", "The scientists ______ the glacier for more than a decade.", "", "have been monitoring", ["are monitoring", "had monitored", "monitor"], "The scientists have been monitoring the glacier for more than a decade.", "El present perfect progressive conecta una actividad durativa iniciada en el pasado con el presente.", "«For more than a decade» señala duración hasta ahora."),
                    c("30000000-0000-4000-8000-000000000072", "Before the replacement arrived, the old generator ______ continuously for twenty years.", "", "had been operating", ["has operated", "was operated", "operates"], "Before the replacement arrived, the old generator had been operating continuously for twenty years.", "El past perfect progressive expresa duración anterior a otro punto pasado.", "La referencia «before ... arrived» sitúa el punto de comparación en el pasado."),
                    c("30000000-0000-4000-8000-000000000073", "So far, the committee ______ three of the five proposals.", "", "has reviewed", ["reviews", "is reviewing", "had reviewed"], "So far, the committee has reviewed three of the five proposals.", "El present perfect enfatiza el resultado acumulado hasta el momento actual.", "«So far» conecta el conteo completado con el presente."),
                    c("30000000-0000-4000-8000-000000000074", "At noon tomorrow, the crew ______ the final section of the bridge.", "", "will be inspecting", ["has inspected", "inspects", "had been inspecting"], "At noon tomorrow, the crew will be inspecting the final section of the bridge.", "El future progressive describe una actividad que estará en curso en un momento futuro específico.", "El marcador «at noon tomorrow» enfoca el desarrollo, no solo la finalización."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000075", "The archive has stored", "these documents", "since more than", "two hundred years.", "C", "The archive has stored these documents for more than two hundred years.", "«For» introduce una duración; «since» introduce el punto inicial."),
                    e("30000000-0000-4000-8000-000000000076", "By the time the report was published,", "the authors have revised", "every chapter", "at least twice.", "B", "By the time the report was published, the authors had revised every chapter at least twice.", "La revisión ocurrió antes de un punto pasado y requiere past perfect."),
                    e("30000000-0000-4000-8000-000000000077", "The seedlings are growing", "in the greenhouse", "for six weeks", "before being transplanted.", "A", "The seedlings have been growing in the greenhouse for six weeks before being transplanted.", "Una duración desde el pasado hasta el presente requiere present perfect progressive."),
                    e("30000000-0000-4000-8000-000000000078", "At this time next month,", "the expedition traveled", "through the northern valley", "toward the coast.", "B", "At this time next month, the expedition will be traveling through the northern valley toward the coast.", "La actividad estará en progreso en un momento futuro y necesita future progressive."),
                    e("30000000-0000-4000-8000-000000000079", "The team", "had completing", "the safety inspection", "before the visitors entered the building.", "B", "The team had completed the safety inspection before the visitors entered the building.", "Después de «had» se necesita el participio «completed» para formar el past perfect."),
                    e("30000000-0000-4000-8000-000000000080", "Since the policy changed,", "waiting times", "decreased", "by almost forty percent.", "C", "Since the policy changed, waiting times have decreased by almost forty percent.", "El cambio acumulado desde un punto pasado hasta el presente pide present perfect."),
                ],
            },
            {
                code: "VERB_VOICE",
                name: "Voz activa y pasiva",
                description: "Formar la voz pasiva y elegirla según el foco informativo y la agencia.",
                cefr: "A2",
                completion: [
                    c("30000000-0000-4000-8000-000000000081", "The ancient coins ______ during construction of the subway.", "", "were uncovered", ["uncovered", "were uncovering", "have uncover"], "The ancient coins were uncovered during construction of the subway.", "La pasiva usa «be + participio» porque las monedas reciben la acción.", "El sujeto no realiza la acción de descubrir, por eso la voz activa sin agente no funciona."),
                    c("30000000-0000-4000-8000-000000000082", "All applications must ______ by the deadline.", "", "be submitted", ["submit", "be submitting", "have submit"], "All applications must be submitted by the deadline.", "Después de un modal, la pasiva se forma con «be + participio».", "El modal no admite una forma conjugada de «be» ni un participio sin auxiliar."),
                    c("30000000-0000-4000-8000-000000000083", "The final measurements ______ by two independent laboratories.", "", "have been verified", ["have verified", "were verifying", "are verify"], "The final measurements have been verified by two independent laboratories.", "El present perfect pasivo se forma con «have been + participio».", "Las mediciones reciben la verificación; el agente aparece en la frase con «by»."),
                    c("30000000-0000-4000-8000-000000000084", "The new wing of the museum ______ next autumn.", "", "will be opened", ["will opening", "will be open by", "is open by"], "The new wing of the museum will be opened next autumn.", "La pasiva futura usa «will be + participio» y enfoca el evento de apertura.", "Las formas con «by» quedan incompletas sin agente o fecha límite, y «will opening» no forma un futuro."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000085", "The samples were carefully", "analyzing", "by a team of chemists", "at the national laboratory.", "B", "The samples were carefully analyzed by a team of chemists at the national laboratory.", "La pasiva requiere el participio pasado «analyzed», no el gerundio."),
                    e("30000000-0000-4000-8000-000000000086", "The committee's decision", "was announced it", "during a brief meeting", "on Friday afternoon.", "B", "The committee's decision was announced during a brief meeting on Friday afternoon.", "En pasiva el sujeto ya recibe la acción; el pronombre «it» crea un objeto redundante."),
                    e("30000000-0000-4000-8000-000000000087", "Several safety procedures", "have revised", "since the accident", "occurred last year.", "B", "Several safety procedures have been revised since the accident occurred last year.", "El present perfect pasivo necesita «have been revised»."),
                    e("30000000-0000-4000-8000-000000000088", "The original manuscript", "believes to have been written", "during the fifteenth century", "by an unknown scholar.", "B", "The original manuscript is believed to have been written during the fifteenth century by an unknown scholar.", "La estructura de reporte pasiva es «is believed to have been written»."),
                    e("30000000-0000-4000-8000-000000000089", "A new treatment", "is currently testing", "at three hospitals", "across the country.", "B", "A new treatment is currently being tested at three hospitals across the country.", "La pasiva progresiva se forma con «is being + participio»."),
                    e("30000000-0000-4000-8000-000000000090", "The damaged equipment", "should repair", "before the laboratory", "reopens on Monday.", "B", "The damaged equipment should be repaired before the laboratory reopens on Monday.", "Después del modal, la pasiva necesita «be repaired»."),
                ],
            },
            {
                code: "VERB_MODAL",
                name: "Modales",
                description: "Expresar posibilidad, obligación, deducción y capacidad con modales y formas perfectas.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000091", "The missing file ______ accidentally during the system update.", "", "may have been deleted", ["may be deleting", "must delete", "could deleted"], "The missing file may have been deleted accidentally during the system update.", "«May have been + participio» expresa una posibilidad pasada en voz pasiva.", "La referencia pasada y el sujeto receptor exigen modal perfecto pasivo."),
                    c("30000000-0000-4000-8000-000000000092", "Visitors ______ protective glasses inside the laboratory.", "", "must wear", ["must to wear", "must wearing", "must have wore"], "Visitors must wear protective glasses inside the laboratory.", "Los modales van seguidos del verbo en forma base sin «to».", "Ni el infinitivo con «to» ni el gerundio siguen directamente a «must»."),
                    c("30000000-0000-4000-8000-000000000093", "The lights are off, so the staff ______ home already.", "", "must have gone", ["must go", "must be go", "should went"], "The lights are off, so the staff must have gone home already.", "«Must have + participio» expresa una deducción fuerte sobre el pasado.", "El indicio presente lleva a inferir una acción anterior ya completada."),
                    c("30000000-0000-4000-8000-000000000094", "With additional funding, the team ______ the survey next year.", "", "could expand", ["could expands", "could to expand", "could expanded"], "With additional funding, the team could expand the survey next year.", "Después de «could» se usa la forma base «expand».", "Los modales no toman tercera persona, «to» ni pasado en el verbo siguiente."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000095", "All participants", "must to sign", "the consent form", "before the interview begins.", "B", "All participants must sign the consent form before the interview begins.", "El modal «must» va directamente seguido de la forma base."),
                    e("30000000-0000-4000-8000-000000000096", "The unusual pattern", "might indicates", "a change in", "the animal's feeding behavior.", "B", "The unusual pattern might indicate a change in the animal's feeding behavior.", "Después de un modal no se añade la terminación de tercera persona."),
                    e("30000000-0000-4000-8000-000000000097", "The package should have arrived", "yesterday, but it", "may be delayed", "by the storm.", "C", "The package should have arrived yesterday, but it may have been delayed by the storm.", "Una posibilidad pasada en pasiva se expresa con «may have been delayed»."),
                    e("30000000-0000-4000-8000-000000000098", "Researchers could not explained", "why the second sample", "produced a different result", "under identical conditions.", "A", "Researchers could not explain why the second sample produced a different result under identical conditions.", "«Could» exige la forma base «explain»."),
                    e("30000000-0000-4000-8000-000000000099", "The inscription is faint,", "but experts must can", "identify several letters", "under ultraviolet light.", "B", "The inscription is faint, but experts must be able to identify several letters under ultraviolet light.", "Dos modales no se encadenan; «be able to» permite expresar capacidad después de «must»."),
                    e("30000000-0000-4000-8000-000000000100", "The committee need not to meet", "again unless new evidence", "becomes available", "before Friday.", "A", "The committee need not meet again unless new evidence becomes available before Friday.", "«Need not» funciona como modal y va seguido de verbo base sin «to»."),
                ],
            },
            {
                code: "VERB_SUBJUNCTIVE",
                name: "Subjuntivo y formas irreales",
                description: "Usar el subjuntivo mandativo y las formas verbales de condiciones o deseos irreales.",
                cefr: "B2",
                completion: [
                    c("30000000-0000-4000-8000-000000000101", "The committee recommended that the proposal ______ before publication.", "", "be revised", ["is revised", "was revised", "will be revised"], "The committee recommended that the proposal be revised before publication.", "Después de «recommend that», el subjuntivo usa la forma base; en pasiva, «be revised».", "El subjuntivo mandativo no marca tiempo ni concordancia en el verbo subordinado."),
                    c("30000000-0000-4000-8000-000000000102", "If the sensor were more sensitive, it ______ smaller changes.", "", "would detect", ["will detect", "detected", "would have detected"], "If the sensor were more sensitive, it would detect smaller changes.", "Una condición hipotética presente usa «were» y «would + verbo base».", "El resultado no es pasado perfecto porque la situación se refiere al presente."),
                    c("30000000-0000-4000-8000-000000000103", "The director insisted that every applicant ______ two references.", "", "provide", ["provides", "provided", "will provide"], "The director insisted that every applicant provide two references.", "El subjuntivo mandativo conserva la forma base «provide» incluso con sujeto singular.", "La tercera persona con -s no se usa después de esta estructura de exigencia."),
                    c("30000000-0000-4000-8000-000000000104", "I wish the archive ______ open on weekends.", "", "were", ["is", "will be", "has been"], "I wish the archive were open on weekends.", "Para un deseo contrario a la realidad presente se usa «were» con cualquier sujeto.", "«Wish» desplaza la forma verbal para marcar irrealidad."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000105", "The regulations require that", "each container is labeled", "with its contents", "and the date of collection.", "B", "The regulations require that each container be labeled with its contents and the date of collection.", "«Require that» activa el subjuntivo base pasivo «be labeled»."),
                    e("30000000-0000-4000-8000-000000000106", "If the bridge had been stronger,", "it would survive", "the earthquake", "that struck last year.", "B", "If the bridge had been stronger, it would have survived the earthquake that struck last year.", "La condición irreal pasada requiere «would have + participio» en el resultado."),
                    e("30000000-0000-4000-8000-000000000107", "The advisor suggested that", "the student submits", "a revised outline", "before beginning the draft.", "B", "The advisor suggested that the student submit a revised outline before beginning the draft.", "El subjuntivo después de «suggested that» usa la forma base «submit»."),
                    e("30000000-0000-4000-8000-000000000108", "I wish the report", "was containing", "more information", "about the sampling method.", "B", "I wish the report contained more information about the sampling method.", "Un deseo irreal presente usa pasado simple; «contain» es normalmente estativo y no progresivo."),
                    e("30000000-0000-4000-8000-000000000109", "It is essential that", "the equipment remains", "dry during transport", "to the field station.", "B", "It is essential that the equipment remain dry during transport to the field station.", "Tras una expresión de necesidad, el subjuntivo usa «remain» sin -s."),
                    e("30000000-0000-4000-8000-000000000110", "Were the data complete,", "the researchers will publish", "their findings", "before the end of the month.", "B", "Were the data complete, the researchers would publish their findings before the end of the month.", "La condición invertida irreal requiere «would» en la cláusula de resultado."),
                ],
            },
            {
                code: "VERB_COMPLEMENT",
                name: "Complementos verbales",
                description: "Elegir gerundio, infinitivo o cláusula según el patrón exigido por el verbo.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000111", "The researchers avoided ______ the samples to direct sunlight.", "", "exposing", ["to expose", "expose", "to exposing"], "The researchers avoided exposing the samples to direct sunlight.", "«Avoid» selecciona un gerundio como complemento.", "Este verbo no va seguido de infinitivo con «to» ni de forma base."),
                    c("30000000-0000-4000-8000-000000000112", "The technician agreed ______ the measurements before noon.", "", "to repeat", ["repeating", "repeat", "to repeating"], "The technician agreed to repeat the measurements before noon.", "«Agree» selecciona un infinitivo con «to».", "El gerundio no expresa aquí el compromiso de realizar una acción futura."),
                    c("30000000-0000-4000-8000-000000000113", "The new evidence caused the committee ______ its decision.", "", "to reconsider", ["reconsidering", "reconsider", "to reconsidering"], "The new evidence caused the committee to reconsider its decision.", "El patrón es «cause + objeto + infinitivo con to».", "El objeto «the committee» debe ir seguido de «to + verbo base»."),
                    c("30000000-0000-4000-8000-000000000114", "The guide reminded us ______ enough water for the hike.", "", "to bring", ["bringing", "bring", "to bringing"], "The guide reminded us to bring enough water for the hike.", "«Remind + persona» toma un infinitivo con «to» para indicar la acción recordada.", "El gerundio tendría otro significado y la forma base necesita un modal o «to»."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000115", "The committee postponed", "to make a decision", "until additional data", "became available.", "B", "The committee postponed making a decision until additional data became available.", "«Postpone» se construye con gerundio, no con infinitivo."),
                    e("30000000-0000-4000-8000-000000000116", "The supervisor allowed", "the interns use", "the microscope", "after completing the training.", "B", "The supervisor allowed the interns to use the microscope after completing the training.", "«Allow + persona» requiere infinitivo con «to»."),
                    e("30000000-0000-4000-8000-000000000117", "The experiment failed", "producing", "the expected reaction", "at low temperatures.", "B", "The experiment failed to produce the expected reaction at low temperatures.", "«Fail» con el sentido de no lograr algo toma infinitivo con «to»."),
                    e("30000000-0000-4000-8000-000000000118", "The author admitted", "to omit", "two important sources", "from the bibliography.", "B", "The author admitted omitting two important sources from the bibliography.", "«Admit» selecciona gerundio para reconocer una acción."),
                    e("30000000-0000-4000-8000-000000000119", "The new software enables", "researchers processing", "large data sets", "more efficiently.", "B", "The new software enables researchers to process large data sets more efficiently.", "El patrón es «enable + persona + to + verbo base»."),
                    e("30000000-0000-4000-8000-000000000120", "The instructor encouraged", "that the students revise", "their essays", "before submission.", "B", "The instructor encouraged the students to revise their essays before submission.", "«Encourage» normalmente toma objeto personal seguido de infinitivo con «to»."),
                ],
            },
            {
                code: "VERB_TRANSITIVITY",
                name: "Transitividad y objetos",
                description: "Usar objetos y complementos requeridos por verbos transitivos, intransitivos y ditransitivos.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000121", "The new policy will ______ all employees who work remotely.", "", "affect", ["affect to", "be affected", "effect on"], "The new policy will affect all employees who work remotely.", "«Affect» es un verbo transitivo y toma objeto directo sin preposición.", "No debe confundirse el verbo «affect» con el sustantivo «effect»."),
                    c("30000000-0000-4000-8000-000000000122", "The professor explained the procedure ______ the new assistants.", "", "to", ["for", "at", "—"], "The professor explained the procedure to the new assistants.", "«Explain» toma la cosa como objeto directo y la persona en una frase con «to».", "No se usa el patrón de doble objeto «explain someone something»."),
                    c("30000000-0000-4000-8000-000000000123", "The population of the island ______ rapidly during the nineteenth century.", "", "increased", ["increased it", "raised", "was increased itself"], "The population of the island increased rapidly during the nineteenth century.", "«Increase» puede ser intransitivo cuando el sujeto mismo cambia.", "No necesita objeto reflexivo y «raise» requeriría un agente y un objeto."),
                    c("30000000-0000-4000-8000-000000000124", "The foundation provided the village ______ clean drinking water.", "", "with", ["to", "for", "of"], "The foundation provided the village with clean drinking water.", "El patrón es «provide someone with something».", "La preposición forma parte del régimen verbal y no puede sustituirse libremente."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000125", "The report discusses about", "the effects of erosion", "on agricultural land", "in the coastal region.", "A", "The report discusses the effects of erosion on agricultural land in the coastal region.", "«Discuss» es transitivo y no lleva «about» antes de su objeto."),
                    e("30000000-0000-4000-8000-000000000126", "The temperature raised", "by nearly ten degrees", "during the final stage", "of the reaction.", "A", "The temperature rose by nearly ten degrees during the final stage of the reaction.", "«Rise» es intransitivo; «raise» necesita un objeto directo."),
                    e("30000000-0000-4000-8000-000000000127", "The guide described us", "the route through the canyon", "before the group", "left the camp.", "A", "The guide described the route through the canyon to us before the group left the camp.", "«Describe» toma la cosa como objeto directo y la persona con «to»."),
                    e("30000000-0000-4000-8000-000000000128", "Several problems occurred them", "during the installation", "of the new ventilation", "system in the laboratory.", "A", "Several problems occurred during the installation of the new ventilation system in the laboratory.", "«Occur» es intransitivo y no admite objeto directo."),
                    e("30000000-0000-4000-8000-000000000129", "The scholarship supplies", "students financial support", "for up to four years", "of full-time study.", "B", "The scholarship supplies students with financial support for up to four years of full-time study.", "«Supply» usa el patrón «supply someone with something»."),
                    e("30000000-0000-4000-8000-000000000130", "The investigators reached to", "the remote village", "shortly before sunset", "on the third day.", "A", "The investigators reached the remote village shortly before sunset on the third day.", "«Reach» es transitivo y toma el lugar como objeto directo sin «to»."),
                ],
            },
        ],
    },
    {
        code: "clauses",
        name: "Cláusulas y reducción",
        skills: [
            {
                code: "CLAUSE_NOUN",
                name: "Cláusulas nominales",
                description: "Construir cláusulas nominales como sujeto, objeto o complemento con orden declarativo.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000131", "The committee has not decided ______ the new facility will be built.", "", "where", ["where will", "that where", "in where"], "The committee has not decided where the new facility will be built.", "Una cláusula nominal interrogativa usa «where» seguido de orden declarativo.", "Las preguntas indirectas no invierten auxiliar y sujeto."),
                    c("30000000-0000-4000-8000-000000000132", "______ the two species are related remains uncertain.", "", "Whether", ["If or not", "That whether", "What"], "Whether the two species are related remains uncertain.", "«Whether» introduce una alternativa indirecta y toda la cláusula funciona como sujeto.", "«If» es menos apropiado como sujeto oracional y no se combina así con «or not»."),
                    c("30000000-0000-4000-8000-000000000133", "The report explains ______ the coastal wetlands have changed.", "", "how", ["how have", "that how", "how did"], "The report explains how the coastal wetlands have changed.", "Después de «how» en una cláusula nominal se conserva el orden declarativo.", "No se usa inversión de pregunta dentro del complemento de «explains»."),
                    c("30000000-0000-4000-8000-000000000134", "The main question is ______ the new evidence supports the theory.", "", "whether", ["what", "that whether", "if does"], "The main question is whether the new evidence supports the theory.", "«Whether» introduce correctamente una interrogativa indirecta como complemento de «is».", "La cláusula mantiene sujeto seguido de verbo, sin auxiliar interrogativo."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000135", "The researchers could not determine", "why did the signal disappear", "so suddenly", "during the final test.", "B", "The researchers could not determine why the signal disappeared so suddenly during the final test.", "La pregunta indirecta debe conservar el orden declarativo: «why the signal disappeared»."),
                    e("30000000-0000-4000-8000-000000000136", "The survey asks participants", "how often do they use", "public transportation", "during a typical week.", "B", "The survey asks participants how often they use public transportation during a typical week.", "Una pregunta indirecta usa orden declarativo: sujeto antes del verbo."),
                    e("30000000-0000-4000-8000-000000000137", "That the ancient settlement", "was abandoned so quickly", "it remains", "a subject of debate.", "C", "That the ancient settlement was abandoned so quickly remains a subject of debate.", "La cláusula con «that» ya es el sujeto; «it» crea un doble sujeto."),
                    e("30000000-0000-4000-8000-000000000138", "The director announced", "that when the new policy", "would take effect", "at the end of the month.", "B", "The director announced that the new policy would take effect at the end of the month.", "No se necesita «when» después de «announced that» porque la fecha ya aparece como complemento."),
                    e("30000000-0000-4000-8000-000000000139", "Why did the instrument fail", "during the final test", "is still being investigated", "by the engineering team.", "A", "Why the instrument failed during the final test is still being investigated by the engineering team.", "Una cláusula nominal sujeto conserva el orden declarativo, no el de pregunta directa."),
                    e("30000000-0000-4000-8000-000000000140", "The team is confident", "what the revised method", "will produce", "more reliable measurements.", "B", "The team is confident that the revised method will produce more reliable measurements.", "Después de «confident» se introduce una afirmación con «that», no con «what»."),
                ],
            },
            {
                code: "CLAUSE_RELATIVE",
                name: "Cláusulas relativas",
                description: "Seleccionar pronombres relativos y construir cláusulas restrictivas y explicativas.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000141", "The scientist ______ developed the vaccine received an international award.", "", "who", ["which", "whose", "whom"], "The scientist who developed the vaccine received an international award.", "«Who» funciona como sujeto humano de la cláusula relativa.", "«Whom» sería objeto, «whose» indica posesión y «which» suele referirse a cosas."),
                    c("30000000-0000-4000-8000-000000000142", "The valley through ______ the river flows is densely forested.", "", "which", ["that", "where", "whom"], "The valley through which the river flows is densely forested.", "Después de una preposición explícita se usa «which» para una cosa.", "«That» no sigue directamente a una preposición y «where» haría redundante «through»."),
                    c("30000000-0000-4000-8000-000000000143", "The author ______ latest book examines migration will speak tonight.", "", "whose", ["who", "whom", "which"], "The author whose latest book examines migration will speak tonight.", "«Whose» expresa que el libro pertenece al autor.", "La relación es posesiva, no de sujeto u objeto simple."),
                    c("30000000-0000-4000-8000-000000000144", "The year ______ the observatory opened was unusually dry.", "", "when", ["which", "who", "whose"], "The year when the observatory opened was unusually dry.", "«When» introduce una relativa temporal y equivale a «in which».", "La cláusula necesita un relativo de tiempo, no de persona o posesión."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000145", "The instrument who measures", "atmospheric pressure", "must be calibrated", "once every six months.", "A", "The instrument that measures atmospheric pressure must be calibrated once every six months.", "Para un objeto se usa «that» o «which», no el relativo personal «who»."),
                    e("30000000-0000-4000-8000-000000000146", "The professor whom wrote", "the original article", "later revised", "several of its conclusions.", "A", "The professor who wrote the original article later revised several of its conclusions.", "El relativo es sujeto de «wrote» y debe ser «who», no «whom»."),
                    e("30000000-0000-4000-8000-000000000147", "The island, that lies", "about fifty kilometers offshore,", "is accessible only", "by a weekly ferry.", "A", "The island, which lies about fifty kilometers offshore, is accessible only by a weekly ferry.", "En una relativa explicativa entre comas se usa «which», no «that»."),
                    e("30000000-0000-4000-8000-000000000148", "The laboratory where", "the samples were analyzed there", "uses equipment", "designed for trace materials.", "B", "The laboratory where the samples were analyzed uses equipment designed for trace materials.", "«Where» ya expresa el lugar; añadir «there» dentro de la relativa es redundante."),
                    e("30000000-0000-4000-8000-000000000149", "The report lists several factors", "which the committee believes", "that contributed", "to the decline.", "C", "The report lists several factors which the committee believes contributed to the decline.", "El relativo ya conecta «factors» con «contributed»; «that» crea un segundo conector innecesario."),
                    e("30000000-0000-4000-8000-000000000150", "The villages whose were damaged", "by the earthquake", "received emergency supplies", "within two days.", "A", "The villages that were damaged by the earthquake received emergency supplies within two days.", "«Whose» debe ir seguido de un sustantivo poseído; aquí se necesita «that» como sujeto de la pasiva."),
                ],
            },
            {
                code: "CLAUSE_ADVERB",
                name: "Cláusulas adverbiales",
                description: "Relacionar tiempo, causa, concesión, condición y propósito mediante subordinación.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000151", "The fieldwork was postponed ______ heavy rain made the roads impassable.", "", "because", ["because of", "despite", "although"], "The fieldwork was postponed because heavy rain made the roads impassable.", "«Because» introduce una cláusula completa de causa.", "«Because of» y «despite» necesitan un grupo nominal, mientras «although» expresa contraste."),
                    c("30000000-0000-4000-8000-000000000152", "______ the sample is kept below zero, it will remain stable.", "", "As long as", ["Unless", "Despite", "Whereas"], "As long as the sample is kept below zero, it will remain stable.", "«As long as» expresa la condición suficiente para mantener estable la muestra.", "«Unless» invertiría la condición y las otras opciones expresan relaciones distintas."),
                    c("30000000-0000-4000-8000-000000000153", "The team left early ______ it could reach the station before dark.", "", "so that", ["because of", "even though", "in spite of"], "The team left early so that it could reach the station before dark.", "«So that» introduce una cláusula de propósito con sujeto y modal.", "Las demás expresiones señalan causa o contraste, no propósito."),
                    c("30000000-0000-4000-8000-000000000154", "______ the two methods use different equipment, they produce similar results.", "", "Although", ["Because of", "Unless", "So that"], "Although the two methods use different equipment, they produce similar results.", "«Although» introduce una concesión que contrasta con el resultado principal.", "La relación lógica no es de causa, condición negativa ni propósito."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000155", "Despite the weather was cold,", "the students completed", "the field survey", "as originally planned.", "A", "Although the weather was cold, the students completed the field survey as originally planned.", "«Despite» no introduce una cláusula finita; con sujeto y verbo se usa «although»."),
                    e("30000000-0000-4000-8000-000000000156", "The device automatically shuts down", "unless the temperature", "does not fall", "below the safe limit.", "C", "The device automatically shuts down unless the temperature falls below the safe limit.", "«Unless» ya significa «if not»; añadir «does not» crea una doble negación."),
                    e("30000000-0000-4000-8000-000000000157", "The archive remains closed", "so that workers", "are repairing", "the damaged ceiling.", "B", "The archive remains closed because workers are repairing the damaged ceiling.", "La cláusula explica una causa, no un propósito; corresponde «because»."),
                    e("30000000-0000-4000-8000-000000000158", "While the first experiment failed", "because a faulty sensor,", "but the second produced", "usable data.", "C", "While the first experiment failed because of a faulty sensor, the second produced usable data.", "«While» ya marca contraste; «but» es redundante, y «because of» introduce el sustantivo «a faulty sensor»."),
                    e("30000000-0000-4000-8000-000000000159", "The seedlings will be moved outside", "after they will develop", "a stronger root system", "in the greenhouse.", "B", "The seedlings will be moved outside after they develop a stronger root system in the greenhouse.", "En una cláusula temporal futura con «after» se usa presente simple, no «will»."),
                    e("30000000-0000-4000-8000-000000000160", "The road was reopened", "even though of", "continuing concerns", "about falling rocks.", "B", "The road was reopened despite continuing concerns about falling rocks.", "«Even though» exige una cláusula; ante un grupo nominal se usa «despite»."),
                ],
            },
            {
                code: "CLAUSE_REDUCED_REL",
                name: "Relativas reducidas",
                description: "Reducir cláusulas relativas activas y pasivas sin perder la relación con el sustantivo.",
                cefr: "B2",
                completion: [
                    c("30000000-0000-4000-8000-000000000161", "The artifacts ______ near the river date from the early Bronze Age.", "", "found", ["finding", "were found", "which finding"], "The artifacts found near the river date from the early Bronze Age.", "La relativa pasiva «that were found» puede reducirse al participio «found».", "No se conserva el auxiliar en una relativa reducida y el gerundio daría sentido activo."),
                    c("30000000-0000-4000-8000-000000000162", "Students ______ to participate must submit an application.", "", "wishing", ["wished", "are wishing", "who wished by"], "Students wishing to participate must submit an application.", "Una relativa activa puede reducirse a participio presente cuando modifica al sujeto agente.", "«Students who wish» se reduce naturalmente a «students wishing»."),
                    c("30000000-0000-4000-8000-000000000163", "The data ______ in Table 2 support the revised model.", "", "presented", ["presenting", "are presented", "which presents"], "The data presented in Table 2 support the revised model.", "«Presented» reduce una relativa pasiva y modifica a «data».", "El participio presente implicaría que los datos presentan otra cosa."),
                    c("30000000-0000-4000-8000-000000000164", "The road ______ the two villages is closed for repairs.", "", "connecting", ["connected", "is connecting", "which connected by"], "The road connecting the two villages is closed for repairs.", "La carretera realiza la función de conectar, por lo que la relativa activa se reduce con «connecting».", "El participio pasado necesitaría una preposición o cambiaría el sentido."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000165", "The samples were collected yesterday", "stored in sealed containers", "will be analyzed", "at the central laboratory.", "A", "The samples collected yesterday and stored in sealed containers will be analyzed at the central laboratory.", "El auxiliar «were» hace competir dos verbos principales; las relativas reducidas usan participios coordinados."),
                    e("30000000-0000-4000-8000-000000000166", "The researchers invited", "to present at the conference", "comes from", "six different countries.", "C", "The researchers invited to present at the conference come from six different countries.", "El sujeto plural «researchers» requiere «come»; «invited» es una relativa pasiva reducida."),
                    e("30000000-0000-4000-8000-000000000167", "Anyone works", "with hazardous materials", "must complete", "the safety course.", "A", "Anyone working with hazardous materials must complete the safety course.", "La relativa activa reducida requiere el participio «working»."),
                    e("30000000-0000-4000-8000-000000000168", "The books locating", "on the upper shelf", "belong to", "the reference collection.", "A", "The books located on the upper shelf belong to the reference collection.", "Los libros reciben la acción de ubicar; se necesita el participio pasivo «located»."),
                    e("30000000-0000-4000-8000-000000000169", "The path leads", "to the research station", "passes through", "a protected forest.", "A", "The path leading to the research station passes through a protected forest.", "Uno de los dos verbos debe reducirse; «leading» modifica a «path» y deja «passes» como verbo principal."),
                    e("30000000-0000-4000-8000-000000000170", "The equipment purchasing last year", "has reduced", "the time required", "for each analysis.", "A", "The equipment purchased last year has reduced the time required for each analysis.", "El equipo fue comprado; la relativa pasiva reducida usa «purchased»."),
                ],
            },
            {
                code: "CLAUSE_REDUCED_ADV",
                name: "Adverbiales reducidas",
                description: "Reducir cláusulas adverbiales cuando comparten sujeto con la cláusula principal.",
                cefr: "B2",
                completion: [
                    c("30000000-0000-4000-8000-000000000171", "______ the final report, the editor noticed several inconsistencies.", "", "While reviewing", ["While reviewed", "When was reviewing", "Reviewing by"], "While reviewing the final report, the editor noticed several inconsistencies.", "La cláusula temporal comparte sujeto con la principal y se reduce a «while + gerundio».", "El editor realiza ambas acciones, por lo que corresponde una forma activa."),
                    c("30000000-0000-4000-8000-000000000172", "______ at low temperatures, the compound remains stable for months.", "", "When stored", ["When storing", "When it storing", "Stored it"], "When stored at low temperatures, the compound remains stable for months.", "La cláusula reducida es pasiva: «when it is stored» pasa a «when stored».", "El compuesto recibe la acción de almacenar."),
                    c("30000000-0000-4000-8000-000000000173", "______ enough funding, the team could extend the study.", "", "If given", ["If giving", "Giving if", "If it give"], "If given enough funding, the team could extend the study.", "La condicional pasiva «if the team were given» puede reducirse a «if given».", "El sujeto de la principal recibe los fondos, no los entrega."),
                    c("30000000-0000-4000-8000-000000000174", "______ from the summit, the valley appears much narrower.", "", "Viewed", ["Viewing", "Having view", "When viewing it"], "Viewed from the summit, the valley appears much narrower.", "«Viewed» reduce una cláusula pasiva y mantiene «the valley» como elemento observado.", "El valle no realiza la acción de mirar."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000175", "While crossing the desert,", "the extreme heat", "exhausted the hikers", "within a few hours.", "A", "While the hikers were crossing the desert, the extreme heat exhausted the hikers within a few hours.", "La frase inicial debe nombrar a «the hikers» como quienes cruzan; de otro modo parece modificar a «the extreme heat»."),
                    e("30000000-0000-4000-8000-000000000176", "When using correctly,", "the instrument can detect", "changes of less than", "one tenth of a degree.", "A", "When used correctly, the instrument can detect changes of less than one tenth of a degree.", "El instrumento recibe la acción de usar, por lo que se necesita el participio pasivo «used»."),
                    e("30000000-0000-4000-8000-000000000177", "After completed the survey,", "participants returned", "their forms", "to the research assistant.", "A", "After completing the survey, participants returned their forms to the research assistant.", "La reducción activa después de «after» usa gerundio «completing»."),
                    e("30000000-0000-4000-8000-000000000178", "Although built more than a century ago,", "engineers consider the bridge", "structurally sound", "and safe for traffic.", "B", "Although built more than a century ago, the bridge is considered structurally sound and safe for traffic.", "El sujeto implícito de «built» debe ser «the bridge»; la activa original lo hacía modificar a «engineers»."),
                    e("30000000-0000-4000-8000-000000000179", "Before to enter the clean room,", "all visitors must remove", "dust from their shoes", "and put on protective clothing.", "A", "Before entering the clean room, all visitors must remove dust from their shoes and put on protective clothing.", "Después de «before» en una cláusula reducida se usa gerundio, no infinitivo."),
                    e("30000000-0000-4000-8000-000000000180", "Unless treating immediately,", "the metal surface", "will begin to corrode", "in the humid air.", "A", "Unless treated immediately, the metal surface will begin to corrode in the humid air.", "La superficie recibe el tratamiento; la reducción condicional debe ser pasiva."),
                ],
            },
            {
                code: "CLAUSE_PARTICIPIAL",
                name: "Frases participiales",
                description: "Relacionar correctamente frases participiales con su sujeto y secuencia temporal.",
                cefr: "B2",
                completion: [
                    c("30000000-0000-4000-8000-000000000181", "______ the preliminary data, the researchers redesigned the survey.", "", "Having analyzed", ["Analyzed", "Having been analyzed by", "To analyzing"], "Having analyzed the preliminary data, the researchers redesigned the survey.", "«Having + participio» indica que el análisis terminó antes del rediseño y comparte el mismo sujeto.", "La forma pasiva haría que los investigadores recibieran el análisis."),
                    c("30000000-0000-4000-8000-000000000182", "______ by dense fog, the airport canceled several flights.", "", "Surrounded", ["Surrounding", "Having surround", "Being surround"], "Surrounded by dense fog, the airport canceled several flights.", "El participio pasado expresa que el aeropuerto estaba rodeado por la niebla.", "El sujeto no rodea la niebla; recibe esa relación pasiva."),
                    c("30000000-0000-4000-8000-000000000183", "______ along the coast, the researchers recorded changes in water temperature.", "", "Traveling", ["Traveled", "Having been traveled", "To traveled"], "Traveling along the coast, the researchers recorded changes in water temperature.", "El participio presente describe una acción simultánea realizada por los investigadores.", "La frase debe concordar lógicamente con el sujeto de la cláusula principal."),
                    c("30000000-0000-4000-8000-000000000184", "______ all safety checks, the crew began the launch sequence.", "", "Having completed", ["Completed by", "Completing by", "Having been complete"], "Having completed all safety checks, the crew began the launch sequence.", "El participio perfecto activo marca una acción anterior completada por el mismo sujeto.", "La tripulación realiza la comprobación, por eso no se usa pasiva."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000185", "Having finished the experiment,", "the data were compiled", "by the research team", "for statistical analysis.", "B", "Having finished the experiment, the research team compiled the data for statistical analysis.", "El sujeto implícito de «having finished» debe ser quien terminó el experimento; «the data» crea un modificador colgante."),
                    e("30000000-0000-4000-8000-000000000186", "Located on a steep hillside,", "visitors can reach the temple", "only by climbing", "a long stone staircase.", "B", "Located on a steep hillside, the temple can be reached only by visitors climbing a long stone staircase.", "La frase «located» debe modificar a «the temple», no a «visitors»."),
                    e("30000000-0000-4000-8000-000000000187", "Having been studied the samples,", "the chemist reported", "an unexpected reaction", "to the project director.", "A", "Having studied the samples, the chemist reported an unexpected reaction to the project director.", "El químico realiza el estudio; se necesita participio perfecto activo, no pasivo."),
                    e("30000000-0000-4000-8000-000000000188", "Walking through the gallery,", "several ancient maps", "caught the curator's attention", "near the main entrance.", "A", "As the curator walked through the gallery, several ancient maps caught her attention near the main entrance.", "La cláusula inicial debe nombrar a la persona que camina para no modificar erróneamente a «maps»."),
                    e("30000000-0000-4000-8000-000000000189", "Designed for use in deep water,", "engineers tested the sensor", "under pressures exceeding", "one hundred atmospheres.", "B", "Designed for use in deep water, the sensor was tested by engineers under pressures exceeding one hundred atmospheres.", "«Designed» debe modificar a «the sensor», que debe ser el sujeto de la cláusula principal."),
                    e("30000000-0000-4000-8000-000000000190", "Not knowing the exact route,", "the map was consulted", "by the field team", "several times during the hike.", "B", "Not knowing the exact route, the field team consulted the map several times during the hike.", "La frase participial debe modificar al equipo, no al mapa."),
                ],
            },
        ],
    },
    {
        code: "noun_system",
        name: "Sistema nominal",
        skills: [
            {
                code: "NOUN_NUMBER",
                name: "Número y contabilidad",
                description: "Distinguir sustantivos contables, incontables y plurales irregulares.",
                cefr: "A2",
                completion: [
                    c("30000000-0000-4000-8000-000000000191", "The study provides useful ______ about changes in local rainfall.", "", "information", ["informations", "an information", "information pieces"], "The study provides useful information about changes in local rainfall.", "«Information» es incontable y no toma plural ni artículo indefinido.", "Para contar unidades se diría «pieces of information», no «information pieces»."),
                    c("30000000-0000-4000-8000-000000000192", "Several ______ were observed near the edge of the forest.", "", "deer", ["deers", "deer's", "a deer"], "Several deer were observed near the edge of the forest.", "«Deer» tiene la misma forma en singular y plural.", "«Several» exige un sustantivo plural, pero este plural no lleva -s."),
                    c("30000000-0000-4000-8000-000000000193", "The laboratory purchased three new pieces of ______.", "", "equipment", ["equipments", "an equipment", "equipmentes"], "The laboratory purchased three new pieces of equipment.", "«Equipment» es incontable; sus unidades se expresan con «pieces of».", "No se pluraliza directamente ni se usa con «an»."),
                    c("30000000-0000-4000-8000-000000000194", "Only a small amount of ______ was needed for the reaction.", "", "water", ["waters", "a water", "many water"], "Only a small amount of water was needed for the reaction.", "«Water» es incontable en este contexto y combina con «amount of».", "«Many» se reserva para sustantivos contables plurales."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000195", "The researchers collected", "many useful evidences", "during the three-month", "field investigation.", "B", "The researchers collected much useful evidence during the three-month field investigation.", "«Evidence» es incontable y no se pluraliza; puede combinar con «much»."),
                    e("30000000-0000-4000-8000-000000000196", "The new library contains", "more than two million book", "including several rare", "first editions.", "B", "The new library contains more than two million books, including several rare first editions.", "Después de un número mayor que uno, el sustantivo contable debe ir en plural."),
                    e("30000000-0000-4000-8000-000000000197", "The equipment in both rooms", "are inspected", "at the beginning", "of every semester.", "B", "The equipment in both rooms is inspected at the beginning of every semester.", "«Equipment» es incontable y gramaticalmente singular."),
                    e("30000000-0000-4000-8000-000000000198", "Several important research", "have examined", "the effects of noise", "on sleep quality.", "A", "Several important studies have examined the effects of noise on sleep quality.", "«Research» es incontable; después de «several» se necesita un sustantivo contable plural como «studies»."),
                    e("30000000-0000-4000-8000-000000000199", "The museum displayed", "three furnitures", "from the governor's", "nineteenth-century residence.", "B", "The museum displayed three pieces of furniture from the governor's nineteenth-century residence.", "«Furniture» es incontable; las unidades se expresan con «pieces of furniture»."),
                    e("30000000-0000-4000-8000-000000000200", "The child's two foots", "were measured", "before the specialist", "ordered the new shoes.", "A", "The child's two feet were measured before the specialist ordered the new shoes.", "El plural irregular de «foot» es «feet»."),
                ],
            },
            {
                code: "NOUN_ARTICLE",
                name: "Artículos",
                description: "Elegir a, an, the o artículo cero según referencia, especificidad y sonido inicial.",
                cefr: "A2",
                completion: [
                    c("30000000-0000-4000-8000-000000000201", "The expedition discovered ______ unusual cave near the summit.", "", "an", ["a", "the", "—"], "The expedition discovered an unusual cave near the summit.", "Se usa «an» ante el sonido vocálico inicial de «unusual» y una referencia nueva no específica.", "El artículo depende del sonido, no solo de la letra escrita."),
                    c("30000000-0000-4000-8000-000000000202", "______ water in this reservoir is tested every week.", "", "The", ["A", "An", "—"], "The water in this reservoir is tested every week.", "«The» identifica agua específica mediante la frase «in this reservoir».", "Un sustantivo incontable específico puede llevar artículo definido."),
                    c("30000000-0000-4000-8000-000000000203", "Dr. Chen is ______ historian who specializes in maritime trade.", "", "a", ["an", "the", "—"], "Dr. Chen is a historian who specializes in maritime trade.", "«Historian» empieza con sonido consonántico /h/ y presenta una profesión no única.", "La elección entre «a» y «an» depende del sonido pronunciado."),
                    c("30000000-0000-4000-8000-000000000204", "______ Mount Everest attracts climbers from around the world.", "", "—", ["The", "A", "An"], "Mount Everest attracts climbers from around the world.", "Los nombres de montañas individuales normalmente no llevan artículo.", "«The» se usa con cadenas montañosas, no con este pico individual."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000205", "The scientists used", "an European instrument", "to measure radiation", "at high altitude.", "B", "The scientists used a European instrument to measure radiation at high altitude.", "«European» comienza con sonido consonántico /j/, por lo que usa «a»."),
                    e("30000000-0000-4000-8000-000000000206", "The Lake Victoria", "is one of", "the largest freshwater lakes", "in the world.", "A", "Lake Victoria is one of the largest freshwater lakes in the world.", "Los nombres de lagos con «Lake + nombre» normalmente no llevan «the»."),
                    e("30000000-0000-4000-8000-000000000207", "Researchers need", "a reliable information", "before drawing", "a final conclusion.", "B", "Researchers need reliable information before drawing a final conclusion.", "«Information» es incontable y no admite el artículo indefinido «a»."),
                    e("30000000-0000-4000-8000-000000000208", "The oxygen", "is essential for", "most forms of life", "on Earth.", "A", "Oxygen is essential for most forms of life on Earth.", "Una sustancia en sentido general lleva artículo cero."),
                    e("30000000-0000-4000-8000-000000000209", "She became", "the first researcher", "to examine a samples", "from the deepest layer.", "C", "She became the first researcher to examine samples from the deepest layer.", "El plural indefinido «samples» lleva artículo cero; «a» solo acompaña a singular contable."),
                    e("30000000-0000-4000-8000-000000000210", "A university in the region", "has opened", "an one-year program", "in environmental policy.", "C", "A university in the region has opened a one-year program in environmental policy.", "«One» comienza con sonido /w/, por lo que requiere «a», no «an»."),
                ],
            },
            {
                code: "NOUN_QUANTIFIER",
                name: "Cuantificadores",
                description: "Combinar cuantificadores con nombres contables o incontables y expresar cantidad con precisión.",
                cefr: "A2",
                completion: [
                    c("30000000-0000-4000-8000-000000000211", "Only ______ students completed all three optional assignments.", "", "a few", ["a little", "much", "little"], "Only a few students completed all three optional assignments.", "«Students» es contable plural y combina con «a few».", "«A little» y «much» se usan con incontables."),
                    c("30000000-0000-4000-8000-000000000212", "The desert receives very ______ rain during the summer months.", "", "little", ["few", "many", "a few"], "The desert receives very little rain during the summer months.", "«Rain» es incontable y «little» expresa una cantidad escasa.", "«Few» y «many» requieren nombres contables plurales."),
                    c("30000000-0000-4000-8000-000000000213", "______ of the two proposals addresses the budget problem.", "", "Neither", ["None", "Every", "All"], "Neither of the two proposals addresses the budget problem.", "«Neither» se refiere exactamente a dos elementos y toma verbo singular.", "«None» no es la opción más precisa cuando se enfatizan dos alternativas."),
                    c("30000000-0000-4000-8000-000000000214", "The committee received ______ applications than it expected.", "", "fewer", ["less", "few", "little"], "The committee received fewer applications than it expected.", "«Fewer» compara cantidades de sustantivos contables plurales.", "«Less» se usa normalmente con incontables."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000215", "The survey included", "less participants", "than the researchers", "had originally planned.", "B", "The survey included fewer participants than the researchers had originally planned.", "«Participants» es contable plural y requiere «fewer»."),
                    e("30000000-0000-4000-8000-000000000216", "There is very few evidence", "to support", "the claim made", "in the earlier report.", "A", "There is very little evidence to support the claim made in the earlier report.", "«Evidence» es incontable y combina con «little»."),
                    e("30000000-0000-4000-8000-000000000217", "Each of the samples", "were placed", "in a separate container", "before transport.", "B", "Each of the samples was placed in a separate container before transport.", "«Each» es singular y exige «was»."),
                    e("30000000-0000-4000-8000-000000000218", "Much students", "reported difficulty", "understanding the final", "section of the article.", "A", "Many students reported difficulty understanding the final section of the article.", "«Students» es contable plural y necesita «many»."),
                    e("30000000-0000-4000-8000-000000000219", "The laboratory has", "a large number of equipment", "for analyzing", "air quality.", "B", "The laboratory has a large amount of equipment for analyzing air quality.", "«Equipment» es incontable, por lo que corresponde «a large amount of»."),
                    e("30000000-0000-4000-8000-000000000220", "Neither of the three methods", "produced results", "that could be repeated", "by another laboratory.", "A", "None of the three methods produced results that could be repeated by another laboratory.", "«Neither» se limita a dos; con tres o más se usa «none»."),
                ],
            },
            {
                code: "NOUN_PRONOUN",
                name: "Pronombres y referencia",
                description: "Mantener concordancia, caso y referencia clara en pronombres personales, relativos y reflexivos.",
                cefr: "A2",
                completion: [
                    c("30000000-0000-4000-8000-000000000221", "The two laboratories shared ______ results before publishing them.", "", "their", ["its", "theirs", "there"], "The two laboratories shared their results before publishing them.", "El posesivo «their» concuerda con el sujeto plural y modifica a «results».", "«Theirs» no precede a un sustantivo y «there» no es posesivo."),
                    c("30000000-0000-4000-8000-000000000222", "The director spoke to Maria and ______ after the meeting.", "", "me", ["I", "myself", "mine"], "The director spoke to Maria and me after the meeting.", "Después de la preposición «to» se usa el pronombre objeto «me».", "La coordinación no cambia el caso exigido por la preposición."),
                    c("30000000-0000-4000-8000-000000000223", "All applicants must submit ______ own writing samples.", "", "their", ["its", "theirs", "them"], "All applicants must submit their own writing samples.", "El posesivo plural «their» concuerda con «all applicants» y modifica a «writing samples».", "Se necesita un determinante posesivo concordante antes de «own writing samples»."),
                    c("30000000-0000-4000-8000-000000000224", "The machine turns ______ off when the cycle is complete.", "", "itself", ["it", "its", "himself"], "The machine turns itself off when the cycle is complete.", "El reflexivo «itself» indica que el sujeto realiza la acción sobre sí mismo.", "El pronombre debe concordar con el referente inanimado singular."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000225", "The researchers asked", "my colleague and I", "to review the data", "before publication.", "B", "The researchers asked my colleague and me to review the data before publication.", "Como objeto de «asked», corresponde «me», aunque esté coordinado."),
                    e("30000000-0000-4000-8000-000000000226", "When the two chemicals are mixed,", "it produces", "a gas with", "a strong odor.", "B", "When the two chemicals are mixed, they produce a gas with a strong odor.", "El pronombre debe referirse al antecedente plural «two chemicals»."),
                    e("30000000-0000-4000-8000-000000000227", "The report itself", "contains several tables", "but none of it", "is clearly labeled.", "C", "The report itself contains several tables, but none of them is clearly labeled.", "El pronombre debe referirse al plural «tables», por lo que se usa «them»."),
                    e("30000000-0000-4000-8000-000000000228", "Neither of the candidates", "explained their proposal", "as clearly as", "the committee expected they to.", "D", "Neither of the candidates explained their proposal as clearly as the committee expected them to.", "Después de «expected» se necesita el pronombre objeto «them», no el pronombre sujeto «they»."),
                    e("30000000-0000-4000-8000-000000000229", "The museum and the archive", "each have their own", "conservation laboratory", "inside its main building.", "D", "The museum and the archive each have their own conservation laboratory inside their main buildings.", "El posesivo final debe concordar con los dos referentes plurales y cada institución posee un edificio."),
                    e("30000000-0000-4000-8000-000000000230", "The supervisor reminded the interns", "to check every label", "before it were submitted", "to the central database.", "C", "The supervisor reminded the interns to check every label before it was submitted to the central database.", "El pronombre singular «it» requiere el auxiliar singular «was»."),
                ],
            },
            {
                code: "NOUN_APPOSITION",
                name: "Aposición",
                description: "Usar grupos nominales apositivos para identificar o explicar otro sustantivo.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000231", "Marie Curie, ______, conducted pioneering research on radioactivity.", "", "a Polish-born physicist", ["was a Polish-born physicist", "she was a Polish-born physicist", "who a Polish-born physicist"], "Marie Curie, a Polish-born physicist, conducted pioneering research on radioactivity.", "Una aposición es un grupo nominal sin verbo que renombra al sustantivo anterior.", "Añadir un verbo o un pronombre crea una cláusula que no encaja entre estas comas."),
                    c("30000000-0000-4000-8000-000000000232", "The Amazon, ______, influences rainfall across South America.", "", "the world's largest river by volume", ["is the world's largest river by volume", "which the world's largest river", "it is the world's largest river"], "The Amazon, the world's largest river by volume, influences rainfall across South America.", "El grupo nominal entre comas identifica «the Amazon» en aposición.", "La oración ya tiene el verbo principal «influences» y no necesita otra cláusula finita."),
                    c("30000000-0000-4000-8000-000000000233", "The committee selected Dr. Okafor, ______, to lead the investigation.", "", "an expert in structural engineering", ["is an expert in structural engineering", "who an expert in structural engineering", "she is an expert in structural engineering"], "The committee selected Dr. Okafor, an expert in structural engineering, to lead the investigation.", "La aposición nominal aporta información adicional sobre la persona seleccionada.", "Debe permanecer como grupo nominal para no interferir con la estructura «selected ... to lead»."),
                    c("30000000-0000-4000-8000-000000000234", "The largest moon of Saturn, ______, has a dense atmosphere.", "", "Titan", ["is Titan", "which Titan", "it Titan"], "The largest moon of Saturn, Titan, has a dense atmosphere.", "El nombre propio «Titan» renombra al grupo nominal anterior y funciona como aposición.", "La aposición no lleva cópula ni pronombre adicional."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000235", "The blue whale,", "is the largest animal on Earth,", "can reach a length", "of more than thirty meters.", "B", "The blue whale, the largest animal on Earth, can reach a length of more than thirty meters.", "La información entre comas debe ser una aposición nominal, no una cláusula con «is»."),
                    e("30000000-0000-4000-8000-000000000236", "Our guide, she is", "an experienced geologist,", "identified several minerals", "along the trail.", "A", "Our guide, an experienced geologist, identified several minerals along the trail.", "La aposición no debe repetir el sujeto con «she is»."),
                    e("30000000-0000-4000-8000-000000000237", "The capital of Peru Lima", "lies in a desert region", "along the country's", "Pacific coast.", "A", "The capital of Peru, Lima, lies in a desert region along the country's Pacific coast.", "Una aposición explicativa como «Lima» debe separarse con comas."),
                    e("30000000-0000-4000-8000-000000000238", "The telescope,", "an instrument that collects light", "it allows astronomers", "to observe distant objects.", "C", "The telescope, an instrument that collects light, allows astronomers to observe distant objects.", "El sujeto ya es «the telescope»; «it» crea un doble sujeto después de la aposición."),
                    e("30000000-0000-4000-8000-000000000239", "Alexander Fleming", "the discoverer of penicillin,", "received the Nobel Prize", "in 1945.", "A", "Alexander Fleming, the discoverer of penicillin, received the Nobel Prize in 1945.", "La aposición explicativa debe quedar encerrada entre dos comas."),
                    e("30000000-0000-4000-8000-000000000240", "The university appointed", "Professor Malik, who a specialist", "in renewable energy,", "as director of the center.", "B", "The university appointed Professor Malik, a specialist in renewable energy, as director of the center.", "Después de «who» haría falta un verbo; aquí la forma correcta es una aposición nominal sin «who»."),
                ],
            },
        ],
    },
    {
        code: "modification",
        name: "Modificación y comparación",
        skills: [
            {
                code: "MOD_ADJ_ADV",
                name: "Adjetivos y adverbios",
                description: "Elegir formas adjetivales o adverbiales según la función que cumplen.",
                cefr: "A2",
                completion: [
                    c("30000000-0000-4000-8000-000000000241", "The new method produces ______ accurate measurements.", "", "remarkably", ["remarkable", "remark", "remarking"], "The new method produces remarkably accurate measurements.", "Un adverbio modifica al adjetivo «accurate»; por eso se usa «remarkably».", "El adjetivo «remarkable» no puede modificar directamente a otro adjetivo en esta estructura."),
                    c("30000000-0000-4000-8000-000000000242", "The solution became ______ after being exposed to air.", "", "cloudy", ["cloudily", "cloud", "clouding"], "The solution became cloudy after being exposed to air.", "Después del verbo copulativo «became» se usa un adjetivo que describe al sujeto.", "Un adverbio modificaría la manera de una acción, pero aquí se atribuye un estado."),
                    c("30000000-0000-4000-8000-000000000243", "The technician handled the fragile instrument ______.", "", "carefully", ["careful", "care", "more careful"], "The technician handled the fragile instrument carefully.", "El adverbio «carefully» modifica la manera en que se realizó «handled».", "El adjetivo describiría un sustantivo, no la acción."),
                    c("30000000-0000-4000-8000-000000000244", "The results were ______ different from those of the earlier study.", "", "significantly", ["significant", "significance", "signify"], "The results were significantly different from those of the earlier study.", "El adverbio de grado «significantly» modifica al adjetivo «different».", "Se necesita una forma adverbial, no un sustantivo o verbo."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000245", "The guide spoke clear", "so that every visitor", "could understand", "the safety instructions.", "A", "The guide spoke clearly so that every visitor could understand the safety instructions.", "El verbo «spoke» debe ser modificado por el adverbio «clearly»."),
                    e("30000000-0000-4000-8000-000000000246", "The newly discovered species", "is remarkable similar", "to one found", "on a neighboring island.", "B", "The newly discovered species is remarkably similar to one found on a neighboring island.", "El adjetivo «similar» requiere el modificador adverbial «remarkably»."),
                    e("30000000-0000-4000-8000-000000000247", "The machine operates quiet", "even when processing", "large quantities", "of material.", "A", "The machine operates quietly even when processing large quantities of material.", "La manera de operar se expresa con el adverbio «quietly»."),
                    e("30000000-0000-4000-8000-000000000248", "The committee found", "the revised proposal", "financially and practical", "for the small organization.", "C", "The committee found the revised proposal financially practical for the small organization.", "«Financially» modifica al adjetivo «practical»; «and» une incorrectamente formas de distinta función."),
                    e("30000000-0000-4000-8000-000000000249", "The coastal road is", "extreme narrow", "in several places", "near the old lighthouse.", "B", "The coastal road is extremely narrow in several places near the old lighthouse.", "El adjetivo «narrow» debe ser intensificado por el adverbio «extremely»."),
                    e("30000000-0000-4000-8000-000000000250", "The data were entered", "correct into", "the central database", "by two assistants.", "B", "The data were entered correctly into the central database by two assistants.", "El adverbio «correctly» modifica al verbo pasivo «were entered»."),
                ],
            },
            {
                code: "MOD_ORDER",
                name: "Orden de modificadores",
                description: "Colocar adjetivos, adverbios y modificadores nominales en un orden natural y no ambiguo.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000251", "The museum acquired a ______ table from the colonial period.", "", "beautiful old wooden", ["wooden old beautiful", "old beautiful wooden", "beautiful wooden old"], "The museum acquired a beautiful old wooden table from the colonial period.", "El orden habitual es opinión, edad y material antes del sustantivo.", "Los adjetivos no se ordenan al azar; el material suele quedar más cerca del nombre."),
                    c("30000000-0000-4000-8000-000000000252", "The team installed a ______ monitoring system.", "", "highly reliable digital", ["digital highly reliable", "reliable highly digital", "high digital reliable"], "The team installed a highly reliable digital monitoring system.", "El adverbio modifica «reliable» y el adjetivo de tipo «digital» queda cerca del sustantivo compuesto.", "No debe separarse «highly» del adjetivo que modifica."),
                    c("30000000-0000-4000-8000-000000000253", "The archive contains several ______ maps.", "", "carefully preserved nineteenth-century", ["nineteenth-century carefully preserved", "preserved carefully nineteenth-century", "careful preserved nineteenth-century"], "The archive contains several carefully preserved nineteenth-century maps.", "El participio modificado por adverbio precede al adjetivo clasificatorio de fecha.", "«Carefully» debe permanecer unido a «preserved», y la forma requerida es adverbial."),
                    c("30000000-0000-4000-8000-000000000254", "They observed a ______ bird near the marsh.", "", "small bright-blue", ["bright-blue small", "brightly blue small", "blue brightly small"], "They observed a small bright-blue bird near the marsh.", "El tamaño suele preceder al color, y el color compuesto funciona como adjetivo.", "«Brightly» no modifica «blue» de esta manera en el grupo adjetival atributivo."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000255", "The researchers purchased", "a metal new cabinet", "for storing", "sensitive equipment.", "B", "The researchers purchased a new metal cabinet for storing sensitive equipment.", "El adjetivo de edad/condición «new» precede al material «metal»."),
                    e("30000000-0000-4000-8000-000000000256", "The library displays", "an illustrated beautifully manuscript", "from the early", "sixteenth century.", "B", "The library displays a beautifully illustrated manuscript from the early sixteenth century.", "El adverbio «beautifully» debe preceder y modificar al participio «illustrated»."),
                    e("30000000-0000-4000-8000-000000000257", "The expedition crossed", "a covered snow narrow pass", "before reaching", "the western valley.", "B", "The expedition crossed a narrow snow-covered pass before reaching the western valley.", "El tamaño precede al compuesto de material/estado «snow-covered»."),
                    e("30000000-0000-4000-8000-000000000258", "The laboratory needs", "two glass large containers", "for the next", "phase of the experiment.", "B", "The laboratory needs two large glass containers for the next phase of the experiment.", "El tamaño «large» se coloca antes del material «glass»."),
                    e("30000000-0000-4000-8000-000000000259", "The article presents", "a detailed unusually analysis", "of population changes", "over three centuries.", "B", "The article presents an unusually detailed analysis of population changes over three centuries.", "El adverbio «unusually» debe preceder al adjetivo «detailed», y la frase comienza con «an»."),
                    e("30000000-0000-4000-8000-000000000260", "The team developed", "an energy efficient highly device", "for use in", "remote research stations.", "B", "The team developed a highly energy-efficient device for use in remote research stations.", "«Highly» modifica al compuesto «energy-efficient», que debe permanecer unido antes del sustantivo."),
                ],
            },
            {
                code: "MOD_COMPARISON",
                name: "Comparativos y superlativos",
                description: "Formar comparaciones, superlativos y estructuras proporcionales sin redundancia.",
                cefr: "A2",
                completion: [
                    c("30000000-0000-4000-8000-000000000261", "The revised procedure is ______ the original one.", "", "more efficient than", ["more efficient that", "most efficient than", "efficienter than"], "The revised procedure is more efficient than the original one.", "Los adjetivos largos forman el comparativo con «more» y usan «than».", "No se combina «most» con «than» ni se añade «-er» a este adjetivo."),
                    c("30000000-0000-4000-8000-000000000262", "Of all the samples, this one contains ______ concentration of salt.", "", "the highest", ["the higher", "higher than", "most high"], "Of all the samples, this one contains the highest concentration of salt.", "Al comparar un elemento con todo un grupo se usa el superlativo con «the».", "El comparativo «higher» requeriría dos términos explícitos."),
                    c("30000000-0000-4000-8000-000000000263", "The more carefully the data are checked, ______ the final report will be.", "", "the more reliable", ["more reliable", "the most reliable", "reliabler"], "The more carefully the data are checked, the more reliable the final report will be.", "La estructura proporcional es «the more ..., the more ...».", "Ambas mitades requieren «the» para expresar la relación gradual."),
                    c("30000000-0000-4000-8000-000000000264", "The northern route is not ______ the coastal route.", "", "as direct as", ["so direct than", "as direct than", "more direct as"], "The northern route is not as direct as the coastal route.", "La comparación de igualdad usa «as + adjetivo + as».", "No se mezcla «as» con «than»."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000265", "This microscope is", "more powerful that", "the model used", "in the older laboratory.", "B", "This microscope is more powerful than the model used in the older laboratory.", "Los comparativos usan «than», no «that»."),
                    e("30000000-0000-4000-8000-000000000266", "The second experiment produced", "the most consistent results", "than the first", "under identical conditions.", "B", "The second experiment produced more consistent results than the first under identical conditions.", "Una comparación entre dos elementos usa comparativo, no superlativo."),
                    e("30000000-0000-4000-8000-000000000267", "The river is", "twice longer than", "it was before", "the map was revised.", "B", "The river is twice as long as it was before the map was revised.", "Con multiplicadores como «twice» se usa «as + adjetivo + as»."),
                    e("30000000-0000-4000-8000-000000000268", "Of the two proposals,", "the first is the best", "suited to the needs", "of a small community.", "B", "Of the two proposals, the first is better suited to the needs of a small community.", "Entre dos alternativas se usa el comparativo «better», no el superlativo «best»."),
                    e("30000000-0000-4000-8000-000000000269", "The higher the temperature rises,", "the reaction occurs faster", "inside the sealed", "glass container.", "B", "The higher the temperature rises, the faster the reaction occurs inside the sealed glass container.", "La segunda mitad de una comparación proporcional también necesita «the + comparativo»."),
                    e("30000000-0000-4000-8000-000000000270", "No other building on campus", "is as taller as", "the new research", "tower near the library.", "B", "No other building on campus is as tall as the new research tower near the library.", "La estructura «as ... as» usa el adjetivo base, no el comparativo."),
                ],
            },
            {
                code: "MOD_ATTACHMENT",
                name: "Referencia de modificadores",
                description: "Vincular modificadores con el elemento correcto y evitar ambigüedad o modificadores colgantes.",
                cefr: "B2",
                completion: [
                    c("30000000-0000-4000-8000-000000000271", "To reduce measurement errors, ______.", "", "the technicians recalibrated the device", ["the device was recalibrated", "recalibration was performed", "measurement errors were reviewed"], "To reduce measurement errors, the technicians recalibrated the device.", "El sujeto implícito del infinitivo debe ser quien realiza la acción de reducir y recalibrar.", "Un sujeto pasivo o inanimado puede crear un modificador colgante si no realiza la acción inicial."),
                    c("30000000-0000-4000-8000-000000000272", "After reading the report, ______.", "", "the director requested more data", ["more data were requested", "the report seemed incomplete", "several questions remained"], "After reading the report, the director requested more data.", "El sujeto de la cláusula principal debe ser también quien leyó el informe.", "La frase inicial no puede modificar lógicamente a «data», «report» o «questions»."),
                    c("30000000-0000-4000-8000-000000000273", "Nearly impossible to detect without special equipment, ______.", "", "the gas poses a serious risk", ["researchers developed a sensor", "the laboratory installed alarms", "workers receive training"], "Nearly impossible to detect without special equipment, the gas poses a serious risk.", "El adjetivo inicial debe describir directamente al sujeto inmediato «the gas».", "Si aparece primero una persona, la frase parece decir que esa persona es imposible de detectar."),
                    c("30000000-0000-4000-8000-000000000274", "Using satellite images, ______ changes in the coastline.", "", "the team documented", ["changes were documented by the team", "the coastline showed", "the images revealed by the team"], "Using satellite images, the team documented changes in the coastline.", "El sujeto «the team» es quien usa las imágenes y documenta los cambios.", "La voz pasiva puede dejar sin referente lógico al gerundio inicial."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000275", "Driving through the mountains,", "the ancient ruins", "appeared unexpectedly", "beside the road.", "A", "As the travelers drove through the mountains, the ancient ruins appeared unexpectedly beside the road.", "La cláusula inicial debe nombrar a quienes conducen para no modificar erróneamente a «the ancient ruins»."),
                    e("30000000-0000-4000-8000-000000000276", "To improve water quality,", "the town was installed", "a new filtration system", "near the reservoir.", "B", "To improve water quality, the town installed a new filtration system near the reservoir.", "El sujeto «the town» realiza la acción y necesita la voz activa «installed», no «was installed»."),
                    e("30000000-0000-4000-8000-000000000277", "Covered with thick vegetation,", "the explorers could barely see", "the entrance to the cave", "from the narrow trail.", "B", "Covered with thick vegetation, the entrance to the cave was barely visible to the explorers from the narrow trail.", "«Covered» debe modificar a «the entrance», no a «the explorers»."),
                    e("30000000-0000-4000-8000-000000000278", "While examining the artifact,", "a small inscription", "attracted the historian's", "immediate attention.", "A", "While the historian was examining the artifact, a small inscription attracted the historian's immediate attention.", "La cláusula inicial debe expresar que el historiador examina el objeto para no modificar a «inscription»."),
                    e("30000000-0000-4000-8000-000000000279", "After reviewing recent evidence,", "the theory was revised", "by the researchers", "before publication.", "A", "After the researchers reviewed recent evidence, the theory was revised before publication.", "La cláusula inicial debe nombrar a quienes revisan; en la forma reducida parecía modificar a «the theory»."),
                    e("30000000-0000-4000-8000-000000000280", "To reach the remote station,", "a three-hour hike", "must be completed", "after leaving the road.", "A", "For visitors to reach the remote station, a three-hour hike must be completed after leaving the road.", "La frase de propósito debe nombrar a «visitors» como quienes intentan llegar para evitar una referencia colgante."),
                ],
            },
        ],
    },
    {
        code: "lexical_morphology",
        name: "Forma y selección léxica",
        skills: [
            {
                code: "LEX_WORD_FORM",
                name: "Familias de palabras",
                description: "Seleccionar la categoría morfológica correcta dentro de una familia léxica.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000281", "The discovery had a ______ effect on the field of genetics.", "", "significant", ["significantly", "significance", "signify"], "The discovery had a significant effect on the field of genetics.", "Se necesita un adjetivo para modificar al sustantivo «effect».", "Las formas adverbial, nominal y verbal no ocupan esta posición atributiva."),
                    c("30000000-0000-4000-8000-000000000282", "The committee reached its decision after ______ reviewing the evidence.", "", "carefully", ["careful", "care", "carefulness"], "The committee reached its decision after carefully reviewing the evidence.", "Un adverbio modifica al gerundio verbal «reviewing».", "La posición requiere expresar cómo se realizó la revisión."),
                    c("30000000-0000-4000-8000-000000000283", "The rapid ______ of the city created new transportation needs.", "", "expansion", ["expand", "expansive", "expandingly"], "The rapid expansion of the city created new transportation needs.", "Después del adjetivo y antes de «of» se necesita el sustantivo «expansion».", "Las demás formas no pueden ser núcleo del grupo nominal."),
                    c("30000000-0000-4000-8000-000000000284", "The new evidence may ______ the original interpretation.", "", "strengthen", ["strength", "strong", "strongly"], "The new evidence may strengthen the original interpretation.", "Después del modal «may» se requiere un verbo en forma base.", "Las formas nominal, adjetival y adverbial no completan el predicado."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000285", "The sudden appear", "of cracks in the wall", "forced the museum", "to close the gallery.", "A", "The sudden appearance of cracks in the wall forced the museum to close the gallery.", "Después de «the sudden» se necesita el sustantivo «appearance»."),
                    e("30000000-0000-4000-8000-000000000286", "The researchers were", "surprise by", "the accuracy of", "the preliminary results.", "B", "The researchers were surprised by the accuracy of the preliminary results.", "Después de «were» en esta pasiva/adjetivo se necesita «surprised»."),
                    e("30000000-0000-4000-8000-000000000287", "The policy was introduced", "to encourage the conserve", "of water during", "the dry season.", "B", "The policy was introduced to encourage the conservation of water during the dry season.", "Después del artículo «the» se requiere el sustantivo «conservation»."),
                    e("30000000-0000-4000-8000-000000000288", "The machine operates", "with remarkable efficient", "even under", "extreme conditions.", "B", "The machine operates with remarkable efficiency even under extreme conditions.", "Después de la preposición «with» y el adjetivo «remarkable» se necesita un sustantivo."),
                    e("30000000-0000-4000-8000-000000000289", "The team successful completed", "the installation", "two days ahead", "of schedule.", "A", "The team successfully completed the installation two days ahead of schedule.", "El verbo «completed» debe ser modificado por el adverbio «successfully»."),
                    e("30000000-0000-4000-8000-000000000290", "The results demonstrate", "the reliable of", "the revised method", "across different laboratories.", "B", "The results demonstrate the reliability of the revised method across different laboratories.", "La estructura «the ... of» necesita el sustantivo «reliability»."),
                ],
            },
            {
                code: "LEX_PREPOSITION",
                name: "Preposiciones",
                description: "Elegir preposiciones requeridas por tiempo, lugar y regímenes léxicos frecuentes.",
                cefr: "A2",
                completion: [
                    c("30000000-0000-4000-8000-000000000291", "The research team arrived ______ the field station shortly after noon.", "", "at", ["to", "in", "on"], "The research team arrived at the field station shortly after noon.", "«Arrive at» se usa con un punto o lugar específico.", "«Arrive» no toma «to», y «in» se reserva normalmente para ciudades o países."),
                    c("30000000-0000-4000-8000-000000000292", "The results are consistent ______ those reported in the earlier study.", "", "with", ["to", "of", "for"], "The results are consistent with those reported in the earlier study.", "El adjetivo «consistent» rige la preposición «with».", "La combinación es léxica y no se sustituye por una traducción literal."),
                    c("30000000-0000-4000-8000-000000000293", "The museum will remain closed ______ Monday morning.", "", "until", ["for", "since", "during"], "The museum will remain closed until Monday morning.", "«Until» marca el punto final de una situación.", "«For» expresa duración, «since» un punto inicial y «during» necesita un período nominal."),
                    c("30000000-0000-4000-8000-000000000294", "The samples were divided ______ three equal groups.", "", "into", ["in", "among", "between"], "The samples were divided into three equal groups.", "«Divide into» expresa el resultado de formar partes o grupos.", "«Among» y «between» describen distribución, no la transformación en grupos."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000295", "The article focuses in", "the social effects", "of rapid urban growth", "during the last century.", "A", "The article focuses on the social effects of rapid urban growth during the last century.", "El verbo «focus» rige la preposición «on»."),
                    e("30000000-0000-4000-8000-000000000296", "The committee is responsible of", "reviewing all applications", "and selecting", "the final candidates.", "A", "The committee is responsible for reviewing all applications and selecting the final candidates.", "El adjetivo «responsible» se combina con «for»."),
                    e("30000000-0000-4000-8000-000000000297", "The laboratory has operated", "since twenty years", "without a major", "safety incident.", "B", "The laboratory has operated for twenty years without a major safety incident.", "Una duración usa «for»; «since» introduce un punto de inicio."),
                    e("30000000-0000-4000-8000-000000000298", "The fossils were found", "among two layers of rock", "dating from", "different geological periods.", "B", "The fossils were found between two layers of rock dating from different geological periods.", "Al ubicar algo respecto de exactamente dos capas se usa «between», no «among»."),
                    e("30000000-0000-4000-8000-000000000299", "The new policy differs than", "the previous one", "in several", "important respects.", "A", "The new policy differs from the previous one in several important respects.", "El verbo «differ» introduce el punto de comparación con la preposición «from», no con «than»."),
                    e("30000000-0000-4000-8000-000000000300", "The students discussed", "about the article", "with their instructor", "after class.", "B", "The students discussed the article with their instructor after class.", "«Discuss» es transitivo y no necesita «about» antes del objeto."),
                ],
            },
            {
                code: "LEX_COLLOCATION",
                name: "Colocaciones académicas",
                description: "Reconocer combinaciones léxicas frecuentes en inglés académico.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000301", "The new findings ______ serious doubts about the earlier conclusion.", "", "raise", ["rise", "lift", "grow"], "The new findings raise serious doubts about the earlier conclusion.", "La colocación académica es «raise doubts»; «raise» es transitivo.", "«Rise» es intransitivo y los otros verbos no forman la combinación habitual."),
                    c("30000000-0000-4000-8000-000000000302", "The study ______ attention to the need for better coastal planning.", "", "draws", ["pays", "makes", "takes"], "The study draws attention to the need for better coastal planning.", "La colocación es «draw attention to» cuando algo hace visible un asunto.", "«Pay attention» requiere normalmente un sujeto animado que atiende."),
                    c("30000000-0000-4000-8000-000000000303", "Researchers must ______ into account seasonal changes in temperature.", "", "take", ["make", "put", "bring"], "Researchers must take into account seasonal changes in temperature.", "La expresión fija es «take into account».", "El verbo no puede cambiarse sin romper la colocación."),
                    c("30000000-0000-4000-8000-000000000304", "The evidence ______ the conclusion that the two sites were connected.", "", "supports", ["sustains to", "assists", "holds up to"], "The evidence supports the conclusion that the two sites were connected.", "«Support a conclusion» es una colocación académica natural y transitiva.", "Las alternativas no expresan la relación argumentativa con este patrón."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000305", "The report makes emphasis on", "the importance of", "early detection", "and regular monitoring.", "A", "The report places emphasis on the importance of early detection and regular monitoring.", "La colocación es «place emphasis on», no «make emphasis»."),
                    e("30000000-0000-4000-8000-000000000306", "The researchers did a conclusion", "after comparing", "the results from", "all four laboratories.", "A", "The researchers reached a conclusion after comparing the results from all four laboratories.", "En inglés se «reach a conclusion», no se «do» una conclusión."),
                    e("30000000-0000-4000-8000-000000000307", "The new method has", "a major advantage than", "traditional techniques", "used in the field.", "B", "The new method has a major advantage over traditional techniques used in the field.", "La colocación comparativa fija es «have an advantage over», no «advantage than»."),
                    e("30000000-0000-4000-8000-000000000308", "The committee reached to a decision", "to postpone the launch", "until the safety review", "was complete.", "A", "The committee reached a decision to postpone the launch until the safety review was complete.", "«Reach a decision» toma objeto directo y no admite la preposición «to»."),
                    e("30000000-0000-4000-8000-000000000309", "The article gives light on", "how trade routes changed", "during the late", "medieval period.", "A", "The article sheds light on how trade routes changed during the late medieval period.", "La expresión fija es «shed light on»."),
                    e("30000000-0000-4000-8000-000000000310", "The evidence plays", "an important function", "in explaining", "the population decline.", "B", "The evidence plays an important role in explaining the population decline.", "La colocación es «play a role», no «play a function»."),
                ],
            },
            {
                code: "LEX_IDIOM",
                name: "Estructuras idiomáticas",
                description: "Usar expresiones fijas y patrones idiomáticos frecuentes en prosa formal.",
                cefr: "B2",
                completion: [
                    c("30000000-0000-4000-8000-000000000311", "The new procedure is ______ reducing processing time without sacrificing accuracy.", "", "capable of", ["capable to", "able of", "capability of"], "The new procedure is capable of reducing processing time without sacrificing accuracy.", "La expresión es «capable of + gerundio».", "«Able» usa infinitivo con «to», pero no es la forma presentada por las otras opciones."),
                    c("30000000-0000-4000-8000-000000000312", "The committee had difficulty ______ agreement on the final wording.", "", "reaching", ["to reach", "reach", "for reaching"], "The committee had difficulty reaching agreement on the final wording.", "La expresión «have difficulty» va seguida de gerundio.", "No se usa infinitivo después de «difficulty» en este patrón."),
                    c("30000000-0000-4000-8000-000000000313", "The island is home ______ several species found nowhere else.", "", "to", ["of", "for", "with"], "The island is home to several species found nowhere else.", "La expresión fija es «be home to».", "La preposición forma parte de la estructura idiomática."),
                    c("30000000-0000-4000-8000-000000000314", "The revised design makes it possible ______ the device remotely.", "", "to operate", ["operating", "operate", "to operating"], "The revised design makes it possible to operate the device remotely.", "El patrón es «make it + adjective + to-infinitive».", "El infinitivo expresa la acción que se vuelve posible."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000315", "The new evidence is", "likely to have an effect", "in how the theory", "is evaluated.", "C", "The new evidence is likely to have an effect on how the theory is evaluated.", "La expresión es «have an effect on»."),
                    e("30000000-0000-4000-8000-000000000316", "The team succeeded to complete", "the survey", "before the beginning", "of the rainy season.", "A", "The team succeeded in completing the survey before the beginning of the rainy season.", "«Succeed» se construye con «in + gerundio»."),
                    e("30000000-0000-4000-8000-000000000317", "The equipment is", "in need to repair", "before it can be used", "for another experiment.", "B", "The equipment is in need of repair before it can be used for another experiment.", "La expresión nominal fija es «in need of + sustantivo»."),
                    e("30000000-0000-4000-8000-000000000318", "The discovery took place of", "a remote valley", "that had not been", "surveyed before.", "A", "The discovery took place in a remote valley that had not been surveyed before.", "«Take place» no lleva «of»; el lugar se introduce con «in»."),
                    e("30000000-0000-4000-8000-000000000319", "The researchers are accustomed to work", "under difficult conditions", "in remote areas", "for long periods.", "A", "The researchers are accustomed to working under difficult conditions in remote areas for long periods.", "En «be accustomed to», «to» es preposición y va seguida de gerundio."),
                    e("30000000-0000-4000-8000-000000000320", "The findings are worth to examine", "because they challenge", "several assumptions", "of the current model.", "A", "The findings are worth examining because they challenge several assumptions of the current model.", "«Be worth» se construye directamente con gerundio."),
                ],
            },
        ],
    },
    {
        code: "logic_coordination",
        name: "Lógica y coordinación",
        skills: [
            {
                code: "LOGIC_PARALLEL",
                name: "Paralelismo",
                description: "Mantener formas gramaticales equivalentes en listas, comparaciones y coordinaciones.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000321", "The internship involves collecting samples, analyzing data, and ______ reports.", "", "writing", ["to write", "written", "write"], "The internship involves collecting samples, analyzing data, and writing reports.", "Los tres elementos coordinados después de «involves» deben ser gerundios paralelos.", "Cambiar a infinitivo, participio o forma base rompe la serie."),
                    c("30000000-0000-4000-8000-000000000322", "The new system is faster, safer, and ______ than the previous one.", "", "more reliable", ["reliably", "most reliable", "reliability"], "The new system is faster, safer, and more reliable than the previous one.", "La lista coordina tres adjetivos comparativos que describen al sistema.", "La tercera forma debe mantener función adjetival y grado comparativo."),
                    c("30000000-0000-4000-8000-000000000323", "The goal is not only to reduce costs but also ______ service quality.", "", "to improve", ["improving", "improved", "improvement of"], "The goal is not only to reduce costs but also to improve service quality.", "«Not only ... but also» debe coordinar dos infinitivos equivalentes.", "La segunda mitad debe repetir la estructura «to + verbo»."),
                    c("30000000-0000-4000-8000-000000000324", "The professor asked students to read the article and ______ its main argument.", "", "summarize", ["summarizing", "to summarized", "summary"], "The professor asked students to read the article and summarize its main argument.", "Los verbos coordinados comparten el «to»: «to read and summarize».", "Ambos elementos deben ser formas verbales base paralelas."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000325", "The course teaches students", "how to design experiments,", "analyze data,", "and the writing of reports.", "D", "The course teaches students how to design experiments, analyze data, and write reports.", "La lista debe coordinar tres verbos en forma base."),
                    e("30000000-0000-4000-8000-000000000326", "The new policy is intended", "to reduce waste,", "improving efficiency,", "and lower operating costs.", "C", "The new policy is intended to reduce waste, improve efficiency, and lower operating costs.", "Los tres objetivos comparten el infinitivo «to» y deben usar forma base."),
                    e("30000000-0000-4000-8000-000000000327", "The researchers were interested", "not only in the results", "but also how", "the results had been obtained.", "C", "The researchers were interested not only in the results but also in how the results had been obtained.", "Las dos mitades de la correlación deben comenzar con la misma preposición «in»."),
                    e("30000000-0000-4000-8000-000000000328", "The device is easy to install,", "simple to operate,", "and maintenance", "is inexpensive.", "C", "The device is easy to install, simple to operate, and inexpensive to maintain.", "Los tres elementos deben mantener la estructura adjetivo + infinitivo."),
                    e("30000000-0000-4000-8000-000000000329", "The committee valued", "her experience,", "her careful judgment,", "and that she was willing to cooperate.", "D", "The committee valued her experience, her careful judgment, and her willingness to cooperate.", "La lista exige tres grupos nominales paralelos."),
                    e("30000000-0000-4000-8000-000000000330", "The study compares", "water quality in urban rivers", "with rural streams", "that flow through forests.", "C", "The study compares water quality in urban rivers with water quality in rural streams that flow through forests.", "Los términos comparados deben ser equivalentes; se compara calidad con calidad, no calidad con corrientes."),
                ],
            },
            {
                code: "LOGIC_CORRELATIVE",
                name: "Conectores correlativos",
                description: "Coordinar elementos equivalentes con both/and, either/or, neither/nor y not only/but also.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000331", "The treatment is ______ inexpensive and easy to administer.", "", "both", ["either", "neither", "not"], "The treatment is both inexpensive and easy to administer.", "«Both ... and» suma dos características verdaderas.", "«Either» necesitaría «or» y «neither» expresaría negación."),
                    c("30000000-0000-4000-8000-000000000332", "The error may have occurred ______ during collection or during storage.", "", "either", ["both", "neither", "not only"], "The error may have occurred either during collection or during storage.", "«Either ... or» presenta dos alternativas posibles.", "Las preposiciones repetidas mantienen paralelas ambas opciones."),
                    c("30000000-0000-4000-8000-000000000333", "______ the director nor the assistants were available.", "", "Neither", ["Either", "Both", "Not only"], "Neither the director nor the assistants were available.", "La correlación «neither ... nor» enlaza dos elementos y niega la disponibilidad de ambos.", "El verbo concuerda aquí con el elemento cercano plural «assistants»."),
                    c("30000000-0000-4000-8000-000000000334", "The new evidence not only confirms the date ______ identifies the original owner.", "", "but also", ["and either", "nor", "as well"], "The new evidence not only confirms the date but also identifies the original owner.", "La pareja fija «not only ... but also» coordina dos verbos equivalentes.", "El conector debe conservar la correlación completa."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000335", "Both the rainfall", "as well as the temperature", "influence the growth", "of these plants.", "B", "Both the rainfall and the temperature influence the growth of these plants.", "La pareja correlativa correcta es «both ... and»."),
                    e("30000000-0000-4000-8000-000000000336", "Neither the original document", "or the later copy", "contains the missing", "final paragraph.", "B", "Neither the original document nor the later copy contains the missing final paragraph.", "La conjunción correlativa iniciada por «neither» debe completarse con «nor», no con «or»."),
                    e("30000000-0000-4000-8000-000000000337", "The instrument can measure", "either temperature", "and air pressure", "at the same time.", "B", "The instrument can measure both temperature and air pressure at the same time.", "Si se incluyen las dos medidas simultáneamente, corresponde «both ... and», no «either»."),
                    e("30000000-0000-4000-8000-000000000338", "Not only the survey was expensive,", "but it also required", "more time than", "the team had expected.", "A", "Not only was the survey expensive, but it also required more time than the team had expected.", "«Not only» al inicio de la cláusula exige inversión de auxiliar y sujeto."),
                    e("30000000-0000-4000-8000-000000000339", "The change affected", "both small farms", "and also large", "commercial operations.", "C", "The change affected both small farms and large commercial operations.", "Con «both ... and», «also» es redundante."),
                    e("30000000-0000-4000-8000-000000000340", "Either the manager or the assistants", "is responsible", "for checking the equipment", "at the end of the day.", "B", "Either the manager or the assistants are responsible for checking the equipment at the end of the day.", "Con «either ... or», el verbo concuerda con el elemento más cercano, aquí plural."),
                ],
            },
            {
                code: "LOGIC_NEGATION",
                name: "Negación y alcance",
                description: "Controlar dobles negaciones, palabras de polaridad y el alcance lógico de la negación.",
                cefr: "B1",
                completion: [
                    c("30000000-0000-4000-8000-000000000341", "The researchers found ______ evidence of contamination in the control sample.", "", "no", ["not any of", "none", "nothing"], "The researchers found no evidence of contamination in the control sample.", "«No» funciona como determinante antes del sustantivo incontable «evidence».", "«None» no modifica directamente a un sustantivo y «nothing» ya es pronombre."),
                    c("30000000-0000-4000-8000-000000000342", "Hardly ", " the test begun when the power failed.", "had", ["has", "did", "was"], "Hardly had the test begun when the power failed.", "«Hardly ... when» usa past perfect e inversión cuando «hardly» aparece al inicio.", "La acción apenas había comenzado antes del segundo evento pasado."),
                    c("30000000-0000-4000-8000-000000000343", "The new evidence does not ______ contradict the original theory.", "", "necessarily", ["necessary", "necessity", "necessitate"], "The new evidence does not necessarily contradict the original theory.", "«Not necessarily» limita el alcance de la negación y requiere un adverbio.", "Las demás formas no modifican correctamente al verbo «contradict»."),
                    c("30000000-0000-4000-8000-000000000344", "______ of the samples showed any visible change.", "", "None", ["No", "Nothing", "Neither one of all"], "None of the samples showed any visible change.", "«None of + plural» funciona como sujeto y combina naturalmente con «any» en la cláusula negativa.", "«No» necesitaría ir directamente antes del sustantivo, sin «of»."),
                ],
                errors: [
                    e("30000000-0000-4000-8000-000000000345", "The committee did not find", "no reason", "to delay the launch", "after the final inspection.", "B", "The committee did not find any reason to delay the launch after the final inspection.", "El inglés estándar evita la doble negación «not ... no»; se usa «any»."),
                    e("30000000-0000-4000-8000-000000000346", "Hardly no information", "was available", "about the earliest phase", "of the settlement.", "A", "Hardly any information was available about the earliest phase of the settlement.", "Después de «hardly» se usa «any», no otro negativo."),
                    e("30000000-0000-4000-8000-000000000347", "The instrument is not", "sensitive enough detecting", "the smallest changes", "in air pressure.", "B", "The instrument is not sensitive enough to detect the smallest changes in air pressure.", "La estructura es «adjective + enough + to-infinitive»."),
                    e("30000000-0000-4000-8000-000000000348", "Neither of the witnesses", "did not remember", "the exact time", "when the alarm sounded.", "B", "Neither of the witnesses remembered the exact time when the alarm sounded.", "«Neither» ya contiene negación; «did not» crea una doble negación."),
                    e("30000000-0000-4000-8000-000000000349", "The results are", "too inconsistent that", "the researchers cannot", "draw a firm conclusion.", "B", "The results are too inconsistent for the researchers to draw a firm conclusion.", "La estructura de exceso es «too + adjective + for + noun + to-infinitive»."),
                    e("30000000-0000-4000-8000-000000000350", "The new treatment has", "scarcely any side effects,", "and neither causes", "significant discomfort.", "C", "The new treatment has scarcely any side effects and causes no significant discomfort.", "«Neither» necesita una pareja o dos alternativas; aquí la negación simple debe expresarse con «no»."),
                ],
            },
        ],
    },
];

function reviewTokens(value: string): string[] {
    return value
        .toLocaleLowerCase("en")
        .replace(/[“”«».,;:!?()[\]—]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}

/**
 * Editorial second-pass helper. It uses a longest common subsequence to locate
 * words removed or replaced by each correction and checks that the authored
 * answer span contains the change. Add-only corrections are left to the
 * sentence-level review because no original token can identify their location.
 */
export function auditAuthoredErrorKeys(): GrammarAuthoredReviewIssue[] {
    const ids = ["A", "B", "C", "D"] as const;
    const issues: GrammarAuthoredReviewIssue[] = [];
    for (const domain of DOMAINS) {
        for (const skill of domain.skills) {
            for (const [itemIndex, seed] of skill.errors.entries()) {
                const originalTokens = (seed.slice(1, 5) as string[]).flatMap((part, segmentIndex) =>
                    reviewTokens(part).map((token) => ({ token, segmentIndex }))
                );
                const correctedTokens = reviewTokens(seed[6]);
                const rows = originalTokens.length + 1;
                const columns = correctedTokens.length + 1;
                const matrix = Array.from({ length: rows }, () => Array<number>(columns).fill(0));
                for (let left = 1; left < rows; left += 1) {
                    for (let right = 1; right < columns; right += 1) {
                        matrix[left][right] = originalTokens[left - 1].token === correctedTokens[right - 1]
                            ? matrix[left - 1][right - 1] + 1
                            : Math.max(matrix[left - 1][right], matrix[left][right - 1]);
                    }
                }
                const matched = new Set<number>();
                let left = originalTokens.length;
                let right = correctedTokens.length;
                while (left > 0 && right > 0) {
                    if (originalTokens[left - 1].token === correctedTokens[right - 1]) {
                        matched.add(left - 1);
                        left -= 1;
                        right -= 1;
                    } else if (matrix[left - 1][right] >= matrix[left][right - 1]) {
                        left -= 1;
                    } else {
                        right -= 1;
                    }
                }
                const changedSegments = [...new Set(
                    originalTokens
                        .map((token, index) => ({ ...token, index }))
                        .filter(({ index }) => !matched.has(index))
                        .map(({ segmentIndex }) => ids[segmentIndex])
                )];
                if (changedSegments.length > 0 && !changedSegments.includes(seed[5])) {
                    issues.push({
                        skillCode: skill.code,
                        item: itemIndex + 1,
                        declaredSegment: seed[5],
                        changedSegments,
                        original: (seed.slice(1, 5) as string[]).join(" "),
                        corrected: seed[6],
                    });
                }
            }
        }
    }
    return issues;
}

function stableUuid(prefix: string, index: number): string {
    return `${prefix}0000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

function makeOptions(
    correct: string,
    wrongs: readonly [string, string, string],
    correctId: GrammarOptionId,
    misconception: string,
) {
    const values = [...wrongs];
    values.splice(["A", "B", "C", "D"].indexOf(correctId), 0, correct);
    return (["A", "B", "C", "D"] as const).map((id, index) => ({
        id,
        text: values[index],
        ...(id === correctId ? {} : {
            misconceptionCode: "FORM_OR_STRUCTURE",
            feedback: misconception,
        }),
    }));
}

function splitIntoChunks(value: string, count: number): string[] {
    if (count === 0) return [];
    const words = value.trim().split(/\s+/).filter(Boolean);
    const chunks: string[] = [];
    let cursor = 0;
    for (let index = 0; index < count; index += 1) {
        const remainingWords = words.length - cursor;
        const remainingChunks = count - index;
        const take = Math.max(1, Math.ceil(remainingWords / remainingChunks));
        chunks.push(words.slice(cursor, cursor + take).join(" "));
        cursor += take;
    }
    return chunks;
}

/**
 * Keeps sentence order intact while varying the four underlined spans. The
 * authored seed identifies the exact faulty phrase; span boundaries can move
 * around it without changing the sentence or the single correction.
 */
function makeErrorSegments(seed: ErrorSeed, correctId: GrammarOptionId) {
    const ids = ["A", "B", "C", "D"] as const;
    const originalCorrectIndex = ids.indexOf(seed[5]);
    const targetIndex = ids.indexOf(correctId);
    const authoredParts = seed.slice(1, 5) as string[];
    const before = authoredParts.slice(0, originalCorrectIndex).join(" ").trim();
    const faulty = authoredParts[originalCorrectIndex].trim();
    const after = authoredParts.slice(originalCorrectIndex + 1).join(" ").trim();
    const beforeChunks = splitIntoChunks(before, targetIndex);
    const afterChunks = splitIntoChunks(after, 3 - targetIndex);
    const faultySpan = [
        targetIndex === 0 ? before : "",
        faulty,
        targetIndex === 3 ? after : "",
    ].filter(Boolean).join(" ");
    const chunks = [...beforeChunks, faultySpan, ...afterChunks];
    return chunks.map((text, index) => ({
        text: `${text}${index < 3 ? " " : ""}`,
        optionId: ids[index],
    }));
}

function feasibleErrorIds(seed: ErrorSeed): GrammarOptionId[] {
    const ids = ["A", "B", "C", "D"] as const;
    const originalCorrectIndex = ids.indexOf(seed[5]);
    const authoredParts = seed.slice(1, 5) as string[];
    const beforeWords = authoredParts
        .slice(0, originalCorrectIndex)
        .join(" ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    const afterWords = authoredParts
        .slice(originalCorrectIndex + 1)
        .join(" ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    return ids.filter((_, index) => beforeWords >= index && afterWords >= 3 - index);
}

function rebalanceCompletionKeys(exercises: GrammarExercise[]) {
    const ids = ["A", "B", "C", "D"] as const;
    const desiredTotals: Record<GrammarOptionId, number> = { A: 88, B: 88, C: 87, D: 87 };
    const errorCounts: Record<GrammarOptionId, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (const exercise of exercises) {
        if (exercise.format === "error_identification") errorCounts[exercise.correct_option_id] += 1;
    }
    const targetKeys = ids.flatMap((id) =>
        Array.from({ length: desiredTotals[id] - errorCounts[id] }, () => id)
    );
    let completionIndex = 0;
    for (const exercise of exercises) {
        if (exercise.prompt.kind !== "sentence_completion") continue;
        const targetId = targetKeys[completionIndex];
        completionIndex += 1;
        const correct = exercise.prompt.options.find((option) => option.id === exercise.correct_option_id)!;
        const wrongs = exercise.prompt.options.filter((option) => option.id !== exercise.correct_option_id);
        let wrongIndex = 0;
        exercise.prompt.options = ids.map((id) => ({
            ...(id === targetId ? correct : wrongs[wrongIndex++]),
            id,
        }));
        exercise.correct_option_id = targetId;
    }
}

export function createGrammarCatalog(): {
    domains: GrammarDomain[];
    skills: GrammarSkill[];
    exercises: GrammarExercise[];
} {
    const domains: GrammarDomain[] = [];
    const skills: GrammarSkill[] = [];
    const exercises: GrammarExercise[] = [];
    let skillIndex = 0;
    let exerciseIndex = 0;
    const answerKeyCounts: Record<GrammarOptionId, number> = { A: 0, B: 0, C: 0, D: 0 };

    for (const [domainOffset, domain] of DOMAINS.entries()) {
        const domainId = stableUuid("1", domainOffset + 1);
        domains.push({
            id: domainId,
            code: domain.code,
            name_es: domain.name,
            order_index: domainOffset + 1,
        });

        for (const [skillOffset, blueprint] of domain.skills.entries()) {
            skillIndex += 1;
            const skillId = stableUuid("2", skillIndex);
            skills.push({
                id: skillId,
                domain_id: domainId,
                code: blueprint.code,
                name_es: blueprint.name,
                description_es: blueprint.description,
                cefr_min: blueprint.cefr,
                order_index: skillOffset + 1,
                is_active: true,
            });

            for (const seed of blueprint.completion) {
                exerciseIndex += 1;
                const correctId = (["A", "B", "C", "D"] as const)[(exerciseIndex - 1) % 4];
                answerKeyCounts[correctId] += 1;
                exercises.push({
                    id: seed[0],
                    primary_skill_id: skillId,
                    domain_id: domainId,
                    skill_code: blueprint.code,
                    format: "sentence_completion",
                    cefr_band: blueprint.cefr,
                    difficulty: ((exerciseIndex - 1) % 3 + 1) as 1 | 2 | 3,
                    prompt: {
                        kind: "sentence_completion",
                        before: seed[1],
                        after: seed[2],
                        options: makeOptions(seed[3], seed[4], correctId, seed[7]),
                    },
                    correct_option_id: correctId,
                    corrected_sentence: seed[5],
                    explanation_es: seed[6],
                    status: "published",
                    content_version: 1,
                    linguistic_reviewed: true,
                    fairness_reviewed: true,
                });
            }

            for (const seed of blueprint.errors) {
                exerciseIndex += 1;
                const correctId = feasibleErrorIds(seed)
                    .sort((left, right) =>
                        answerKeyCounts[left] - answerKeyCounts[right] ||
                        (["A", "B", "C", "D"] as const).indexOf(left) -
                        (["A", "B", "C", "D"] as const).indexOf(right)
                    )[0];
                answerKeyCounts[correctId] += 1;
                exercises.push({
                    id: seed[0],
                    primary_skill_id: skillId,
                    domain_id: domainId,
                    skill_code: blueprint.code,
                    format: "error_identification",
                    cefr_band: blueprint.cefr,
                    difficulty: ((exerciseIndex - 1) % 3 + 1) as 1 | 2 | 3,
                    prompt: {
                        kind: "error_identification",
                        segments: makeErrorSegments(seed, correctId),
                    },
                    correct_option_id: correctId,
                    corrected_sentence: seed[6],
                    explanation_es: seed[7],
                    status: "published",
                    content_version: 1,
                    linguistic_reviewed: true,
                    fairness_reviewed: true,
                });
            }
        }
    }

    rebalanceCompletionKeys(exercises);
    return { domains, skills, exercises };
}

export const GRAMMAR_CATALOG = createGrammarCatalog();
