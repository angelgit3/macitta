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
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b">
        <h3 className="font-semibold text-gray-800 text-lg">Label: {label}</h3>
        <select
          value={ruleType}
          onChange={(e) => {
            const rt = e.target.value as RuleType;
            setRuleType(rt);
            handleChange(rt, items, forbidItems, kValue, media);
          }}
          className="border rounded p-1 text-sm bg-gray-50 text-gray-800"
        >
          <option value="exact">Exacta (Un solo valor)</option>
          <option value="anyOf">Any Of (Sinónimos / Opcional)</option>
          <option value="allOf">All Of (Varias partes requeridas)</option>
          <option value="kOf">K Of (K partes de N opciones)</option>
        </select>
      </div>

      {ruleType === "kOf" && (
        <div className="flex items-center space-x-2 text-sm text-gray-700 bg-blue-50 p-2 rounded">
          <label>¿Cuántas correctas se requieren? (K)</label>
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
            className="w-16 p-1 border rounded"
          />
        </div>
      )}

      {/* Allowed Items */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Valores Aceptados</label>
        {items.map((item, idx) => (
          <div key={idx} className="flex space-x-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemsChange(idx, e.target.value)}
              className="flex-1 p-2 border rounded text-gray-900"
              placeholder={ruleType === "exact" ? "Ej: Apple" : "Opción válida..."}
            />
            {ruleType !== "exact" && (
              <button
                type="button"
                onClick={() => {
                  const next = items.filter((_, i) => i !== idx);
                  setItems(next);
                  handleChange(ruleType, next, forbidItems, kValue, media);
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
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
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-1"
          >
            <Plus size={14} className="mr-1" /> Añadir Opción
          </button>
        )}
      </div>

      {/* Forbid Items */}
      <div className="space-y-2 pt-2 border-t">
        <label className="flex text-sm font-medium text-red-700 items-center">
          <AlertCircle size={14} className="mr-1" /> Valores Prohibidos (Castigo Inmediato)
        </label>
        {forbidItems.map((item, idx) => (
          <div key={`forbid-${idx}`} className="flex space-x-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleForbidItemsChange(idx, e.target.value)}
              className="flex-1 p-2 border-red-200 border rounded text-red-900 focus:ring-red-500"
              placeholder="Ej: Falso amigo..."
            />
            <button
              type="button"
              onClick={() => {
                const next = forbidItems.filter((_, i) => i !== idx);
                setForbidItems(next);
                handleChange(ruleType, items, next, kValue, media);
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const next = [...forbidItems, ""];
            setForbidItems(next);
            handleChange(ruleType, items, next, kValue, media);
          }}
          className="text-sm text-red-600 hover:text-red-800 flex items-center mt-1"
        >
          <Plus size={14} className="mr-1" /> Añadir Prohibición
        </button>
      </div>

      {/* Media */}
      <div className="space-y-2 pt-2 border-t">
        <label className="block text-sm font-medium text-gray-700">Media (URL de Audio/Imagen Opcional)</label>
        <input
          type="text"
          value={media}
          onChange={(e) => {
            setMedia(e.target.value);
            handleChange(ruleType, items, forbidItems, kValue, e.target.value);
          }}
          className="w-full p-2 border rounded text-gray-900 text-sm"
          placeholder="https://ejemplo.com/audio.mp3"
        />
      </div>

    </div>
  );
}
