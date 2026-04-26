# creator-zone Specification

## Purpose

Displays creator attribution and external social links in the user profile.

## Requirements

### Requirement: Creator Attribution

The system MUST display the creator's initials and name to provide proper attribution.

#### Scenario: User views the attribution section

- GIVEN the creator zone is rendered in the user profile
- WHEN the user views the section
- THEN the system MUST display the label "Desarrollado por"
- AND the system MUST display the initials "AA"
- AND the system MUST display the name "Alberto Anaya"
- AND the system MUST maintain existing UI styling (Tailwind CSS)

### Requirement: Social Links

The system MUST provide external links to the creator's specific social profiles.

#### Scenario: User views the social links

- GIVEN the creator zone is rendered in the user profile
- WHEN the user views the social buttons
- THEN the system MUST display an Instagram link button
- AND the system MUST display a Twitter link button
- AND the system MUST display a GitHub link button
- AND the buttons MUST use the `ZenButton` component
- AND the buttons MUST use `lucide-react` icons
