"use client";

import { useState, useEffect } from "react";
import { useDeckBuilder } from "../../contexts/DeckBuilderContext";
import { BuilderAnswerSlot, BuilderAdvancedRules } from "../../types/builder";
import { buildAnswerSlot, RuleType } from "../../contexts/deckBuilderUtils";
import { X, Plus, AlertCircle, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { ZenInput } from "@/components/ui/ZenInput";

type Props = {
  cardIndex?: number;
  slotIndex?: number;
  label: string;
  slot?: BuilderAnswerSlot;
  onChangeSlot?: (slot: BuilderAnswerSlot) => void;
};

export function AnswerSlotEditor({ cardIndex, slotIndex, label, slot, onChangeSlot }: Props) {
  // Safely attempt to get context, but don't crash if it's not there (for standalone usage)
  let dispatch: any = null;
  try {
    const context = useDeckBuilder();
    dispatch = context.dispatch;
  } catch (e) {
    // Ignore error if used outside provider
  }

  const [showAdvanced, setShowAdvanced] = useState(false);

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
    
    if (onChangeSlot) {
      onChangeSlot(updatedSlot);
    } else if (dispatch && cardIndex !== undefined && slotIndex !== undefined) {
      dispatch({
        type: "UPDATE_ANSWER_SLOT",
        payload: { cardIndex, slotIndex, slot: updatedSlot }
      });
    }
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
    <div className="bg-stone-surface/30 backdrop-blur-sm rounded-2xl border border-border-subtle p-5 space-y-4 shadow-lg relative overflow-hidden transition-all duration-300 hover:border-text-dim/30">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
      
      {/* Header and Answer Fields */}
      <div className="flex flex-col gap-3">
        <div className="bg-void/80 self-start px-3 py-1.5 rounded-lg border border-border-subtle shadow-inner text-xs font-black text-white tracking-widest uppercase">
          {label}
        </div>
        
        {/* Main Answer Inputs */}
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex space-x-2 group relative">
                <ZenInput
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
                  className="flex-1"
                  inputClassName="py-2.5 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder={
                    ruleType === "exact" ? "Respuesta correcta (Ej: Apple)" :
                    ruleType === "anyOf" ? "Opción válida y presionar Enter..." :
                    ruleType === "allOf" ? "Respuesta requerida y presionar Enter..." :
                    "Opción válida y presionar Enter..."
                  }
                />
              {ruleType !== "exact" && (
                <button
                  type="button"
                  onClick={() => {
                    if (items.length === 1) return;
                    const next = items.filter((_, i) => i !== idx);
                    setItems(next);
                    handleChange(ruleType, next, forbidItems, kValue, media);
                  }}
                  disabled={items.length === 1}
                  className="p-2.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {ruleType !== "exact" && (
            <button
              type="button"
              onClick={() => {
                const next = [...items, ""];
                setItems(next);
                handleChange(ruleType, next, forbidItems, kValue, media);
              }}
              className="text-[11px] font-bold text-accent-focus hover:text-accent-focus/80 flex items-center px-1 py-1 transition-colors uppercase tracking-wider"
            >
              <Plus size={14} className="mr-1" /> 
              {ruleType === "anyOf" ? "Añadir opción correcta" : 
               ruleType === "allOf" ? "Añadir respuesta requerida" : 
               "Añadir opción"}
            </button>
          )}
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <div className="pt-2 border-t border-border-subtle/30">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-[11px] font-bold uppercase tracking-wider text-text-dim hover:text-white transition-colors py-1"
        >
          <span className="flex items-center gap-1.5"><Settings2 size={14} /> Ajustes Avanzados</span>
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Advanced Options Content */}
      {showAdvanced && (
        <div className="space-y-5 pt-3 pb-1 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Evaluation Mode */}
          <div className="flex flex-col gap-2 w-full bg-void/40 p-3 rounded-xl border border-border-subtle/50">
            <label className="text-[10px] uppercase font-bold text-accent-focus">
              Modo de Evaluación
            </label>
            <select
              value={ruleType}
              onChange={(e) => {
                const rt = e.target.value as RuleType;
                setRuleType(rt);
                if (rt === "exact" && items.length > 1) {
                  // Reset to single item if switching to exact
                  const next = [items[0] || ""];
                  setItems(next);
                  handleChange(rt, next, forbidItems, kValue, media);
                } else {
                  handleChange(rt, items, forbidItems, kValue, media);
                }
              }}
              className="w-full border border-border-subtle rounded-lg pl-3 pr-8 py-2 text-sm bg-stone-surface text-white focus:outline-none focus:border-accent-focus focus:ring-1 focus:ring-accent-focus transition-all font-medium"
            >
              <option value="exact">Exacta (Una sola respuesta)</option>
              <option value="anyOf">Sinónimos (Acepta cualquiera)</option>
              <option value="allOf">Múltiple (Todas requeridas)</option>
              <option value="kOf">Parcial (Al menos N correctas)</option>
            </select>
          </div>

          {ruleType === "kOf" && (
            <div className="flex items-center justify-between text-sm bg-accent-focus/10 p-3 rounded-xl border border-accent-focus/20">
              <label className="text-white font-bold text-xs">Aciertos mínimos necesarios:</label>
              <ZenInput
                type="number"
                min={1}
                max={items.length || 1}
                value={kValue}
                onChange={(e) => {
                  const k = parseInt(e.target.value) || 1;
                  setKValue(k);
                  handleChange(ruleType, items, forbidItems, k, media);
                }}
                className="w-24"
                inputClassName="py-1.5 text-center font-mono"
              />
            </div>
          )}

          {/* Forbid Items */}
          <div className="space-y-2">
            <label className="flex text-[10px] font-bold uppercase tracking-wider text-red-400/80 items-center ml-1">
              <AlertCircle size={12} className="mr-1.5 text-red-400" /> Palabras Prohibidas
            </label>
            <div className="space-y-2">
              {forbidItems.map((item, idx) => (
                <div key={`forbid-${idx}`} className="flex space-x-2 group relative">
                  <ZenInput
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
                    className="flex-1"
                    inputClassName="py-2 bg-red-950/10 border-red-500/30 focus:border-red-500 focus:ring-red-500 placeholder:text-red-400/30"
                    placeholder="Palabra que invalida..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = forbidItems.filter((_, i) => i !== idx);
                      setForbidItems(next);
                      handleChange(ruleType, items, next, kValue, media);
                    }}
                    className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                  >
                    <X size={16} />
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
              className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center px-1 transition-colors uppercase tracking-wider mt-1"
            >
              <Plus size={14} className="mr-1" /> Añadir prohibida
            </button>
          </div>

          {/* Media */}
          <div className="pt-2">
            <ZenInput
              label="Multimedia de Respuesta"
              value={media}
              onChange={(e) => {
                setMedia(e.target.value);
                handleChange(ruleType, items, forbidItems, kValue, e.target.value);
              }}
              inputClassName="py-2"
              placeholder="URL de Audio o Imagen (Opcional)"
            />
          </div>

        </div>
      )}
    </div>
  );
}
