import { describe, it, expect } from 'vitest';
import type { Deck, ClassroomDeck } from './types';

describe('Database Types', () => {
    it('Deck should support author_id (global or specific user)', () => {
        const globalDeck: Deck = {
            id: 'global-1',
            author_id: null,
            title: 'Verbos Irregulares',
            description: null,
            created_at: new Date().toISOString(),
        };

        const privateDeck: Deck = {
            id: 'private-1',
            author_id: 'user-123',
            title: 'My Custom Deck',
            description: 'Custom vocabulary',
            created_at: new Date().toISOString(),
        };

        expect(globalDeck.author_id).toBeNull();
        expect(privateDeck.author_id).toBe('user-123');
    });

    it('ClassroomDeck should map a classroom to a deck', () => {
        const assignment: ClassroomDeck = {
            classroom_id: 'class-1',
            deck_id: 'deck-1',
            assigned_at: new Date().toISOString(),
        };

        expect(assignment.classroom_id).toBe('class-1');
        expect(assignment.deck_id).toBe('deck-1');
    });
});
