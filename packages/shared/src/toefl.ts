import type { TOEFLQuestion } from './types';

export type TOEFLAnswerMap = Record<string, string | null | undefined>;

export interface TOEFLScoreResult {
    rawScore: number;
    maxRawScore: number;
    scaledScore: number;
    correctCount: number;
    totalCount: number;
}

export function calculateTOEFLScore(
    questions: TOEFLQuestion[],
    answers: TOEFLAnswerMap,
    scaleMapping: Record<string, number>
): TOEFLScoreResult {
    const rawScore = questions.reduce((total, question) => {
        return answers[question.id] === question.correct_option_id
            ? total + question.points_weight
            : total;
    }, 0);

    const maxRawScore = questions.reduce((total, question) => total + question.points_weight, 0);
    const correctCount = questions.filter(question => answers[question.id] === question.correct_option_id).length;
    const scaledScore = scaleMapping[String(rawScore)] ?? Math.round((rawScore / Math.max(maxRawScore, 1)) * 30);

    return {
        rawScore,
        maxRawScore,
        scaledScore: Math.max(0, Math.min(30, scaledScore)),
        correctCount,
        totalCount: questions.length,
    };
}
