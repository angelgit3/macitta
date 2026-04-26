# Delta for Global UI

## ADDED Requirements

### Requirement: Layout Segregation

The system MUST decouple the layout constraints from the root layout, allowing different functional areas (marketing, auth, application) to dictate their own viewport constraints.

#### Scenario: Navigating between marketing and application routes

- GIVEN a user accesses the application from a desktop device
- WHEN they navigate from the marketing page (`/`) to an internal application route (`/(app)/*`)
- THEN the marketing page MUST span the full viewport width
- AND the application route MUST constrain its layout to a centered 480px mobile-first container

### Requirement: Reusable Background Effects

The system MUST implement background visual effects (glowing orbs, grid patterns) as a reusable, scalable component that can be applied to full-width or constrained layouts as needed.

#### Scenario: Applying background effects

- GIVEN a new full-width page layout
- WHEN the `<BackgroundEffects />` component is rendered within it
- THEN the background effects MUST scale to fill the entire viewport seamlessly without breaking the layout
