import { describe, expect, it } from "vitest";
import {
    assertUuid,
    CONTENT_LIMITS,
    safeInternalRedirect,
    sanitizeCardInput,
    sanitizeDeckImport,
    sanitizeDeckMetadata,
} from "./security";

describe("safeInternalRedirect", () => {
    it.each([
        [null, "/dashboard"],
        ["", "/dashboard"],
        ["https://evil.example/path", "/dashboard"],
        ["//evil.example/path", "/dashboard"],
        ["/\\evil.example/path", "/dashboard"],
        ["%2F%2Fevil.example/path", "/dashboard"],
        ["/%2f%2fevil.example/path", "/dashboard"],
        ["/dashboard\r\nLocation: https://evil.example", "/dashboard"],
    ])("rejects unsafe redirect %s", (input, expected) => {
        expect(safeInternalRedirect(input)).toBe(expected);
    });

    it.each([
        ["/dashboard", "/dashboard"],
        ["/grammar?from=login", "/grammar?from=login"],
        ["/vocabulario/deck-id#cards", "/vocabulario/deck-id#cards"],
    ])("keeps safe internal redirect %s", (input, expected) => {
        expect(safeInternalRedirect(input)).toBe(expected);
    });

    it("uses a caller-provided fallback", () => {
        expect(safeInternalRedirect("//evil.example", "/")).toBe("/");
    });
});

describe("server mutation input hardening", () => {
    it("normalizes bounded deck and card input", () => {
        expect(sanitizeDeckMetadata("  Mi mazo  ", " práctica ")).toEqual({
            title: "Mi mazo",
            description: "práctica",
        });
        expect(sanitizeCardInput("  Prompt ", [
            { field: "Respuesta", text: [" one ", "two"] },
        ], "https://cdn.example/image.png")).toMatchObject({
            frontText: "Prompt",
            frontMedia: "https://cdn.example/image.png",
            slots: [{
                label: "Respuesta",
                accepted_answers: ["one", "two"],
                match_type: "any",
            }],
        });
    });

    it("rejects oversized or dangerous input", () => {
        expect(() => sanitizeDeckMetadata("x".repeat(CONTENT_LIMITS.title + 1))).toThrow();
        expect(() => sanitizeCardInput("Prompt", [], null)).toThrow();
        expect(() => sanitizeCardInput("Prompt", [{ field: "x", text: "y", media: "javascript:alert(1)" }])).toThrow();
        expect(() => sanitizeDeckImport("x".repeat(CONTENT_LIMITS.importBytes + 1))).toThrow();
    });

    it("validates UUIDs before database access", () => {
        expect(assertUuid("86f9ffb4-3d4e-4b0d-a3c7-51e4021e39af")).toContain("-");
        expect(() => assertUuid("not-a-uuid")).toThrow();
    });
});
