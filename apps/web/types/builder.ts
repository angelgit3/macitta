export type BuilderAdvancedRules = {
  anyOf?: string[];
  allOf?: string[];
  kOf?: { k: number; items: string[] };
  forbid?: string[];
};

export type BuilderAnswerSlot = {
  field: string;
  text: string | string[] | BuilderAdvancedRules;
  media?: string;
};

export type BuilderCard = {
  id: string; // Internal UI ID, not stored in DB
  front_text: string;
  front_media?: string;
  answers: BuilderAnswerSlot[];
};

export type BuilderDeckMetadata = {
  name: string;
  description: string;
  color: string;
  question_labels: string[];
  answer_labels: string[];
};

export type DeckBuilderState = {
  activeStep: "METADATA" | "WORKSPACE";
  activeCardIndex: number;
  metadata: BuilderDeckMetadata;
  cards: BuilderCard[];
};

export type DeckBuilderAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_METADATA"; payload: Partial<BuilderDeckMetadata> }
  | { type: "ADD_CARD" }
  | { type: "UPDATE_CARD"; payload: { index: number; card: Partial<BuilderCard> } }
  | { type: "DELETE_CARD"; payload: { index: number } }
  | { type: "SET_ACTIVE_CARD"; payload: { index: number } }
  | { type: "UPDATE_ANSWER_SLOT"; payload: { cardIndex: number; slotIndex: number; slot: Partial<BuilderAnswerSlot> } };
