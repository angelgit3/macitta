# Auth UI Specification

## Purpose

Defines the layout and visual requirements for authentication pages, ensuring they are presented elegantly within a full-width immersive background.

## Requirements

### Requirement: Centered Auth Card Layout

The system MUST display authentication forms (login, signup) within a centered card on desktop viewports, overlaid on a full-width background.

#### Scenario: Accessing the login page on desktop

- GIVEN a user navigates to the `/login` route on a desktop device
- WHEN the page renders
- THEN the authentication form MUST be contained within a clearly defined card
- AND the card MUST be horizontally and vertically centered in the viewport
- AND the background MUST extend full-width behind the card

### Requirement: Immersive Background Integration

The authentication layout MUST utilize the global immersive background effects to maintain visual consistency with the marketing pages.

#### Scenario: Visual consistency

- GIVEN the authentication layout
- WHEN the user views the background behind the centered auth card
- THEN the background MUST display the application's signature glowing orbs and grid pattern
- AND it MUST span the entire viewport
