import { describe, it, expect } from 'vitest';
import type { Deck, CardRow, CardSlot } from './types';

describe('Database Types', () => {
    it('Deck should support author_id (global or specific user)', () => {
        const globalDeck: Deck = {
            id: 'global-1',
            author_id: null,
            title: 'Verbos Irregulares',
            description: null,
            color: null,
            question_labels: [],
            answer_labels: [],
            created_at: new Date().toISOString(),
        };

        const privateDeck: Deck = {
            id: 'private-1',
            author_id: 'user-123',
            title: 'My Custom Deck',
            description: 'Custom vocabulary',
            color: '#FF0000',
            question_labels: ['English'],
            answer_labels: ['Spanish'],
            created_at: new Date().toISOString(),
        };

        expect(globalDeck.author_id).toBeNull();
        expect(privateDeck.author_id).toBe('user-123');
        expect(privateDeck.color).toBe('#FF0000');
    });

    it('CardRow should support front_text and front_media', () => {
        const card: CardRow = {
            id: 'card-1',
            deck_id: 'deck-1',
            front_text: 'Hello',
            front_media: { image: 'hello.png' },
            created_at: new Date().toISOString(),
        };
        expect(card.front_text).toBe('Hello');
        expect(card.front_media?.image).toBe('hello.png');
    });

    it('CardSlot should support advanced_rules and media', () => {
        const slot: CardSlot = {
            id: 'slot-1',
            card_id: 'card-1',
            label: 'Spanish',
            accepted_answers: ['Hola'],
            match_type: 'any',
            order_index: 0,
            advanced_rules: { anyOf: ['Hola', 'Qué tal'] },
            media: { audio: 'hola.mp3' },
        };
        expect((slot.advanced_rules as { anyOf: string[] }).anyOf).toContain('Hola');
        expect(slot.media?.audio).toBe('hola.mp3');
    });
});
