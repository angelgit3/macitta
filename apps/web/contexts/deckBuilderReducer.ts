import { DeckBuilderState, DeckBuilderAction, BuilderCard } from "../types/builder";

export const initialState: DeckBuilderState = {
  activeStep: "METADATA",
  activeCardIndex: 0,
  metadata: {
    name: "",
    description: "",
    color: "#ffffff",
    question_labels: [],
    answer_labels: [],
  },
  cards: [],
};

// Simple ID generator for UI purposes
let nextId = 1;
function generateId() {
  return String(nextId++);
}

export function deckBuilderReducer(
  state: DeckBuilderState,
  action: DeckBuilderAction
): DeckBuilderState {
  switch (action.type) {
    case "NEXT_STEP":
      return { ...state, activeStep: "WORKSPACE" };
    case "PREV_STEP":
      return { ...state, activeStep: "METADATA" };
    case "SET_METADATA":
      return {
        ...state,
        metadata: { ...state.metadata, ...action.payload },
      };
    case "ADD_CARD": {
      const newCard: BuilderCard = {
        id: generateId(),
        front_text: "",
        answers: state.metadata.answer_labels.map((label) => ({
          field: label,
          text: "",
        })),
      };
      return {
        ...state,
        cards: [...state.cards, newCard],
        activeCardIndex: state.cards.length,
      };
    }
    case "UPDATE_CARD": {
      const { index, card } = action.payload;
      const newCards = [...state.cards];
      newCards[index] = { ...newCards[index], ...card };
      return { ...state, cards: newCards };
    }
    case "DELETE_CARD": {
      const { index } = action.payload;
      const newCards = state.cards.filter((_, i) => i !== index);
      let newIndex = state.activeCardIndex;
      if (index < state.activeCardIndex) {
        newIndex--;
      } else if (index === state.activeCardIndex && index === newCards.length) {
        newIndex = Math.max(0, newCards.length - 1);
      }
      return {
        ...state,
        cards: newCards,
        activeCardIndex: newIndex,
      };
    }
    case "SET_ACTIVE_CARD":
      return { ...state, activeCardIndex: action.payload.index };
    case "UPDATE_ANSWER_SLOT": {
      const { cardIndex, slotIndex, slot } = action.payload;
      const newCards = [...state.cards];
      const card = newCards[cardIndex];
      const newAnswers = [...card.answers];
      newAnswers[slotIndex] = { ...newAnswers[slotIndex], ...slot };
      newCards[cardIndex] = { ...card, answers: newAnswers };
      return { ...state, cards: newCards };
    }
    default:
      return state;
  }
}
