# @maccita/shared

Core scheduling engine and shared types for the [Macitta](https://www.macitta.app) educational platform.

## SREM — Spaced Repetition Engine

A TypeScript implementation of a custom spaced repetition algorithm designed for vocabulary acquisition. Goes beyond SM-2 with:

- **9-step growth curve** toward yearly mastery `[0, 1, 3, 7, 16, 35, 75, 150, 365]`
- **Real-time penalties** — Hard/Again penalise `elapsedDays`, not stored intervals
- **Hard step recalibration** — step always reflects true card position post-penalty
- **Lapse-capped promotion** — Easy only advances 1 step for cards with failure history
- **Difficulty modulation** — ±27% interval adjustment via a per-card difficulty score

**[→ Full algorithm documentation](../../docs/srem-algorithm.md)**

## Quick Start

```typescript
import { createEmptySEMState, evaluateSEM } from '@maccita/shared';

const state = createEmptySEMState();

// accuracy: 1.0 = all slots correct | timeMs: response time
const result = evaluateSEM(state, 1.0, 2100); // → Easy

console.log(result.nextState.step);     // 2
console.log(result.nextState.interval); // 3 days
console.log(result.nextState.dueDate);  // ISO 8601 — 3 days from now
```

## Tests

```bash
npm run test
# 40+ tests covering all scheduling invariants
```

## License

MIT
