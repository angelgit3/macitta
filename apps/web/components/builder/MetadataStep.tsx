"use client";

import { useDeckBuilder } from "../../contexts/DeckBuilderContext";
import { parseLabels, formatLabels } from "./metadataUtils";
import { useState, FormEvent } from "react";
import { Save } from "lucide-react";
import { ZenInput } from "@/components/ui/ZenInput";
import { ZenButton } from "@/components/ui/ZenButton";

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
        <h2 className="text-2xl font-bold text-white">Configuración del Mazo</h2>
      </div>
      
      <ZenInput
        label="Nombre del Mazo"
        required
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1 mb-2">Descripción (Opcional)</label>
        <textarea 
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-4 py-3 bg-void/50 border border-border-subtle h-28 text-white focus:border-accent-focus focus:outline-none focus:ring-1 focus:ring-accent-focus rounded-xl transition-all resize-none shadow-inner"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1 mb-2">Color del Mazo</label>
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

      <ZenInput
        label="Etiquetas del Frente (Pregunta)"
        placeholder="Palabra en Inglés, Imagen..."
        value={questionLabelsStr}
        onChange={e => setQuestionLabelsStr(e.target.value)}
        helperText='¿Qué información va en el frente de la tarjeta? (Ej. "Palabra en Inglés", "Imagen"). Sepáralas por comas.'
      />

      <ZenInput
        label="Campos a Evaluar (Respuestas)"
        placeholder="Traducción, Sinónimos, Pasado..."
        value={answerLabelsStr}
        onChange={e => setAnswerLabelsStr(e.target.value)}
        helperText='¿Qué campos se deberán responder? El sistema creará una caja de texto por cada campo que escribas aquí. (Ej. "Significado", "Sinónimos", "Pasado Simple"). Sepáralos por comas.'
      />

      <ZenButton type="submit" fullWidth className="mt-8 gap-2">
        <Save size={20} />
        Continuar al Creador de Cartas
      </ZenButton>
    </form>
  );
}
