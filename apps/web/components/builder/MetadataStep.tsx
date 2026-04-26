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
    <form onSubmit={handleNext} className="max-w-xl mx-auto space-y-6 mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold">Deck Metadata</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Title</label>
        <input 
          type="text" 
          required 
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full p-2 border rounded text-black bg-white"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Description</label>
        <textarea 
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full p-2 border rounded h-24 text-black bg-white"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Color</label>
        <input 
          type="color" 
          value={color}
          onChange={e => setColor(e.target.value)}
          className="p-1 h-10 w-20 cursor-pointer rounded border"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Question Labels (Comma-separated)</label>
        <input 
          type="text" 
          placeholder="e.g. Image, Front Text"
          value={questionLabelsStr}
          onChange={e => setQuestionLabelsStr(e.target.value)}
          className="w-full p-2 border rounded text-black bg-white"
        />
        <p className="text-xs text-gray-500">
          Fields available on the front of the flashcard (usually just "Front").
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Answer Labels (Comma-separated)</label>
        <input 
          type="text" 
          placeholder="e.g. English, Spanish, Romaji"
          value={answerLabelsStr}
          onChange={e => setAnswerLabelsStr(e.target.value)}
          className="w-full p-2 border rounded text-black bg-white"
        />
        <p className="text-xs text-gray-500">
          These represent the fields to fill for each flashcard. Example: Front card says "House", Answer fields are "Spanish" (Casa) and "Romaji" (Ie).
        </p>
      </div>

      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white p-3 rounded font-medium flex items-center justify-center gap-2 hover:bg-blue-700"
      >
        <Save size={20} />
        Continue to Workspace
      </button>
    </form>
  );
}
