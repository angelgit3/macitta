import { DeckBuilderState, BuilderAnswerSlot, BuilderAdvancedRules } from "../types/builder";

export function exportDeckJson(state: DeckBuilderState): string {
  const { metadata, cards } = state;
  const exportedDeck = {
    deck: {
      name: metadata.name,
      description: metadata.description,
      color: metadata.color,
      question_labels: metadata.question_labels,
      answer_labels: metadata.answer_labels,
    },
    cards: cards.map((card) => ({
      front_text: card.front_text,
      front_media: card.front_media,
      answers: card.answers.map((answer) => ({
        field: answer.field,
        text: answer.text,
        media: answer.media,
      })),
    })),
  };

  return JSON.stringify(exportedDeck);
}

export type RuleType = "exact" | "anyOf" | "allOf" | "kOf";

export function buildAnswerSlot(
  field: string,
  ruleType: RuleType,
  items: string[],
  forbidItems: string[],
  kValue?: number,
  media?: string
): BuilderAnswerSlot {
  const hasForbid = forbidItems.length > 0;
  
  let textPayload: BuilderAnswerSlot["text"];
  
  if (ruleType === "exact") {
    if (hasForbid) {
      textPayload = { anyOf: items, forbid: forbidItems };
    } else {
      textPayload = items[0] || "";
    }
  } else if (ruleType === "anyOf") {
    if (hasForbid) {
      textPayload = { anyOf: items, forbid: forbidItems };
    } else {
      textPayload = items;
    }
  } else if (ruleType === "allOf") {
    textPayload = { allOf: items };
    if (hasForbid) {
      textPayload.forbid = forbidItems;
    }
  } else if (ruleType === "kOf") {
    textPayload = { kOf: { k: kValue || 1, items } };
    if (hasForbid) {
      textPayload.forbid = forbidItems;
    }
  } else {
    textPayload = items[0] || "";
  }

  const slot: BuilderAnswerSlot = { field, text: textPayload };
  if (media) {
    slot.media = media;
  }
  return slot;
}
