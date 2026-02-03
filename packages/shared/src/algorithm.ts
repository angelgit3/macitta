import { FSRS, Card, Rating, createEmptyCard, ReviewLog } from "ts-fsrs";
import levenshtein from "fast-levenshtein";
import { normalize, validateAnswer, ComplexAnswer } from "./validator";

export const fsrs = new FSRS({});

export { createEmptyCard };
export type { Card, ReviewLog };

export enum Grade {
    Again = Rating.Again,
    Hard = Rating.Hard,
    Good = Rating.Good,
    Easy = Rating.Easy,
}

export interface ReviewResult {
    rating: Grade;
    nextCard: Card;
    reviewLog: ReviewLog;
    isTypo: boolean;
}

export function minLevenshtein(input: string, target: ComplexAnswer): number {
    const normInput = normalize(input);
    let min = Infinity;

    const check = (str: string) => {
        const dist = levenshtein.get(normInput, normalize(str));
        if (dist < min) min = dist;
    };

    if (typeof target === "string") check(target);
    else if (Array.isArray(target)) target.forEach(check);
    else if (typeof target === "object" && target !== null) {
        if ("anyOf" in target && Array.isArray((target as any).anyOf)) {
            (target as any).anyOf.forEach(check);
        }
        // allOf fuzzy match is skipped for now, assumes Infinity unless strict pass
    }

    return min;
}

export function evaluateAnswer(
    card: Card,
    userInput: string,
    target: ComplexAnswer,
    timeMs: number
): ReviewResult {
    const now = new Date();

    // 1. Strict Validation
    let isCorrect = validateAnswer(userInput, target);
    let isTypo = false;

    // 2. Fuzzy Validation (Typo Tolerance)
    if (!isCorrect) {
        const dist = minLevenshtein(userInput, target);
        if (dist <= 1) {
            isCorrect = true;
            isTypo = true;
        }
    }

    // 3. Determine Rating
    let grade: Grade;

    if (!isCorrect) {
        grade = Grade.Again;
    } else {
        if (timeMs < 4000) {
            grade = Grade.Easy;
        } else if (timeMs < 8000) {
            grade = Grade.Good;
        } else {
            grade = Grade.Hard;
        }
    }

    // 4. Calculate FSRS Schedule
    const schedulingCards = fsrs.repeat(card, now);

    // Select the card corresponding to the calculated grade
    // ts-fsrs returns a Record<Grade, ...> 
    // We map our Grade enum to the result
    const result = schedulingCards[grade];

    return {
        rating: grade,
        nextCard: result.card,
        reviewLog: result.log,
        isTypo
    };
}
