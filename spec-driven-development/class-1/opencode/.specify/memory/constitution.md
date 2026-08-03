<!--
  Sync Impact Report
  ------------------
  Version change: (none) → 1.0.0
  Modified principles: N/A (first creation)
  Added sections: Core Principles (5 principles), Project Scope & Technology
    Constraints, Development Workflow, Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md — ✅ no changes needed (generic
      "Constitution Check" placeholder defers to constitution)
    - .specify/templates/spec-template.md — ✅ no changes needed (aligns with
      Spec-First principle out of the box)
    - .specify/templates/tasks-template.md — ✅ no changes needed (aligns with
      Incremental Delivery principle)
    - .specify/templates/checklist-template.md — ✅ no changes needed (generic,
      no constitution references)
    - .specify/templates/adr-template.md — ✅ no changes needed (aligns with
      Record Keeping principle)
    - .specify/templates/agent-file-template.md — ✅ no changes needed (generic)
    - .specify/templates/phr-template.prompt.md — ✅ no changes needed (aligns
      with Record Keeping principle)
    - .opencode/command/sp.constitution.md — ✅ no changes needed (already
      references this file)
  Follow-up TODOs: None — all placeholders resolved.
-->

# Velocity Constitution

## Core Principles

### I. Spec-First Development
Every feature MUST begin with a specification document before any code is written.
The specification defines user stories, acceptance criteria, functional requirements,
and success criteria. No implementation work proceeds without an approved spec.
Rationale: Prevents wasted effort, ensures shared understanding, and provides a
testable contract for delivery.

### II. Incremental Delivery
The landing page MUST be built section-by-section in independently verifiable
increments. Each section (Navbar, Hero, Features, Stats, Testimonials, CTA Banner,
Footer) MUST be complete, responsive, and visually verified before the next section
begins. Rationale: Enables early feedback, reduces integration risk, and ensures
each piece delivers standalone value.

### III. Pure Web Standards
All code MUST use pure HTML and CSS only. No JavaScript frameworks, CSS preprocessors,
or build tools are permitted. Layout MUST use CSS Grid and Flexbox. Theming MUST use
CSS Custom Properties. Animations MUST use @keyframes and CSS transitions.
Rationale: Zero dependencies, maximum compatibility, and foundational web skills.

### IV. Responsive & Accessible
All interfaces MUST follow a mobile-first responsive design approach. The primary
breakpoint is 768px (tablet portrait). Semantic HTML5 elements MUST be used
throughout. Color contrast MUST meet WCAG AA standards. CSS clamp() SHOULD be
used for fluid typography and spacing. Rationale: Ensures usability across all
devices and complies with accessibility best practices.

### V. Record Keeping
Every user interaction, design decision, and implementation step MUST be recorded
in a Prompt History Record (PHR). Architecturally significant decisions MUST be
documented as Architecture Decision Records (ADRs) before implementation.
All records live under history/prompts/ and history/adr/ respectively.
Rationale: Creates an auditable trail, enables retrospective analysis, and preserves
context for future contributors.

## Project Scope & Technology Constraints

- **Delivery format**: Single HTML page + single CSS file, served from class-1/ root
- **Backend**: None. No server-side logic, no API calls, no database
- **JavaScript**: Zero. All interactivity (nav toggle, scroll, animations) uses
  pure CSS (checkbox hack, @keyframes, scroll-behavior, :target)
- **External dependencies**: None. System font stack only (-apple-system,
  BlinkMacSystemFont, Segoe UI, etc.)
- **Browser target**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge —
  latest 2 major versions)
- **Deployment**: Static hosting only (no build step required)

## Development Workflow

The development lifecycle follows this sequence:

1. **Constitution** -- Define project principles and constraints (this document)
2. **Specification** -- Write feature spec with user stories and acceptance criteria
3. **Plan** -- Research technical approach, document structure and data model
4. **Tasks** -- Break spec into independently implementable, ordered tasks
5. **Implement** -- Execute tasks in priority order (Red/Green/Refactor where
   testing applies)
6. **Review** -- Verify against spec, check quality gates, commit

Each phase produces a PHR. Significant architecture decisions during Plan phase
trigger an ADR suggestion.

## Governance

- This Constitution supersedes all other development practices where conflicts arise
- Amendments require:
  1. A documented proposal (PHR or ADR as appropriate)
  2. Explicit user approval
  3. A migration plan if existing work is affected
- Versioning follows Semantic Versioning (MAJOR.MINOR.PATCH):
  - MAJOR: Backward-incompatible principle removals or redefinitions
  - MINOR: New principles or materially expanded guidance
  - PATCH: Clarifications, wording fixes, non-semantic refinements
- All PRs and implementation work MUST verify compliance with this constitution
- Complexity MUST be justified -- the simplest approach that meets requirements
  is preferred
- Compliance review occurs at the start of each new feature via the Constitution
  Check in the plan

**Version**: 1.0.0 | **Ratified**: 2026-07-17 | **Last Amended**: 2026-07-17
