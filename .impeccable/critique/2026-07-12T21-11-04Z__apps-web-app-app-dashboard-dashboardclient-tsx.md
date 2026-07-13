---
target: Inicio autenticado de Macitta
total_score: 25
p0_count: 0
p1_count: 2
timestamp: 2026-07-12T21-11-04Z
slug: apps-web-app-app-dashboard-dashboardclient-tsx
---
# Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Offline and loading are visible, but loading copy is presented as final content. |
| 2 | Match system / real world | 4 | Plain study language and familiar calendar/navigation metaphors. |
| 3 | User control and freedom | 2 | Clear navigation exists, but the daily card has only one global-study path and no scope preview. |
| 4 | Consistency and standards | 3 | Strong visual consistency; loading and ready states do not yet behave consistently. |
| 5 | Error prevention | 2 | The study CTA remains active before the card count has resolved. |
| 6 | Recognition rather than recall | 4 | All primary destinations are labeled and visible. |
| 7 | Flexibility and efficiency | 1 | No session-size choice, recent deck shortcut, or visible accelerator. |
| 8 | Aesthetic and minimalist design | 3 | Focused and calm, but the week strip consumes disproportionate desktop space. |
| 9 | Error recovery | 2 | Offline is acknowledged, but no explanation of what will sync or when. |
| 10 | Help and documentation | 1 | No contextual explanation for scheduling, global study, or the activity empty state. |
| **Total** | | **25/40** | **Acceptable; focused polish needed before shipping.** |

# Anti-Patterns Verdict

The page no longer reads as generic AI SaaS. The restrained palette, daily-study hierarchy, absence of decorative card grids, and labeled dock give it a coherent product identity. The remaining generic tell is the oversized weekly strip: it resembles a wellness tracker but does not yet support interaction or decision-making.

The deterministic detector returned zero findings across DashboardClient, StatsGraph, and ZenDock. That supports the absence of banned implementation patterns, but it does not invalidate the state and hierarchy issues found visually.

# Overall Impression

The redesign has a strong foundation and the primary action is unmistakable. Its biggest opportunity is to make the daily session trustworthy: resolve loading before inviting the user to begin, and explain what the session contains without overwhelming them with a large backlog count.

# What's Working

- One dominant study action replaces the old equal-weight dashboard controls.
- Navigation labels, touch targets, focus styles, and semantic landmarks are strong.
- Periwinkle is used for action and selection, not decoration.

# Priority Issues

## [P1] Loading state and CTA contradict each other

The heading says “Preparando tu sesión” while “Comenzar sesión” remains active. A user can act before the UI knows what it is offering. Disable the CTA and render a structural skeleton until dueCards resolves.

## [P1] The backlog count lacks session scope

“94 tarjetas por repasar” sounds like the next session contains 94 cards. If the study hook batches fewer cards, the dashboard is misleading; if it really starts all 94, the task is intimidating. Show the actual next batch or phrase it as backlog plus session size.

## [P2] The weekly calendar looks interactive but is static

The active underline and seven equal date cells imply selection. Either make dates selectable and update activity, or reduce the strip to a compact non-interactive context line.

## [P2] Weekly activity is low-value when every value is zero

The empty state explains that data will appear, but it still occupies a main dashboard section. Collapse it into a short prompt until the first completed session.

## [P2] Offline status lacks consequence

“Disponible sin conexión” is reassuring, but it does not say that progress will be saved locally and synced later. Add concise, contextual trust copy or a detail affordance.

# Persona Red Flags

- Alex, power user: cannot choose session scope or jump back to the last deck; the only accelerator is global study.
- Sam, accessibility-dependent user: semantics and touch targets are good, but the loading heading changes without a dedicated announcement explaining when the CTA becomes ready.
- Casey, distracted mobile user: the primary action is thumb-friendly, but a count such as 94 creates perceived commitment with no visible batch limit.

# Minor Observations

- The greeting displays an ellipsis while user data loads, which looks like unfinished copy.
- The central dock label is outside the link; its icon link has an accessible name, but making icon and visible label one link would improve the hit area contract.
- “Conectado” is not the same as “sincronizado”; avoid implying successful synchronization from network status alone.

# Questions to Consider

- Should Inicio describe the entire backlog or only the next achievable session?
- Does the weekly date strip need to be interactive?
- What is the smallest honest offline message that earns trust without adding noise?
