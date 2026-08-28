import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  aggregateListeningProgress,
  buildListeningQueue,
  createEmptyListeningQuestionProgress,
  createEmptyListeningSkillProgress,
  evaluateListeningAnswer,
} from "./listening";
import {
  LISTENING_QUESTIONS,
  LISTENING_SKILLS,
  LISTENING_UNITS,
} from "./listeningBank";

const NOW = new Date("2026-07-29T12:00:00.000Z");
const quickUnit = LISTENING_UNITS.find((unit) => unit.kind === "quick")!;
const quickQuestion = LISTENING_QUESTIONS.find(
  (question) => question.unit_id === quickUnit.id,
)!;

describe("Listening two-point scoring", () => {
  it("cleans a first-listen correct response", () => {
    const result = evaluateListeningAnswer(
      createEmptyListeningQuestionProgress("user", quickQuestion.id),
      createEmptyListeningSkillProgress(
        "user",
        quickQuestion.primary_skill_code,
      ),
      true,
      1,
      NOW,
    );
    expect(result.earnedPoints).toBe(2);
    expect(result.questionProgress.points).toBe(2);
  });

  it("awards only one point after a replay and requires a later recovery", () => {
    const first = evaluateListeningAnswer(
      createEmptyListeningQuestionProgress("user", quickQuestion.id),
      createEmptyListeningSkillProgress(
        "user",
        quickQuestion.primary_skill_code,
      ),
      true,
      2,
      NOW,
    );
    const second = evaluateListeningAnswer(
      first.questionProgress,
      first.skillProgress,
      true,
      1,
      new Date("2026-07-31T12:00:00.000Z"),
    );
    expect(first.earnedPoints).toBe(1);
    expect(first.questionProgress.points).toBe(1);
    expect(second.questionProgress.points).toBe(2);
  });

  it("sends an incorrect response back to immediate recovery", () => {
    const result = evaluateListeningAnswer(
      {
        ...createEmptyListeningQuestionProgress("user", quickQuestion.id),
        points: 1,
        attempts: 1,
      },
      createEmptyListeningSkillProgress(
        "user",
        quickQuestion.primary_skill_code,
      ),
      false,
      1,
      NOW,
    );
    expect(result.questionProgress.points).toBe(0);
    expect(result.questionProgress.dueAt).toBe(NOW.toISOString());
  });

  it("evaluates consecutive questions in long audios independently with 2 points on first listen", () => {
    const longUnit = LISTENING_UNITS.find((unit) => unit.kind === "long")!;
    const longQuestions = LISTENING_QUESTIONS.filter(
      (q) => q.unit_id === longUnit.id,
    );
    expect(longQuestions.length).toBe(5);

    const q1Result = evaluateListeningAnswer(
      createEmptyListeningQuestionProgress("user", longQuestions[0].id),
      createEmptyListeningSkillProgress(
        "user",
        longQuestions[0].primary_skill_code,
      ),
      true,
      1,
      NOW,
    );
    expect(q1Result.earnedPoints).toBe(2);

    const q2Result = evaluateListeningAnswer(
      createEmptyListeningQuestionProgress("user", longQuestions[1].id),
      createEmptyListeningSkillProgress(
        "user",
        longQuestions[1].primary_skill_code,
      ),
      true,
      1,
      NOW,
    );
    expect(q2Result.earnedPoints).toBe(2);

    const q3Result = evaluateListeningAnswer(
      createEmptyListeningQuestionProgress("user", longQuestions[2].id),
      createEmptyListeningSkillProgress(
        "user",
        longQuestions[2].primary_skill_code,
      ),
      true,
      2,
      NOW,
    );
    expect(q3Result.earnedPoints).toBe(1);

    const q4Result = evaluateListeningAnswer(
      createEmptyListeningQuestionProgress("user", longQuestions[3].id),
      createEmptyListeningSkillProgress(
        "user",
        longQuestions[3].primary_skill_code,
      ),
      true,
      1,
      NOW,
    );
    expect(q4Result.earnedPoints).toBe(2);
  });
});

describe("Listening adaptive queues", () => {
  it("forms five distinct short listening prompts for a new learner", () => {
    const candidates = LISTENING_QUESTIONS.filter((question) =>
      LISTENING_UNITS.some(
        (unit) => unit.id === question.unit_id && unit.kind === "quick",
      ),
    ).map((question) => ({
      unit: LISTENING_UNITS.find((unit) => unit.id === question.unit_id)!,
      question,
    }));
    const queue = buildListeningQueue(candidates, {
      userId: "new-user",
      mode: "quick",
      now: NOW,
    });
    expect(queue).toHaveLength(5);
    expect(new Set(queue.map((item) => item.unit.id)).size).toBe(5);
  });

  it("keeps all five questions from exactly one long audio together", () => {
    const candidates = LISTENING_QUESTIONS.map((question) => ({
      unit: LISTENING_UNITS.find((unit) => unit.id === question.unit_id)!,
      question,
    }));
    const queue = buildListeningQueue(candidates, {
      userId: "new-user",
      mode: "long",
      now: NOW,
    });
    expect(queue).toHaveLength(5);
    expect(new Set(queue.map((item) => item.unit.id)).size).toBe(1);
    expect(queue.every((item) => item.unit.kind === "long")).toBe(true);
  });

  it("does not surface a recovering exact item before it is due", () => {
    const progress = {
      ...createEmptyListeningQuestionProgress("user", quickQuestion.id),
      attempts: 1,
      dueAt: "2026-07-29T12:30:00.000Z",
    };
    const queue = buildListeningQueue(
      [{ unit: quickUnit, question: quickQuestion, progress }],
      {
        userId: "user",
        mode: "quick",
        now: NOW,
      },
    );
    expect(queue).toHaveLength(0);
  });
});

describe("Listening catalog progress", () => {
  it("reports clean and recovery counts independently", () => {
    const first = {
      ...createEmptyListeningQuestionProgress(
        "user",
        LISTENING_QUESTIONS[0].id,
      ),
      points: 2 as const,
      attempts: 1,
    };
    const second = {
      ...createEmptyListeningQuestionProgress(
        "user",
        LISTENING_QUESTIONS[1].id,
      ),
      attempts: 1,
    };
    expect(
      aggregateListeningProgress(LISTENING_QUESTIONS.slice(0, 2), [
        first,
        second,
      ]),
    ).toEqual({
      total: 2,
      clean: 1,
      started: 2,
      recovery: 1,
      percent: 50,
    });
  });
});

describe("Listening catalog integrity", () => {
  const repositoryRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../..",
  );
  const audioDirectory = resolve(
    repositoryRoot,
    "apps/web/public/audio/toefl-listening",
  );

  it("keeps the expected Skills 4–14 inventory", () => {
    const addedSkillCodes = [
      "who_what_where",
      "passive",
      "multiple_nouns",
      "negative",
      "double_negative",
      "almost_negative",
      "comparative",
      "agreement",
      "uncertainty",
      "suggestion",
      "surprise",
      "wish",
    ];
    expect(addedSkillCodes).toHaveLength(12);
    expect(LISTENING_SKILLS).toHaveLength(19);
    expect(
      LISTENING_UNITS.filter((unit) => unit.id.startsWith("skill")),
    ).toHaveLength(88);
    expect(
      LISTENING_QUESTIONS.filter((question) =>
        question.id.startsWith("q-skill"),
      ),
    ).toHaveLength(88);
    expect(
      addedSkillCodes.every((code) =>
        LISTENING_SKILLS.some((skill) => skill.code === code),
      ),
    ).toBe(true);
  });

  it("uses unique IDs across skills, units, and questions", () => {
    expect(new Set(LISTENING_SKILLS.map((skill) => skill.code)).size).toBe(
      LISTENING_SKILLS.length,
    );
    expect(new Set(LISTENING_UNITS.map((unit) => unit.id)).size).toBe(
      LISTENING_UNITS.length,
    );
    expect(
      new Set(LISTENING_QUESTIONS.map((question) => question.id)).size,
    ).toBe(LISTENING_QUESTIONS.length);
  });

  it("links every question to a unit and a declared skill", () => {
    const unitIds = new Set(LISTENING_UNITS.map((unit) => unit.id));
    const skillCodes = new Set(LISTENING_SKILLS.map((skill) => skill.code));
    for (const question of LISTENING_QUESTIONS) {
      expect(unitIds.has(question.unit_id), question.id).toBe(true);
      expect(skillCodes.has(question.primary_skill_code), question.id).toBe(
        true,
      );
    }
  });

  it("has one valid question per quick unit and five ordered questions per long unit", () => {
    for (const unit of LISTENING_UNITS) {
      const questions = LISTENING_QUESTIONS.filter(
        (question) => question.unit_id === unit.id,
      );
      expect(questions, unit.id).toHaveLength(unit.kind === "quick" ? 1 : 5);
      expect(
        questions.map((question) => question.order_index),
        unit.id,
      ).toEqual(
        Array.from({ length: questions.length }, (_, index) => index + 1),
      );
    }
  });

  it("keeps every question complete and internally consistent", () => {
    for (const question of LISTENING_QUESTIONS) {
      expect([1, 2, 3], question.id).toContain(question.difficulty);
      expect(question.prompt.trim().length, question.id).toBeGreaterThan(5);
      expect(question.options, question.id).toHaveLength(4);
      expect(
        new Set(question.options.map((option) => option.id)).size,
        question.id,
      ).toBe(4);
      expect(
        new Set(question.options.map((option) => option.text)).size,
        question.id,
      ).toBe(4);
      expect(
        question.options.some(
          (option) => option.id === question.correct_option_id,
        ),
        question.id,
      ).toBe(true);
      expect(
        question.options.every((option) => option.text.trim().length > 7),
        question.id,
      ).toBe(true);
      expect(
        question.explanation_es.trim().length,
        question.id,
      ).toBeGreaterThan(15);
      expect(question.evidence.trim().length, question.id).toBeGreaterThan(9);
    }
  });

  it("has exactly one non-orphaned MP3 for every catalog unit", () => {
    const expectedFiles = new Set(
      LISTENING_UNITS.map((unit) => `${unit.id}.mp3`),
    );
    const actualFiles = new Set(
      readdirSync(audioDirectory).filter((file) => file.endsWith(".mp3")),
    );
    expect(actualFiles).toEqual(expectedFiles);
    for (const unit of LISTENING_UNITS) {
      expect(unit.audio_path).toBe(`/audio/toefl-listening/${unit.id}.mp3`);
      expect(
        existsSync(resolve(audioDirectory, `${unit.id}.mp3`)),
        unit.id,
      ).toBe(true);
    }
  });

  it("keeps the canonical synthesis scripts aligned with the published transcripts", () => {
    const bank = JSON.parse(
      readFileSync(
        resolve(repositoryRoot, "scripts/listening-audio/listening-bank.json"),
        "utf8",
      ),
    ) as { units: Array<{ id: string; segments: Array<{ text: string }> }> };
    expect(bank.units).toHaveLength(LISTENING_UNITS.length);
    expect(new Set(bank.units.map((unit) => unit.id))).toEqual(
      new Set(LISTENING_UNITS.map((unit) => unit.id)),
    );

    for (const script of bank.units) {
      const unit = LISTENING_UNITS.find(
        (candidate) => candidate.id === script.id,
      )!;
      let cursor = 0;
      for (const segment of script.segments) {
        const position = unit.transcript.indexOf(segment.text, cursor);
        expect(
          position,
          `${script.id}: ${segment.text}`,
        ).toBeGreaterThanOrEqual(0);
        cursor = position + segment.text.length;
      }
    }
  });
});
