const INTERNAL_REDIRECT_BASE = "https://macitta.invalid";
const ENCODED_PATH_SEPARATOR = /^\/%(?:2f|5c)/i;
function hasUnsafeRedirectCharacters(value: string): boolean {
    return value.includes("\\") ||
        Array.from(value).some((character) => {
            const code = character.charCodeAt(0);
            return code <= 31 || code === 127;
        });
}

/**
 * Accepts only same-origin paths for post-authentication redirects.
 *
 * Redirect parameters are attacker-controlled input. Normalizing them in one
 * place prevents protocol-relative URLs, backslash URL confusion and header
 * injection from becoming open redirects.
 */
export function safeInternalRedirect(
    value: string | null | undefined,
    fallback = "/dashboard",
): string {
    if (
        !value ||
        value.length > 2048 ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        ENCODED_PATH_SEPARATOR.test(value) ||
        hasUnsafeRedirectCharacters(value)
    ) {
        return fallback;
    }

    try {
        const parsed = new URL(value, INTERNAL_REDIRECT_BASE);
        if (parsed.origin !== INTERNAL_REDIRECT_BASE || !parsed.pathname.startsWith("/")) {
            return fallback;
        }
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return fallback;
    }
}

export const CONTENT_LIMITS = {
    actionBytes: 512 * 1024,
    importBytes: 384 * 1024,
    decksPerUser: 100,
    cardsPerDeck: 5_000,
    cardsPerImport: 200,
    slotsPerCard: 8,
    answersPerSlot: 20,
    title: 120,
    description: 2_000,
    frontText: 4_000,
    label: 80,
    answer: 500,
    mediaUrl: 2_048,
    advancedRulesBytes: 32 * 1024,
} as const;

export interface SanitizedCardSlot {
    label: string;
    accepted_answers: string[];
    match_type: "any" | "exact" | "advanced";
    order_index: number;
    advanced_rules: unknown | null;
    media: string | null;
}

export interface SanitizedCardInput {
    frontText: string;
    frontMedia: string | null;
    slots: SanitizedCardSlot[];
}

export interface SanitizedDeckImport {
    deck: {
        title: string;
        description: string | null;
        color: string | null;
        questionLabels: string[];
        answerLabels: string[];
    };
    cards: SanitizedCardInput[];
}

function inputError(message: string): never {
    throw new Error(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(
    value: unknown,
    label: string,
    maximum: number,
    minimum = 1,
): string {
    if (typeof value !== "string") inputError(`${label} debe ser texto.`);
    const cleaned = value.trim();
    if (cleaned.length < minimum || cleaned.length > maximum) {
        inputError(`${label} debe tener entre ${minimum} y ${maximum} caracteres.`);
    }
    return cleaned;
}

function cleanOptionalText(
    value: unknown,
    label: string,
    maximum: number,
): string | null {
    if (value == null || value === "") return null;
    return cleanText(value, label, maximum);
}

function cleanMediaUrl(value: unknown): string | null {
    if (value == null || value === "") return null;
    const url = cleanText(value, "La URL multimedia", CONTENT_LIMITS.mediaUrl);
    if (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\")) {
        return url;
    }
    try {
        const parsed = new URL(url);
        if (parsed.protocol === "https:") return parsed.toString();
    } catch {
        // The public error below deliberately avoids echoing attacker input.
    }
    return inputError("La URL multimedia debe usar HTTPS o una ruta interna.");
}

function sanitizeJson(value: unknown, label: string, maxBytes: number): unknown {
    let serialized: string;
    try {
        serialized = JSON.stringify(value);
    } catch {
        return inputError(`${label} no contiene JSON válido.`);
    }
    if (!serialized || new TextEncoder().encode(serialized).byteLength > maxBytes) {
        return inputError(`${label} es demasiado grande.`);
    }
    return JSON.parse(serialized) as unknown;
}

function cleanStringArray(
    value: unknown,
    label: string,
    maximumItems: number,
    maximumLength: number,
): string[] {
    if (!Array.isArray(value) || value.length === 0 || value.length > maximumItems) {
        return inputError(`${label} debe contener entre 1 y ${maximumItems} elementos.`);
    }
    return value.map((item, index) =>
        cleanText(item, `${label} ${index + 1}`, maximumLength)
    );
}

function sanitizeSlot(value: unknown, index: number): SanitizedCardSlot {
    if (!isRecord(value)) inputError(`La respuesta ${index + 1} no es válida.`);
    const label = cleanText(
        value.field ?? value.label,
        `La etiqueta de respuesta ${index + 1}`,
        CONTENT_LIMITS.label,
    );
    const rawAnswer = value.text ?? value.accepted_answers ?? value.advanced_rules;
    let acceptedAnswers: string[] = [];
    let advancedRules: unknown | null = null;
    let matchType: SanitizedCardSlot["match_type"];

    if (typeof rawAnswer === "string") {
        acceptedAnswers = [cleanText(rawAnswer, "La respuesta", CONTENT_LIMITS.answer)];
        matchType = "exact";
    } else if (Array.isArray(rawAnswer)) {
        acceptedAnswers = cleanStringArray(
            rawAnswer,
            "Las respuestas aceptadas",
            CONTENT_LIMITS.answersPerSlot,
            CONTENT_LIMITS.answer,
        );
        matchType = "any";
    } else if (isRecord(rawAnswer)) {
        advancedRules = sanitizeJson(
            rawAnswer,
            "Las reglas avanzadas",
            CONTENT_LIMITS.advancedRulesBytes,
        );
        matchType = "advanced";
    } else {
        return inputError(`La respuesta ${index + 1} no tiene contenido válido.`);
    }

    return {
        label,
        accepted_answers: acceptedAnswers,
        match_type: matchType,
        order_index: index,
        advanced_rules: advancedRules,
        media: cleanMediaUrl(value.media),
    };
}

export function sanitizeCardInput(
    frontText: unknown,
    slots: unknown,
    frontMedia?: unknown,
): SanitizedCardInput {
    if (!Array.isArray(slots) || slots.length === 0 || slots.length > CONTENT_LIMITS.slotsPerCard) {
        return inputError(`Cada tarjeta debe tener entre 1 y ${CONTENT_LIMITS.slotsPerCard} respuestas.`);
    }
    return {
        frontText: cleanText(frontText, "La pregunta", CONTENT_LIMITS.frontText),
        frontMedia: cleanMediaUrl(frontMedia),
        slots: slots.map(sanitizeSlot),
    };
}

export function sanitizeDeckMetadata(
    title: unknown,
    description?: unknown,
): { title: string; description: string | null } {
    return {
        title: cleanText(title, "El título", CONTENT_LIMITS.title),
        description: cleanOptionalText(
            description,
            "La descripción",
            CONTENT_LIMITS.description,
        ),
    };
}

export function sanitizeDeckImport(jsonString: unknown): SanitizedDeckImport {
    if (typeof jsonString !== "string") inputError("La importación debe ser texto JSON.");
    if (new TextEncoder().encode(jsonString).byteLength > CONTENT_LIMITS.importBytes) {
        inputError("El archivo supera el límite de importación.");
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonString);
    } catch {
        return inputError("El archivo no contiene JSON válido.");
    }
    if (!isRecord(parsed) || !isRecord(parsed.deck) || !Array.isArray(parsed.cards)) {
        return inputError("El archivo no tiene la estructura de un mazo Macitta.");
    }
    if (parsed.cards.length === 0 || parsed.cards.length > CONTENT_LIMITS.cardsPerImport) {
        inputError(`Una importación admite entre 1 y ${CONTENT_LIMITS.cardsPerImport} tarjetas.`);
    }

    const deck = parsed.deck;
    const metadata = sanitizeDeckMetadata(deck.name ?? deck.title, deck.description);
    const questionLabels = cleanStringArray(
        deck.question_labels,
        "Las etiquetas de pregunta",
        CONTENT_LIMITS.slotsPerCard,
        CONTENT_LIMITS.label,
    );
    const answerLabels = cleanStringArray(
        deck.answer_labels,
        "Las etiquetas de respuesta",
        CONTENT_LIMITS.slotsPerCard,
        CONTENT_LIMITS.label,
    );
    const color = cleanOptionalText(deck.color, "El color", 32);

    return {
        deck: {
            ...metadata,
            color,
            questionLabels,
            answerLabels,
        },
        cards: parsed.cards.map((card, index) => {
            if (!isRecord(card)) inputError(`La tarjeta ${index + 1} no es válida.`);
            return sanitizeCardInput(
                card.front_text,
                card.answers,
                card.front_media,
            );
        }),
    };
}

export function assertUuid(value: unknown, label = "El identificador"): string {
    if (
        typeof value !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ) {
        return inputError(`${label} no es válido.`);
    }
    return value;
}
