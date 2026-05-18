/**
 * Global Application Constants
 * Use this file to manage system-wide limits, timeouts, and fallback values.
 * This makes tuning the application for production or different environments much easier.
 */

export const APP_CONFIG = {
    STUDY_SESSION: {
        /** Number of cards to load per study batch */
        BATCH_SIZE: 10,
        /** Fallback timeout when trying to initialize a session before giving up */
        LOAD_TIMEOUT_MS: 8000,
        /** Default target weakness score for newly introduced cards in Rush Mode */
        NEW_CARD_WEAKNESS_SCORE: 5,
        /** How many cards to shuffle when building the Rush Mode pool */
        RUSH_POOL_SIZE: 30,
    },
    EVALUATION: {
        /** If a string distance/comparison is used, what is the tolerance? (0 = exact only) */
        TOLERANCE_THRESHOLD: 0,
    },
    UI: {
        /** Fallback string when a deck has no explicit answer labels configured */
        DEFAULT_ANSWER_LABEL: "Respuesta",
    }
} as const;
