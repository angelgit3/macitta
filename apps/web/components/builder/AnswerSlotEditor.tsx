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
      
      <div className="flex justify-between items-center pb-4 border-b border-border-subtle/50">
        <div className="flex items-center gap-3">
          <div className="bg-void/60 px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-bold text-white tracking-widest uppercase">
            {label}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <label className="text-[10px] uppercase font-bold text-text-dim/60 mr-1">Tipo de Evaluación</label>
          <select
            value={ruleType}
            onChange={(e) => {
              const rt = e.target.value as RuleType;
              setRuleType(rt);
              handleChange(rt, items, forbidItems, kValue, media);
            }}
            className="border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-void text-white focus:outline-none focus:border-accent-focus focus:ring-1 focus:ring-accent-focus transition-all appearance-none cursor-pointer pr-10 font-medium"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          >
            <option value="exact">Coincidencia Exacta (1 palabra)</option>
            <option value="anyOf">Cualquiera (Sinónimos / Opciones)</option>
            <option value="allOf">Todas las Opciones (Lista requerida)</option>
            <option value="kOf">Al menos N Opciones correctas</option>
          </select>
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
