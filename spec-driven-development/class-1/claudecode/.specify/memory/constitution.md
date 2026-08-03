<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned template) → 1.0.0
Bump rationale: Initial ratification of the project constitution (MAJOR baseline).

Modified principles: N/A (first adoption)
Added principles:
  - I. Spec-Driven & Traceable
  - II. Semantic, Accessible HTML
  - III. Design-Token-Driven, Responsive CSS
  - IV. Progressive Enhancement
  - V. Smallest Viable Change, Zero Build Bloat
Added sections:
  - Technology & Quality Standards
  - Development Workflow

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gate is generic; aligns as-is
  ✅ .specify/templates/spec-template.md — no principle conflict; aligns as-is
  ✅ .specify/templates/tasks-template.md — no principle conflict; aligns as-is
  ✅ CLAUDE.md — PHR/ADR guidance consistent with Principle I and Governance

Follow-up TODOs: none
-->

# Nebula Landing Page Constitution
<!-- Static marketing site for a fictional AI SaaS product, built with HTML + CSS -->

## Core Principles

### I. Spec-Driven & Traceable
Every material change flows through the Spec-Driven Development workflow: intent is captured
before code. A Prompt History Record (PHR) MUST be created for every user request under
`history/prompts/`, and architecturally significant decisions MUST be surfaced as ADR
suggestions (never auto-created). Rationale: traceability from intent → artifact is the core
product promise; it makes the work reviewable, teachable, and reproducible.

### II. Semantic, Accessible HTML
Markup MUST use semantic landmarks (`header`, `nav`, `main`, `section`, `footer`) and correct
heading order. All interactive and media elements MUST be keyboard-focusable with visible focus
states and carry accessible names (`alt`, `aria-label`). Text MUST meet WCAG 2.1 AA contrast.
Rationale: a landing page that excludes users or assistive tech fails its primary job — reach.

### III. Design-Token-Driven, Responsive CSS
Colors, spacing, radii, shadows, and gradients MUST be defined once as `:root` custom properties
and referenced everywhere — no scattered magic values. Layout MUST be mobile-first using CSS
Grid/Flexbox and fluid `clamp()` sizing, verified from ~360px to desktop with no horizontal
overflow. Rationale: tokens keep the visual system coherent and re-themeable; responsiveness is
non-negotiable for marketing reach.

### IV. Progressive Enhancement
The page MUST be fully legible and navigable with CSS alone; JavaScript is an enhancement, not a
dependency. Any JS MUST degrade gracefully when disabled. All motion MUST respect
`prefers-reduced-motion`. Rationale: resilience and inclusivity — content and core navigation
never depend on scripts executing.

### V. Smallest Viable Change, Zero Build Bloat
Prefer the smallest diff that satisfies intent; do not refactor unrelated code. The project MUST
remain runnable by opening `index.html` directly — no build step, no framework, no package
manager required. New third-party dependencies are prohibited unless justified in an ADR.
Rationale: a static landing page should stay simple, portable, and instantly inspectable.

## Technology & Quality Standards

- **Stack**: Hand-authored HTML5, CSS3, and optional vanilla JS only. No frameworks, bundlers,
  or preprocessors.
- **Structure**: Separate `index.html` and `styles.css`; keep any JS minimal and inline or in a
  single small file.
- **Assets**: Prefer inline SVG for icons/marks; embed or self-host fonts, with a system-font
  fallback so the page works offline and under strict CSP.
- **Secrets**: Never hardcode secrets or tokens. Placeholder brand/copy MUST be clearly swappable.
- **Definition of Done**: renders correctly across breakpoints; no console errors; keyboard and
  reduced-motion paths verified; contrast checked; links focusable.

## Development Workflow

- **Clarify first**: resolve ambiguous requirements with targeted questions before building.
- **Cite precisely**: reference existing code with `start:end:path`; propose new code in fenced
  blocks.
- **Verify visually**: open the page in a browser (or a static server) and confirm each section,
  interaction, and responsive breakpoint before declaring completion.
- **Record after acting**: create the PHR once the request is fulfilled; suggest an ADR when a
  decision meets the impact/alternatives/scope significance test.

## Governance

This constitution supersedes ad-hoc practices for this project. Amendments MUST be made by
editing this file, accompanied by a version bump and an updated Sync Impact Report. Versioning
follows semantic rules: MAJOR for backward-incompatible principle removals or redefinitions,
MINOR for a new principle or materially expanded guidance, PATCH for clarifications and wording.
Every change MUST verify compliance with these principles; unavoidable violations MUST be
justified in the plan's Complexity Tracking or an ADR. Use `CLAUDE.md` for runtime agent
guidance and the `.specify/` templates for artifact structure.

**Version**: 1.0.0 | **Ratified**: 2026-07-17 | **Last Amended**: 2026-07-17
