import { evaluateAnswer, createEmptyCard, Grade } from "./src/algorithm";

const card = createEmptyCard();
const target = "hello";

console.log("--- Testing FSRS Logic ---");

// Test 1: Perfect & Fast (<4s)
const r1 = evaluateAnswer(card, "hello", target, 2000);
console.log(`1. Perfect Fast (2s): ${Grade[r1.rating]} (Expected: Easy) - Pass: ${r1.rating === Grade.Easy}`);

// Test 2: Perfect & Good (5s)
const r2 = evaluateAnswer(card, "hello", target, 5000);
console.log(`2. Perfect Good (5s): ${Grade[r2.rating]} (Expected: Good) - Pass: ${r2.rating === Grade.Good}`);

// Test 3: Perfect & Slow (>8s)
const r3 = evaluateAnswer(card, "hello", target, 9000);
console.log(`3. Perfect Slow (9s): ${Grade[r3.rating]} (Expected: Hard) - Pass: ${r3.rating === Grade.Hard}`);

// Test 4: Typo (Dist 1)
const r4 = evaluateAnswer(card, "hullo", target, 2000);
console.log(`4. Typo 'hullo' (Dist 1): ${Grade[r4.rating]} (Expected: Easy/Good depending on time) - IsTypo: ${r4.isTypo} - Pass: ${r4.rating !== Grade.Again}`);

// Test 5: Wrong (Dist 2)
const r5 = evaluateAnswer(card, "halloa", target, 2000);
console.log(`5. Wrong 'halloa' (Dist 2): ${Grade[r5.rating]} (Expected: Again) - Pass: ${r5.rating === Grade.Again}`);

// Test 6: anyOf
const targetAny = { anyOf: ["color", "colour"] };
const r6 = evaluateAnswer(card, "colour", targetAny, 2000);
console.log(`6. AnyOf Match 'colour': ${Grade[r6.rating]} (Expected: Easy) - Pass: ${r6.rating === Grade.Easy}`);
