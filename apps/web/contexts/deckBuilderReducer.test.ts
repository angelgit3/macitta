import { describe, it, expect } from "vitest";
import { deckBuilderReducer, initialState } from "./deckBuilderReducer";
import { DeckBuilderState } from "../types/builder";

describe("deckBuilderReducer", () => {
  it("NEXT_STEP transitions from METADATA to WORKSPACE", () => {
    const state: DeckBuilderState = { ...initialState, activeStep: "METADATA" };
    const nextState = deckBuilderReducer(state, { type: "NEXT_STEP" });
    expect(nextState.activeStep).toBe("WORKSPACE");
  });

  it("PREV_STEP transitions from WORKSPACE to METADATA", () => {
    const state: DeckBuilderState = { ...initialState, activeStep: "WORKSPACE" };
    const nextState = deckBuilderReducer(state, { type: "PREV_STEP" });
    expect(nextState.activeStep).toBe("METADATA");
  });

  it("SET_METADATA merges metadata fields", () => {
    const nextState = deckBuilderReducer(initialState, {
      type: "SET_METADATA",
      payload: { name: "New Title", answer_labels: ["EN"] },
    });
    expect(nextState.metadata.name).toBe("New Title");
    expect(nextState.metadata.answer_labels).toEqual(["EN"]);
    expect(nextState.metadata.color).toBe("#ffffff"); // unchanged
  });

  it("ADD_CARD appends a new empty card initialized with current answer labels", () => {
    const state: DeckBuilderState = {
      ...initialState,
      metadata: { ...initialState.metadata, answer_labels: ["EN", "ES"] },
    };
    const nextState = deckBuilderReducer(state, { type: "ADD_CARD" });
    expect(nextState.cards.length).toBe(1);
    expect(nextState.cards[0].front_text).toBe("");
    expect(nextState.cards[0].answers).toEqual([
      { field: "EN", text: "" },
      { field: "ES", text: "" },
    ]);
    expect(nextState.activeCardIndex).toBe(0);
  });

  it("UPDATE_CARD merges fields of an existing card", () => {
    const state: DeckBuilderState = {
      ...initialState,
      cards: [{ id: "1", front_text: "old", answers: [] }],
    };
    const nextState = deckBuilderReducer(state, {
      type: "UPDATE_CARD",
      payload: { index: 0, card: { front_text: "new" } },
    });
    expect(nextState.cards[0].front_text).toBe("new");
  });

  it("DELETE_CARD removes card and updates activeIndex if deleted card is before it", () => {
    const state: DeckBuilderState = {
      ...initialState,
      activeCardIndex: 1,
      cards: [
        { id: "1", front_text: "1", answers: [] },
        { id: "2", front_text: "2", answers: [] },
        { id: "3", front_text: "3", answers: [] },
      ],
    };
    const nextState = deckBuilderReducer(state, {
      type: "DELETE_CARD",
      payload: { index: 0 }, // Delete first card
    });
    expect(nextState.cards.length).toBe(2);
    expect(nextState.cards[0].id).toBe("2");
    expect(nextState.activeCardIndex).toBe(0); // Shifted down
  });

  it("SET_ACTIVE_CARD changes the active index", () => {
    const nextState = deckBuilderReducer(initialState, {
      type: "SET_ACTIVE_CARD",
      payload: { index: 5 },
    });
    expect(nextState.activeCardIndex).toBe(5);
  });

  it("UPDATE_ANSWER_SLOT modifies a specific slot in a specific card", () => {
    const state: DeckBuilderState = {
      ...initialState,
      cards: [
        {
          id: "1",
          front_text: "q",
          answers: [
            { field: "A", text: "old" },
            { field: "B", text: "old_b" },
          ],
        },
      ],
    };
    const nextState = deckBuilderReducer(state, {
      type: "UPDATE_ANSWER_SLOT",
      payload: {
        cardIndex: 0,
        slotIndex: 0,
        slot: { text: "new" },
      },
    });
    expect(nextState.cards[0].answers[0].text).toBe("new");
    expect(nextState.cards[0].answers[1].text).toBe("old_b"); // unchanged
  });
});
