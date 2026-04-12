import { describe, it, expect } from "vitest";
import { validateAnswer, normalize } from "./validator";

describe("normalize", () => {
    it("trims whitespace and lowercases", () => {
        expect(normalize("  HOLA  ")).toBe("hola");
    });
    it("collapses multiple spaces", () => {
        expect(normalize("hola   mundo")).toBe("hola mundo");
    });
});

describe("validateAnswer — string target", () => {
    it("matches exact string (case-insensitive)", () => {
        expect(validateAnswer("hola", "hola")).toBe(true);
        expect(validateAnswer("HOLA", "hola")).toBe(true);
    });
    it("rejects mismatched string", () => {
        expect(validateAnswer("hola", "mundo")).toBe(false);
    });
});

describe("validateAnswer — string[] target (implicit anyOf)", () => {
    it("matches any option in the array", () => {
        expect(validateAnswer("rojo", ["rojo", "azul", "verde"])).toBe(true);
        expect(validateAnswer("AZUL", ["rojo", "azul", "verde"])).toBe(true);
    });
    it("rejects value not in array", () => {
        expect(validateAnswer("amarillo", ["rojo", "azul", "verde"])).toBe(false);
    });
});

describe("validateAnswer — anyOf", () => {
    it("matches any option in anyOf", () => {
        expect(validateAnswer("si", { anyOf: ["si", "sí", "yes"] })).toBe(true);
        expect(validateAnswer("SÍ", { anyOf: ["si", "sí", "yes"] })).toBe(true);
    });
    it("rejects value not in anyOf", () => {
        expect(validateAnswer("no", { anyOf: ["si", "sí", "yes"] })).toBe(false);
    });
});

describe("validateAnswer — allOf", () => {
    it("matches when all required items present (comma-separated)", () => {
        const target = { allOf: ["rojo", "azul", "amarillo"] };
        expect(validateAnswer("rojo, azul, amarillo", target)).toBe(true);
    });
    it("matches regardless of order", () => {
        const target = { allOf: ["rojo", "azul"] };
        expect(validateAnswer("azul, rojo", target)).toBe(true);
    });
    it("rejects when missing a required item", () => {
        const target = { allOf: ["rojo", "azul", "verde"] };
        expect(validateAnswer("rojo, azul", target)).toBe(false);
    });
    it("supports semicolon separator", () => {
        const target = { allOf: ["a", "b"] };
        expect(validateAnswer("a; b", target)).toBe(true);
    });
});

describe("validateAnswer — kOf", () => {
    it("passes when atLeast items matched", () => {
        const target = { kOf: { of: ["a", "b", "c", "d"], atLeast: 2 } };
        expect(validateAnswer("a, b", target)).toBe(true);
        expect(validateAnswer("a, c, d", target)).toBe(true);
    });
    it("passes when all items matched (more than atLeast)", () => {
        const target = { kOf: { of: ["a", "b", "c"], atLeast: 2 } };
        expect(validateAnswer("a, b, c", target)).toBe(true);
    });
    it("fails when fewer than atLeast matched", () => {
        const target = { kOf: { of: ["a", "b", "c"], atLeast: 2 } };
        expect(validateAnswer("a", target)).toBe(false);
        expect(validateAnswer("x, y", target)).toBe(false);
    });
    it("atLeast=1 requires only one match", () => {
        const target = { kOf: { of: ["a", "b", "c"], atLeast: 1 } };
        expect(validateAnswer("b", target)).toBe(true);
        expect(validateAnswer("x", target)).toBe(false);
    });
});

describe("validateAnswer — edge cases", () => {
    it("rejects empty input against any target", () => {
        expect(validateAnswer("", "algo")).toBe(false);
        expect(validateAnswer("   ", "algo")).toBe(false);
    });
    it("rejects null/unknown target shape", () => {
        expect(validateAnswer("x", {} as any)).toBe(false);
    });
});
