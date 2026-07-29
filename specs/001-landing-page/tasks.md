---

description: "Task list for Velocity landing page implementation"
---

# Tasks: Velocity Landing Page

**Input**: Design documents from `/specs/001-landing-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: No automated tests requested in the spec. All testing is manual visual
verification across viewports. See [quickstart.md](quickstart.md) for the
verification checklist.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Source**: `class-1/index.html` (all HTML structure), `class-1/styles.css` (all styles)
- No subdirectories needed. Single HTML + single CSS at class-1/ root.
- Adjust paths based on plan.md structure.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create class-1/index.html with HTML5 doctype, lang attribute, viewport meta, title, and link to styles.css
- [x] T002 [P] Define all CSS Custom Properties in class-1/styles.css `:root` block (colors, typography, layout, glass-morphism, transitions per research.md)
- [x] T003 [P] Set up base layout and typography in class-1/styles.css (body, container max-width 1100px, section padding, system font stack, mobile-first responsive base)

**Checkpoint**: Project scaffold ready - CSS variables and base layout established

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**No foundational phase needed.** This is a static landing page with no backend,
no database, no authentication, and no API. The Setup phase (CSS variables + base
layout) is the only prerequisite for user story implementation.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Hero Section & First Impression (Priority: P1) 🎯 MVP

**Goal**: First-time visitors see a full-viewport hero with tagline, subtitle, CTA
button, and animated gradient orbs on a dark gradient background.

**Independent Test**: Load the page and confirm the tagline "Build Faster. Ship Smarter."
is visible, the CTA button renders with hover effect, and background gradient orbs
animate smoothly on a dark backdrop.

### Implementation for User Story 1

- [x] T004 [P] [US1] Add Hero section HTML in class-1/index.html (full-viewport section with tagline "Build Faster. Ship Smarter.", subtitle, CTA button, and floating orb divs)
- [x] T005 [P] [US1] Add Hero section CSS in class-1/styles.css (min-height: 100vh, dark gradient background, centered content, responsive text sizes)
- [x] T006 [US1] Add floating gradient orbs animation in class-1/styles.css (@keyframes float with translate/scale transforms, positioned gradient blob divs)
- [x] T007 [P] [US1] Add CTA button hover effect in class-1/styles.css (gradient background, scale/color transition, smooth 0.3s ease)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Sticky Navigation Bar (Priority: P1)

**Goal**: Users can navigate the page via a fixed glass-morphism navbar with smooth
scrolling links. On mobile (768px), links collapse behind a hamburger toggle.

**Independent Test**: Scroll the page and confirm the navbar stays fixed at the top
with backdrop blur. Click each nav link to verify smooth scroll to the correct
section. Resize to 768px and confirm hamburger toggle works.

### Implementation for User Story 2

- [x] T008 [US2] Add Navbar HTML in class-1/index.html (hidden checkbox, label/hamburger icon, nav links list with section IDs: #hero, #features, #stats, #testimonials, #cta)
- [x] T009 [US2] Add Navbar CSS in class-1/styles.css (position: fixed, backdrop-filter blur, translucent glass background, link hover styles)
- [x] T010 [US2] Add responsive hamburger toggle CSS in class-1/styles.css (checkbox hack via :checked + sibling selector, hide/show nav-links at 768px breakpoint)
- [x] T011 [P] [US2] Add smooth scroll behavior in class-1/styles.css (scroll-behavior: smooth on html element)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Features Section (Priority: P2)

**Goal**: Visitors see three feature cards in a responsive 3-column grid with icons,
titles, descriptions, and hover lift effect.

**Independent Test**: Scroll to the features section and confirm three cards display
in a grid. Hover over each card to verify the lift animation. Resize to 768px to
confirm cards stack to single column.

### Implementation for User Story 3

- [x] T012 [US3] Add Features section HTML in class-1/index.html (section heading, 3 feature cards with icon, title, description from data-model.md)
- [x] T013 [US3] Add Features section CSS in class-1/styles.css (3-column grid via grid-template-columns, card styling, section background color)
- [x] T014 [US3] Add card hover lift effect in class-1/styles.css (transform: translateY with 0.3s ease transition)
- [x] T015 [US3] Add responsive Features grid CSS in class-1/styles.css (single column at 768px breakpoint via @media query)

**Checkpoint**: At this point, User Stories 1-3 should all work independently

---

## Phase 6: User Story 4 - Stats & Social Proof (Priority: P2)

**Goal**: Visitors see four key metrics (500+ Clients, 99.9% Uptime, 10M+ Requests, 24/7 Support) in a responsive layout.

**Independent Test**: Scroll to the stats section and confirm four metrics display with large values and descriptive labels. Resize to 768px to verify responsive stacking.

### Implementation for User Story 4

- [x] T016 [US4] Add Stats section HTML in class-1/index.html (section heading, 4 stat items with value and label from data-model.md)
- [x] T017 [US4] Add Stats section CSS in class-1/styles.css (flexbox/grid horizontal layout, large stat values, responsive 2-column or single-column at 768px)

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Testimonials (Priority: P3)

**Goal**: Visitors read three customer quote cards with subtle left border accent and customer details.

**Independent Test**: Scroll to the testimonials section and confirm three quote cards display with border accent, quote text, customer name, and role.

### Implementation for User Story 5

- [x] T018 [US5] Add Testimonials section HTML in class-1/index.html (section heading, 3 testimonial cards with quote, name, role from data-model.md)
- [x] T019 [US5] Add Testimonials section CSS in class-1/styles.css (card layout, left border accent in accent gradient color, responsive grid)

**Checkpoint**: At this point, User Stories 1-5 should all work independently

---

## Phase 8: User Story 6 - CTA Banner & Footer (Priority: P3)

**Goal**: Visitors see a final call-to-action banner and a dark footer with quick links, social icons, and copyright.

**Independent Test**: Scroll to the bottom and confirm the CTA banner displays a contrasting background with headline and button. Verify the footer has dark background, links, social icons, and copyright text.

### Implementation for User Story 6

- [x] T020 [P] [US6] Add CTA Banner HTML in class-1/index.html (contrasting section with headline, supporting text, CTA button)
- [x] T021 [P] [US6] Add CTA Banner CSS in class-1/styles.css (gradient or accent background, centered text, button styling)
- [x] T022 [US6] Add Footer HTML in class-1/index.html (Velocity brand/logo, Product/Company/Legal link groups, social icons, copyright)
- [x] T023 [US6] Add Footer CSS in class-1/styles.css (dark background, link group layout, social icon hover effects, responsive)

**Checkpoint**: At this point, all user stories should be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T024 [P] Add fade-in section scroll animations in class-1/styles.css (fadeInUp @keyframes, staggered animation-delay per section)
- [x] T025 [P] Add ultra-wide screen constraints in class-1/styles.css (max-width centered container) and small screen fallbacks (<360px)
- [x] T026 [P] Add prefers-reduced-motion support in class-1/styles.css (@media query to disable orb and section animations)
- [x] T027 Run quickstart.md verification checklist across 360px, 768px, 1024px, 1920px viewports in Chrome, Firefox, Safari, Edge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: No blocking prerequisites - ready to proceed
- **User Stories (Phase 3+)**: All depend on Setup phase completion
  - US1 (Hero) and US2 (Navbar) are independent of each other
  - US3-US6 add sections below existing content, no structural dependency
  - Best built top-to-bottom for visual continuity
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Hero section - no dependencies on other stories
- **User Story 2 (P1)**: Navbar - no dependencies on other stories (can be built alongside US1)
- **User Story 3 (P2)**: Features - no dependencies on other stories
- **User Story 4 (P2)**: Stats - no dependencies on other stories
- **User Story 5 (P3)**: Testimonials - no dependencies on other stories
- **User Story 6 (P3)**: CTA/Footer - no dependencies on other stories

### Within Each User Story

- HTML structure before CSS styling
- Core content before animations/hover effects
- Desktop layout before responsive overrides
- Story complete before moving to next priority

### Parallel Opportunities

- T002 and T003 (Setup) can run in parallel (different files, independent concerns)
- T004 and T005 (US1 HTML + CSS) can run in parallel
- T007 (US1 CTA hover) is independent and can run in parallel with T006
- T011 (smooth scroll) can run in parallel with other US2 tasks
- T020 and T021 (CTA HTML + CSS) can run in parallel
- All Polish tasks marked [P] can run in parallel
- Different user stories can be worked on by different developers

---

## Parallel Example: User Story 1

```bash
# Launch all [P] tasks for User Story 1 together:
Task: "T004 [P] [US1] Add Hero section HTML in class-1/index.html"
Task: "T005 [P] [US1] Add Hero section CSS in class-1/styles.css"

# After T004+T005 complete:
Task: "T006 [US1] Add floating gradient orbs animation in class-1/styles.css"
Task: "T007 [P] [US1] Add CTA button hover effect in class-1/styles.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 3: User Story 1 (T004-T007)
3. **STOP and VALIDATE**: Load class-1/index.html and verify hero section
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup (T001-T003) → Base scaffold ready
2. Add US1 Hero (T004-T007) → Test independently → Deploy (MVP!)
3. Add US2 Navbar (T008-T011) → Test independently → Deploy
4. Add US3 Features (T012-T015) → Test independently → Deploy
5. Add US4 Stats (T016-T017) → Test independently → Deploy
6. Add US5 Testimonials (T018-T019) → Test independently → Deploy
7. Add US6 CTA/Footer (T020-T023) → Test independently → Deploy
8. Add Polish (T024-T027) → Final validation

### Parallel Team Strategy

With multiple developers:

1. One developer completes Setup (T001-T003)
2. Developer A: US1 Hero (T004-T007)
3. Developer B: US2 Navbar (T008-T011) - can run in parallel with US1
4. Remaining stories added sequentially or in parallel based on team size
5. All stories are independent, enabling true parallel execution

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each logical group or story completion
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Total tasks: 27 (T001-T027)
