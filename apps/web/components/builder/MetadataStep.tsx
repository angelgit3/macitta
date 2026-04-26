"use client";

import { useDeckBuilder } from "../../contexts/DeckBuilderContext";
import { parseLabels, formatLabels } from "./metadataUtils";
import { useState, FormEvent } from "react";
import { Save } from "lucide-react";

export function MetadataStep() {
  const { state, dispatch } = useDeckBuilder();
  const { metadata } = state;

  const [title, setTitle] = useState(metadata.name);
  const [description, setDescription] = useState(metadata.description);
  const [color, setColor] = useState(metadata.color || "#ffffff");
  const [questionLabelsStr, setQuestionLabelsStr] = useState(formatLabels(metadata.question_labels));
  const [answerLabelsStr, setAnswerLabelsStr] = useState(formatLabels(metadata.answer_labels));

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    dispatch({
      type: "SET_METADATA",
      payload: {
        name: title,
        description,
        color,
        question_labels: parseLabels(questionLabelsStr),
        answer_labels: parseLabels(answerLabelsStr),
      },
    });
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <form onSubmit={handleNext} className="max-w-xl mx-auto space-y-6 mt-8 bg-stone-surface p-8 rounded-3xl border border-border-subtle shadow-lg">
      <div className="flex items-center gap-3 border-b border-border-subtle pb-4 mb-6">
        <div className="p-2 bg-void rounded-xl border border-border-subtle">
          <Save size={24} className="text-accent-focus" />
        </div>
        <h2 className="text-2xl font-bold text-white">Deck Metadata</h2>
      </div>
      
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1 mb-2">Title</label>
        <input 
          type="text" 
          required 
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-void/50 border border-border-subtle text-white focus:border-accent-focus focus:outline-none focus:ring-1 focus:ring-accent-focus rounded-2xl transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1 mb-2">Description</label>
        <textarea 
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-4 py-3 bg-void/50 border border-border-subtle h-28 text-white focus:border-accent-focus focus:outline-none focus:ring-1 focus:ring-accent-focus rounded-2xl transition-all resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1 mb-2">Color</label>
        <div className="flex items-center gap-3">
          <input 
            type="color" 
            value={color}
            onChange={e => setColor(e.target.value)}
            className="p-1 h-12 w-20 cursor-pointer rounded-xl border border-border-subtle bg-void/50"
          />
          <span className="text-sm font-mono text-text-dim uppercase">{color}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1 mb-2">Question Labels (Comma-separated)</label>
        <input 
          type="text" 
          placeholder="e.g. Image, Front Text"
          value={questionLabelsStr}
          onChange={e => setQuestionLabelsStr(e.target.value)}
          className="w-full px-4 py-3 bg-void/50 border border-border-subtle text-white focus:border-accent-focus focus:outline-none focus:ring-1 focus:ring-accent-focus rounded-2xl transition-all"
        />
        <p className="text-xs text-text-dim ml-1 mt-1">
          Fields available on the front of the flashcard (usually just "Front").
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1 mb-2">Answer Labels (Comma-separated)</label>
        <input 
          type="text" 
          placeholder="e.g. English, Spanish, Romaji"
          value={answerLabelsStr}
          onChange={e => setAnswerLabelsStr(e.target.value)}
          className="w-full px-4 py-3 bg-void/50 border border-border-subtle text-white focus:border-accent-focus focus:outline-none focus:ring-1 focus:ring-accent-focus rounded-2xl transition-all"
        />
        <p className="text-xs text-text-dim ml-1 mt-1">
          Fields to fill for each flashcard. Example: Front "House", Answers "Spanish" (Casa), "Romaji" (Ie).
        </p>
      </div>

      <button 
        type="submit" 
        className="w-full mt-8 bg-accent-focus text-white rounded-2xl py-3.5 font-bold hover:bg-accent-focus/90 transition-colors flex items-center justify-center gap-2"
      >
        <Save size={20} />
        Continue to Workspace
      </button>
    </form>
  );
}
