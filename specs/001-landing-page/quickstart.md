# Quickstart: Velocity Landing Page

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No build tools, no package managers, no server required

## View the Page

Since the landing page is pure HTML + CSS with zero dependencies, simply open
the HTML file directly in any browser:

```bash
# Open directly (Windows)
start class-1/index.html

# Open directly (macOS)
open class-1/index.html

# Open directly (Linux)
xdg-open class-1/index.html
```

Or serve with any static file server for local development:

```bash
# Using Python (built-in)
python -m http.server -d class-1 8000
# Then visit http://localhost:8000

# Using VS Code Live Server extension
# Right-click class-1/index.html → Open with Live Server
```

## File Structure

```
class-1/
├── index.html    # All page content and structure
└── styles.css    # All styles, animations, and theming
```

## Development Workflow

1. Edit `class-1/index.html` for content/structure changes
2. Edit `class-1/styles.css` for visual/style changes
3. Refresh the browser to see changes (no build step)

## Verification Checklist

- [ ] Page renders without errors in Chrome, Firefox, Safari, Edge
- [ ] Responsive at 360px, 768px, 1024px, 1920px viewports
- [ ] Navbar sticky with glass-morphism effect
- [ ] All nav links smooth-scroll to correct sections
- [ ] Hamburger menu works at 768px and below
- [ ] Hero gradient orbs animate on load
- [ ] Feature cards have hover lift effect
- [ ] Stats display 4 metrics with labels
- [ ] Testimonials display 3 cards with border accent
- [ ] CTA banner and footer render correctly
- [ ] No JavaScript errors (should be zero JS)
- [ ] No external network requests
