"use client";

import { useState } from "react";
import { useDeckBuilder } from "../../contexts/DeckBuilderContext";
import { BuilderAnswerSlot, BuilderAdvancedRules } from "../../types/builder";
import { buildAnswerSlot, RuleType } from "../../contexts/deckBuilderUtils";
import { X, Plus, AlertCircle } from "lucide-react";

type Props = {
  cardIndex: number;
  slotIndex: number;
  label: string;
  slot?: BuilderAnswerSlot;
};

export function AnswerSlotEditor({ cardIndex, slotIndex, label, slot }: Props) {
  const { dispatch } = useDeckBuilder();

  const getInitialRuleType = (): RuleType => {
    if (!slot) return "exact";
    if (typeof slot.text === "string") return "exact";
    if (Array.isArray(slot.text)) return "anyOf";
    if (typeof slot.text === "object") {
      const advanced = slot.text as BuilderAdvancedRules;
      if (advanced.allOf) return "allOf";
      if (advanced.anyOf) return "anyOf";
      if (advanced.kOf) return "kOf";
    }
    return "exact";
  };

  const getInitialItems = (): string[] => {
    if (!slot) return [""];
    if (typeof slot.text === "string") return [slot.text];
    if (Array.isArray(slot.text)) return slot.text;
    if (typeof slot.text === "object") {
      const advanced = slot.text as BuilderAdvancedRules;
      if (advanced.allOf) return advanced.allOf;
      if (advanced.anyOf) return advanced.anyOf;
      if (advanced.kOf) return advanced.kOf.items;
    }
    return [""];
  };

  const getInitialForbidItems = (): string[] => {
    if (!slot) return [];
    if (typeof slot.text === "object" && !Array.isArray(slot.text)) {
      return (slot.text as BuilderAdvancedRules).forbid || [];
    }
    return [];
  };

  const getInitialK = (): number => {
    if (!slot) return 1;
    if (typeof slot.text === "object" && !Array.isArray(slot.text)) {
      const advanced = slot.text as BuilderAdvancedRules;
      if (advanced.kOf) return advanced.kOf.k;
    }
    return 1;
  };

  const [ruleType, setRuleType] = useState<RuleType>(getInitialRuleType());
  const [items, setItems] = useState<string[]>(getInitialItems());
  const [forbidItems, setForbidItems] = useState<string[]>(getInitialForbidItems());
  const [kValue, setKValue] = useState<number>(getInitialK());
  const [media, setMedia] = useState<string>(slot?.media || "");

  const handleChange = (
    newRuleType: RuleType,
    newItems: string[],
    newForbidItems: string[],
    newK: number,
    newMedia: string
  ) => {
    const updatedSlot = buildAnswerSlot(
      label,
      newRuleType,
      newItems.filter(i => i.trim()),
      newForbidItems.filter(i => i.trim()),
      newK,
      newMedia
    );
    dispatch({
      type: "UPDATE_ANSWER_SLOT",
      payload: { cardIndex, slotIndex, slot: updatedSlot }
    });
  };

  const handleItemsChange = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    setItems(next);
    handleChange(ruleType, next, forbidItems, kValue, media);
  };

  const handleForbidItemsChange = (index: number, value: string) => {
    const next = [...forbidItems];
    next[index] = value;
    setForbidItems(next);
    handleChange(ruleType, items, next, kValue, media);
  };

  return (
    <div className="bg-stone-surface/30 backdrop-blur-sm rounded-3xl border border-border-subtle p-8 space-y-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-text-dim/30">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
      
      <div className="flex flex-col gap-4 pb-5 border-b border-border-subtle/50">
        <div className="bg-void/80 self-start px-4 py-2 rounded-xl border border-border-subtle shadow-inner text-sm font-black text-white tracking-widest uppercase">
          {label}
        </div>
        <div className="flex flex-col gap-2 w-full bg-void/40 p-4 rounded-2xl border border-border-subtle/50">
          <label className="text-[11px] uppercase font-bold text-accent-focus flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
            Modo de Evaluación
          </label>
          <div className="relative">
            <select
              value={ruleType}
              onChange={(e) => {
                const rt = e.target.value as RuleType;
                setRuleType(rt);
                handleChange(rt, items, forbidItems, kValue, media);
              }}
              className="w-full border border-border-subtle rounded-xl pl-4 pr-10 py-3.5 text-sm bg-stone-surface text-white focus:outline-none focus:border-accent-focus focus:ring-1 focus:ring-accent-focus transition-all appearance-none cursor-pointer font-bold shadow-lg truncate"
            >
              <option value="exact" className="bg-stone-surface text-white font-medium">Exacta (Escribir tal cual)</option>
              <option value="anyOf" className="bg-stone-surface text-white font-medium">Sinónimos (Acepta cualquiera)</option>
              <option value="allOf" className="bg-stone-surface text-white font-medium">Lista Múltiple (Todas requeridas)</option>
              <option value="kOf" className="bg-stone-surface text-white font-medium">Parcial (Al menos N correctas)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
            </div>
          </div>
          <p className="text-xs text-text-dim/90 mt-1 leading-relaxed">
            {ruleType === 'exact' && 'El alumno debe escribir la respuesta exactamente como está abajo.'}
            {ruleType === 'anyOf' && 'Útil para palabras con múltiples traducciones válidas o sinónimos.'}
            {ruleType === 'allOf' && 'El alumno debe proporcionar todas las palabras de la lista para tenerla correcta.'}
            {ruleType === 'kOf' && 'El alumno debe acertar un número mínimo de palabras de una lista más grande.'}
          </p>
        </div>
      </div>

      {ruleType === "kOf" && (
        <div className="flex items-center space-x-4 text-sm bg-accent-focus/10 p-4 rounded-2xl border border-accent-focus/20">
          <label className="text-white font-bold tracking-wide">Mínimo de respuestas correctas necesarias:</label>
          <input
            type="number"
            min={1}
            max={items.length || 1}
            value={kValue}
            onChange={(e) => {
              const k = parseInt(e.target.value) || 1;
              setKValue(k);
              handleChange(ruleType, items, forbidItems, k, media);
            }}
            className="w-20 px-3 py-2 bg-void border border-border-subtle rounded-xl text-white focus:outline-none focus:border-accent-focus focus:ring-1 focus:ring-accent-focus font-mono text-center"
          />
        </div>
      )}

      {/* Allowed Items */}
      <div className="space-y-4">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">Respuesta Correcta</label>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex space-x-3 group relative">
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemsChange(idx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && ruleType !== "exact") {
                    e.preventDefault();
                    const next = [...items, ""];
                    setItems(next);
                    handleChange(ruleType, next, forbidItems, kValue, media);
                  }
                }}
                className="flex-1 px-5 py-3.5 bg-void/50 border border-border-subtle rounded-2xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                placeholder={
                  ruleType === "exact" ? "Ej: Apple" :
                  ruleType === "anyOf" ? "Añadir opción correcta y presionar Enter..." :
                  ruleType === "allOf" ? "Añadir respuesta requerida y presionar Enter..." :
                  "Añadir opción válida y presionar Enter..."
                }
              />
              {ruleType !== "exact" && (
                <button
                  type="button"
                  onClick={() => {
                    const next = items.filter((_, i) => i !== idx);
                    setItems(next);
                    handleChange(ruleType, next, forbidItems, kValue, media);
                  }}
                  className="p-3.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all absolute right-0 opacity-0 group-hover:opacity-100"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        {ruleType !== "exact" && (
          <button
            type="button"
            onClick={() => {
              const next = [...items, ""];
              setItems(next);
              handleChange(ruleType, next, forbidItems, kValue, media);
            }}
            className="text-[13px] font-bold text-accent-focus hover:text-accent-focus/80 flex items-center px-2 py-1 mt-2 transition-colors uppercase tracking-wider"
          >
            <Plus size={16} className="mr-1.5" /> 
            {ruleType === "anyOf" ? "Añadir opción correcta" : 
             ruleType === "allOf" ? "Añadir respuesta requerida" : 
             "Añadir opción"}
          </button>
        )}
      </div>

      {/* Forbid Items */}
      <div className="space-y-4 pt-6 border-t border-border-subtle/50">
        <div className="flex flex-col">
          <label className="flex text-[11px] font-bold uppercase tracking-wider text-red-400/80 items-center ml-1">
            <AlertCircle size={14} className="mr-1.5 text-red-400" /> Palabras Prohibidas (Invalidan la respuesta)
          </label>
          <span className="text-[11px] text-text-dim ml-1 mt-1">Ajustes Avanzados: Usa esto si el alumno suele confundirse con un "falso amigo".</span>
        </div>
        <div className="space-y-3">
          {forbidItems.map((item, idx) => (
            <div key={`forbid-${idx}`} className="flex space-x-3 group relative">
              <input
                type="text"
                value={item}
                onChange={(e) => handleForbidItemsChange(idx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const next = [...forbidItems, ""];
                    setForbidItems(next);
                    handleChange(ruleType, items, next, kValue, media);
                  }
                }}
                className="flex-1 px-5 py-3.5 bg-red-950/10 border border-red-500/30 rounded-2xl text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-red-400/30"
                placeholder="Añadir palabra prohibida y presionar Enter..."
              />
              <button
                type="button"
                onClick={() => {
                  const next = forbidItems.filter((_, i) => i !== idx);
                  setForbidItems(next);
                  handleChange(ruleType, items, next, kValue, media);
                }}
                className="p-3.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all absolute right-0 opacity-0 group-hover:opacity-100"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const next = [...forbidItems, ""];
            setForbidItems(next);
            handleChange(ruleType, items, next, kValue, media);
          }}
          className="text-[13px] font-bold text-red-400 hover:text-red-300 flex items-center px-2 py-1 mt-2 transition-colors uppercase tracking-wider"
        >
          <Plus size={16} className="mr-1.5" /> Añadir palabra prohibida
        </button>
      </div>

      {/* Media */}
      <div className="space-y-3 pt-6 border-t border-border-subtle/50">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">Multimedia</label>
        <input
          type="text"
          value={media}
          onChange={(e) => {
            setMedia(e.target.value);
            handleChange(ruleType, items, forbidItems, kValue, e.target.value);
          }}
          className="w-full px-5 py-3.5 bg-void/50 border border-border-subtle rounded-2xl text-white focus:outline-none focus:border-accent-focus focus:ring-1 focus:ring-accent-focus transition-all shadow-inner"
          placeholder="URL de Audio o Imagen (Opcional)"
        />
      </div>

    </div>
  );
}
