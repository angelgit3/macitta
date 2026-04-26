import { describe, it, expect } from "vitest";
import { parseLabels, formatLabels } from "./metadataUtils";

describe("metadataUtils", () => {
  describe("parseLabels", () => {
    it("splits by comma and trims whitespace", () => {
      expect(parseLabels("EN, ES, FR ")).toEqual(["EN", "ES", "FR"]);
    });

    it("ignores empty entries", () => {
      expect(parseLabels("EN,, FR, ")).toEqual(["EN", "FR"]);
    });

    it("returns empty array for empty string", () => {
      expect(parseLabels("   ")).toEqual([]);
    });
  });

  describe("formatLabels", () => {
    it("joins array with commas", () => {
      expect(formatLabels(["EN", "ES", "FR"])).toBe("EN, ES, FR");
    });
    
    it("returns empty string for empty array", () => {
      expect(formatLabels([])).toBe("");
    });
  });
});
