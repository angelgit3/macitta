import type {
    ReadingCEFRBand,
    ReadingGenre,
    ReadingLengthBand,
    ReadingOptionId,
} from "./reading";

export type ReadingSkillCode =
    | "READ_MAIN_IDEA"
    | "READ_PRIMARY_PURPOSE"
    | "READ_ORGANIZATION"
    | "READ_DETAIL"
    | "READ_NEGATIVE_DETAIL"
    | "READ_INFERENCE"
    | "READ_RHETORICAL_PURPOSE"
    | "READ_TONE"
    | "READ_VOCAB_CONTEXT"
    | "READ_REFERENCE"
    | "READ_PARAPHRASE";

export interface ReadingQuestionSeed {
    skill: ReadingSkillCode;
    prompt: string;
    correct: string;
    distractors: readonly [string, string, string];
    explanationEs: string;
    evidenceParagraph: number;
    evidenceQuote: string;
    distractorReasonsEs: readonly [string, string, string];
    difficulty?: 1 | 2 | 3;
}

export interface ReadingPassageSeed {
    slug: string;
    title: string;
    topicEs: string;
    genre: ReadingGenre;
    cefr: ReadingCEFRBand;
    difficulty: 1 | 2 | 3;
    length: ReadingLengthBand;
    estimatedMinutes: number;
    paragraphs: readonly string[];
    questions: readonly ReadingQuestionSeed[];
}

export function q(
    skill: ReadingSkillCode,
    prompt: string,
    correct: string,
    distractors: readonly [string, string, string],
    explanationEs: string,
    evidenceParagraph: number,
    evidenceQuote: string,
    distractorReasonsEs: readonly [string, string, string],
    difficulty?: 1 | 2 | 3,
): ReadingQuestionSeed {
    return {
        skill,
        prompt,
        correct,
        distractors,
        explanationEs,
        evidenceParagraph,
        evidenceQuote,
        distractorReasonsEs,
        difficulty,
    };
}

export const OPTION_IDS: readonly ReadingOptionId[] = ["A", "B", "C", "D"];
