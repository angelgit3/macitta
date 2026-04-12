export type ComplexAnswer =
    | string
    | string[]
    | { anyOf: string[] }
    | { allOf: string[]; ordered?: boolean }
    | { kOf: { of: string[]; atLeast: number } };

export function normalize(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function validateAnswer(userInput: string, target: ComplexAnswer): boolean {
    const input = normalize(userInput);

    // Case 1: Simple String
    if (typeof target === "string") {
        return input === normalize(target);
    }

    // Case 2: Array of strings (Implicit "Any Of" for simple arrays in some legacy formats, 
    // but usually strict arrays might mean "one of these" or "all of these". 
    // Based on the docs: "Respuesta Simple... Acepta cualquiera de las opciones" -> Implicit AnyOf)
    if (Array.isArray(target)) {
        return target.some(t => normalize(t) === input);
    }

    // Case 3: Object with rules
    if (typeof target === "object" && target !== null) {
        // 3a. anyOf
        if ("anyOf" in target && Array.isArray((target as any).anyOf)) {
            return (target as any).anyOf.some((t: string) => normalize(t) === input);
        }

        // 3b. allOf
        if ("allOf" in target && Array.isArray((target as any).allOf)) {
            const required = (target as any).allOf.map(normalize);
            // User input is a single string. For allOf, we generally expect the user to provide
            // multiple answers? Or does the user provide a comma-separated list?
            // The docs say: Example: "rojo, azul, amarillo" is correct.
            // So we split user input by comma/separators.
            const userParts = input.split(/[,;]/).map(p => p.trim()).filter(Boolean);

            // Check if every required item is present in userParts
            return required.every((req: string) => userParts.includes(req));
        }

        // 3c. kOf — at least N out of K options must be present
        if ("kOf" in target) {
            const kOfTarget = target as { kOf: { of: string[]; atLeast: number } };
            const { of: options, atLeast } = kOfTarget.kOf;
            const normalizedOptions = options.map(normalize);
            const userParts = input.split(/[,;]/).map(p => p.trim()).filter(Boolean).map(normalize);
            const matchedCount = normalizedOptions.filter(opt => userParts.includes(opt)).length;
            return matchedCount >= atLeast;
        }
    }

    return false;
}
