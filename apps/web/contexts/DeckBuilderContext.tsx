"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { DeckBuilderState, DeckBuilderAction } from "../types/builder";
import { deckBuilderReducer, initialState } from "./deckBuilderReducer";

type DeckBuilderContextValue = {
  state: DeckBuilderState;
  dispatch: React.Dispatch<DeckBuilderAction>;
};

const DeckBuilderContext = createContext<DeckBuilderContextValue | undefined>(undefined);

export function DeckBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(deckBuilderReducer, initialState);

  return (
    <DeckBuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </DeckBuilderContext.Provider>
  );
}

export function useDeckBuilder() {
  const context = useContext(DeckBuilderContext);
  if (context === undefined) {
    throw new Error("useDeckBuilder must be used within a DeckBuilderProvider");
  }
  return context;
}

/**
 * useDeckBuilderOptional — returns context or `null` when used outside a
 * DeckBuilderProvider (e.g., AnswerSlotEditor rendered standalone).
 */
export function useDeckBuilderOptional(): DeckBuilderContextValue | null {
  return useContext(DeckBuilderContext) ?? null;
}
