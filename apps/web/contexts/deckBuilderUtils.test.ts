import { describe, it, expect } from "vitest";
import { exportDeckJson, buildAnswerSlot } from "./deckBuilderUtils";
import { DeckBuilderState, BuilderAnswerSlot } from "../types/builder";

describe("exportDeckJson", () => {
  it("should transform DeckBuilderState to a valid JSON string for import", () => {
    const mockState: DeckBuilderState = {
      activeStep: "WORKSPACE",
      activeCardIndex: 0,
      metadata: {
        name: "Test Deck",
        description: "Test Description",
        color: "#ff0000",
        question_labels: ["Question"],
        answer_labels: ["Answer"],
      },
      cards: [
        {
          id: "1",
          front_text: "Card 1",
          front_media: "media.png",
          answers: [
            {
              field: "Answer",
              text: "Exact match",
            },
          ],
        },
      ],
    };

    const result = exportDeckJson(mockState);
    const parsed = JSON.parse(result);

    // Verify deck structure
    expect(parsed.deck).toEqual({
      name: "Test Deck",
      description: "Test Description",
      color: "#ff0000",
      question_labels: ["Question"],
      answer_labels: ["Answer"],
    });

    // Verify cards structure (no internal IDs)
    expect(parsed.cards).toHaveLength(1);
    expect(parsed.cards[0]).toEqual({
      front_text: "Card 1",
      front_media: "media.png",
      answers: [
        {
          field: "Answer",
          text: "Exact match",
        },
      ],
    });
    
    // Internal state properties should not leak
    expect(parsed.activeStep).toBeUndefined();
    expect(parsed.cards[0].id).toBeUndefined();
  });
});

describe("buildAnswerSlot", () => {
  it("should build exact match slot", () => {
    const result = buildAnswerSlot("English", "exact", ["apple"], [], undefined, undefined);
    expect(result).toEqual({
      field: "English",
      text: "apple"
    });
  });

  it("should build exact match with forbid rules", () => {
    const result = buildAnswerSlot("English", "exact", ["apple"], ["pear"], undefined, undefined);
    expect(result).toEqual({
      field: "English",
      text: { anyOf: ["apple"], forbid: ["pear"] } // If there are advanced rules, text becomes the object
    });
  });

  it("should build anyOf match slot", () => {
    const result = buildAnswerSlot("English", "anyOf", ["apple", "pear"], [], undefined, undefined);
    expect(result).toEqual({
      field: "English",
      text: ["apple", "pear"]
    });
  });

  it("should build allOf match slot", () => {
    const result = buildAnswerSlot("English", "allOf", ["apple", "pear"], [], undefined, undefined);
    expect(result).toEqual({
      field: "English",
      text: { allOf: ["apple", "pear"] }
    });
  });

  it("should build kOf match slot with k value", () => {
    const result = buildAnswerSlot("English", "kOf", ["apple", "pear", "banana"], [], 2, undefined);
    expect(result).toEqual({
      field: "English",
      text: { kOf: { k: 2, items: ["apple", "pear", "banana"] } }
    });
  });

  it("should mix match rules with forbid rules properly", () => {
    const result = buildAnswerSlot("English", "anyOf", ["apple", "pear"], ["banana", "orange"], undefined, undefined);
    expect(result).toEqual({
      field: "English",
      text: { anyOf: ["apple", "pear"], forbid: ["banana", "orange"] }
    });
  });
});
