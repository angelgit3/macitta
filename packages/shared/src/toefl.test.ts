import { describe, expect, it } from 'vitest';
import { calculateTOEFLScore } from './toefl';
import type { TOEFLQuestion } from './types';

const questions: TOEFLQuestion[] = [
    {
        id: 'q1',
        exam_id: 'exam-1',
        question_text: 'Question 1',
        options: [{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }],
        correct_option_id: 'A',
        order_index: 1,
        points_weight: 1,
        explanation: 'Explanation',
        created_at: new Date().toISOString(),
    },
    {
        id: 'q2',
        exam_id: 'exam-1',
        question_text: 'Question 2',
        options: [{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }],
        correct_option_id: 'B',
        order_index: 2,
        points_weight: 2,
        explanation: 'Explanation',
        created_at: new Date().toISOString(),
    },
];

describe('calculateTOEFLScore', () => {
    it('uses points_weight and scale mapping', () => {
        const result = calculateTOEFLScore(
            questions,
            { q1: 'A', q2: 'A' },
            { 0: 0, 1: 12, 2: 20, 3: 30 }
        );

        expect(result.rawScore).toBe(1);
        expect(result.maxRawScore).toBe(3);
        expect(result.scaledScore).toBe(12);
        expect(result.correctCount).toBe(1);
    });

    it('falls back to a proportional 0-30 score when mapping is missing', () => {
        const result = calculateTOEFLScore(questions, { q1: 'A', q2: 'B' }, {});

        expect(result.rawScore).toBe(3);
        expect(result.scaledScore).toBe(30);
    });
});
