# Research: Velocity Landing Page

## Design Decisions

### 1. CSS Custom Properties Theming

**Decision**: Define all theme values in `:root` as CSS Custom Properties.

**Rationale**: Enables single-source-of-truth for colors, spacing, fonts, and
animation values. Changes propagate globally without search-and-replace.

**Variables defined**:

```css
:root {
  /* Dark theme */
  --color-bg-primary: #0a0a0f;
  --color-bg-secondary: #16162a;
  --color-bg-card: #1e1e3a;
  --color-text-primary: #ffffff;
  --color-text-secondary: #b0b0c8;
  --color-accent-start: #6c63ff;
  --color-accent-end: #ff6584;
  --color-border: rgba(255, 255, 255, 0.08);

  /* Layout */
  --max-width: 1100px;
  --section-padding: 5rem 1.5rem;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --font-size-hero: clamp(2.5rem, 1.5rem + 4vw, 4.5rem);
  --font-size-h2: clamp(1.75rem, 1.25rem + 2vw, 2.5rem);

  /* Glass-morphism */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: 12px;

  /* Transitions */
  --transition-base: 0.3s ease;
  --transition-smooth: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Alternatives considered**:
- SCSS variables: Rejected — requires build tool, violates Pure Web Standards
- Inline values: Rejected — harder to maintain and theme

---

### 2. Glass-morphism Navbar

**Decision**: Use `backdrop-filter: blur()` with a semi-transparent background.

**Rationale**: Achieves the frosted-glass look without JavaScript. Supported in
all modern browsers (Chrome 76+, Firefox 103+, Safari 14+, Edge 79+).

```css
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
}
```

**Fallback**: On browsers without `backdrop-filter` support, the navbar appears
as a solid dark bar (acceptable degradation).

---

### 3. CSS Checkbox Hack for Nav Toggle

**Decision**: Use the hidden checkbox + `:checked` pseudo-class + `+` sibling
selector pattern for responsive hamburger menu.

**Rationale**: Pure CSS solution, no JavaScript required. The checkbox is hidden
via `opacity: 0` or `position: absolute; left: -9999px`. The hamburger icon is
a `<label>` element that toggles the checkbox.

```html
<input type="checkbox" id="nav-toggle" hidden>
<label for="nav-toggle" class="hamburger">☰</label>
<nav class="nav-links">...</nav>
```

```css
.nav-links { display: none; }
#nav-toggle:checked ~ .nav-links { display: flex; }
@media (min-width: 769px) { .nav-links { display: flex; } }
```

**Alternatives considered**:
- JavaScript toggle: Rejected — violates Zero JS constraint
- :target hack: Rejected — incompatible with smooth scroll and hash navigation

---

### 4. Floating Gradient Orbs Animation

**Decision**: Use `@keyframes` with `translate()` and `scale()` transforms on
absolutely-positioned gradient blobs in the hero.

**Rationale**: CSS transforms are GPU-accelerated, producing smooth 60fps
animations without jank. Blobs use `border-radius: 50%` with `filter: blur()`
for the soft glow effect.

```css
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}
```

**Accessibility**: `@media (prefers-reduced-motion: reduce)` disables orb
animations for users who prefer reduced motion.

---

### 5. Responsive Breakpoint Strategy

**Decision**: Mobile-first base styles with a single 768px breakpoint for
tablet and desktop layouts.

**Rationale**: Minimum complexity. The page content is simple enough that a
single breakpoint handles all larger viewports adequately. Content is
max-width constrained to 1100px on wide screens.

```css
/* Mobile base (default) */
.grid-3 { display: grid; gap: 1.5rem; }

/* Tablet+ */
@media (min-width: 768px) {
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(4, 1fr); }
}
```

**Fluid typography**: Using `clamp()` for all heading and body font sizes
eliminates the need for multiple breakpoint font adjustments.

---

### 6. Fade-in Scroll Animations

**Decision**: Use CSS `@keyframes fadeInUp` combined with a custom scroll-
driven approach or CSS `animation` triggered by `@scroll-timeline`.

**Rationale**: Pure CSS scroll-based animations are experimental. For reliable
cross-browser support, sections will use a CSS animation with `animation-play-state:
paused` by default, toggled to `running` via the `:target` pseudo-class or an
intersection-based approach.

For this project, sections will have a simple fade-in animation that plays on
page load with staggered delays — since it's a single-page landing, all content
exists in DOM and the fade-in triggers naturally as the user scrolls.

**Fallback**: If the animation depends on scroll position (unreliable across
browsers), sections default to visible with no animation.

---

### 7. Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Page background | Dark | `#0a0a0f` |
| Section background | Darker | `#16162a` |
| Card background | Elevated dark | `#1e1e3a` |
| Primary text | White | `#ffffff` |
| Secondary text | Muted white | `#b0b0c8` |
| Accent (start) | Purple | `#6c63ff` |
| Accent (end) | Pink | `#ff6584` |
| Border/divider | Subtle white | `rgba(255,255,255,0.08)` |
| Glass bg | Translucent | `rgba(255,255,255,0.05)` |

Accent gradient: `linear-gradient(135deg, #6c63ff, #ff6584)`
