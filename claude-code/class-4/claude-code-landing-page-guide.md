# 🚀 Build the ABC Landing Page with Claude Code
### A Step-by-Step Prompting Guide for First-Time Users

> **How this works:** Each step is a self-contained prompt you paste into Claude Code. Run one step, review the result, then move to the next. By the end you'll have a complete, pixel-faithful landing page.

---

## Before You Start

Open your terminal and run:

```bash
claude
```

Then paste the prompts below one at a time.

---

## Step 1 — Project Setup & Design Tokens

**Prompt:**
```
Create a single-file landing page called `index.html` for a software house called "ABC".

Set up the following CSS custom properties inside :root and a base reset:

Colors:
  --navy-900: #0b1b39
  --navy-800: #10254d
  --navy-700: #173063
  --blue-600: #2151c9
  --blue-500: #3266e3
  --ink: #101728
  --slate: #475067
  --slate-light: #6b7488
  --line: #e4e7ee
  --paper: #ffffff
  --mist: #f6f7fb
  --mist-2: #eef1f7

Typography:
  --serif: "Source Serif 4", Georgia, serif
  --sans: "Libre Franklin", system-ui, sans-serif

Add Google Fonts link for both: Source Serif 4 (weights 400,500,600, optical size 8–60) and Libre Franklin (weights 400,500,600,700).

Base styles:
- box-sizing: border-box on everything
- smooth scroll on html
- body uses --sans, color --ink, background --paper, antialiased
- .wrap class: max-width 1180px, centered, padding 0 40px
- .eyebrow class: 12px, letter-spacing 0.18em, uppercase, weight 600, color --blue-600

Leave the <body> empty for now.
```

---

## Step 2 — Sticky Navbar

**Prompt:**
```
Add a sticky navbar to the <body> of index.html.

Structure:
- <header> wrapping a <div class="wrap nav">
- Left: brand logo — a small 34×34px rounded square (border-radius 7px) with a navy-to-blue gradient (150deg, --navy-800 to --blue-600), showing the letter "A" in white bold 15px — followed by the text "ABC" in navy-900, bold, 20px
- Center: nav links — Services, Approach, Clients, Contact (all anchor tags)
- Right: a CTA button "Book a consultation →"

Styles:
- Header: sticky top-0, z-index 50, white background at 86% opacity, backdrop-filter blur(12px) saturate(180%), bottom border 1px solid --line
- Nav height: 74px, flex, space-between, align-items center
- Nav links: font-size 15px, weight 500, color --slate, gap 38px, hover → --navy-900
- .btn base: font weight 600, 15px, padding 11px 22px, border-radius 8px, cursor pointer, transition on transform/bg/shadow, inline-flex with gap 9px
- .btn-primary: background --navy-800, white text, subtle shadow; hover → --navy-900, translateY(-1px), larger shadow
- .btn-ghost: transparent bg, --navy-900 text, border --line; hover → mist background

Hide nav links on screens ≤900px.
```

---

## Step 3 — Hero Section (Copy Side)

**Prompt:**
```
Add a Hero section after the header in index.html.

The hero uses a two-column CSS grid (1.05fr 0.95fr, gap 60px). Left column is the copy, right column will be added in the next step.

Left column content:
1. An eyebrow label: "Software house · Est. 2015"
2. An <h1> (Source Serif 4, weight 500, 60px, line-height 1.04, letter-spacing -0.018em, color --navy-900): 
   "We build the software that <em>moves your business</em> forward."
   The <em> should be italic, color --blue-600, not oblique.
3. A lead paragraph (19px, color --slate, max-width 34ch, margin-top 26px):
   "ABC partners with leadership teams to ship reliable web platforms and agentic AI systems — engineered to scale."
4. Two CTA buttons side by side (margin-top 36px, gap 14px):
   - Primary: "Start a project →"
   - Ghost: "Explore services"
5. A trust strip (margin-top 46px, flex, gap 30px, align center) with three stats separated by thin 1px vertical dividers (height 40px, color --line):
   - "120+" / "Products shipped"
   - "10 yrs" / "In production"
   - "98%" / "Client retention"
   Numbers use Source Serif 4, 30px, weight 600. Labels are 13px, --slate-light.

Hero section background: radial gradient (blue tint top-right) over a subtle linear gradient from #fbfcfe to #f6f7fb. Bottom border 1px solid --line. Padding-top 96px, padding-bottom 92px.
```

---

## Step 4 — Hero Visual (Right Panel)

**Prompt:**
```
Add the right-column visual to the Hero section in index.html.

It's a mock "product dashboard" panel with these styles:
- Outer .panel: border-radius 14px, 1px solid --line border, white background, box-shadow 0 30px 60px -28px rgba(16,37,77,.35), overflow hidden

Panel structure:
1. A top bar (.panel-top): mist background, 14px 16px padding, bottom border, containing three grey circles (10×10px, border-radius 50%, color #cdd3e0) spaced 7px apart — like macOS window controls
2. A body (.panel-body): padding 26px, CSS grid gap 16px, diagonal stripe background using repeating-linear-gradient(135deg, #fafbfd 11px, #f3f5fa 12px)

Inside the panel body:
- One tall card (.ph-card) containing: a 38×38px chip (rounded square, navy-to-blue gradient), then two grey placeholder lines (height 11px, border-radius 6px, mist-2 color) at 70% and 90% width
- A two-column row with two smaller cards, each with two placeholder lines
- A centered monospace label in --slate-light at 11px: "[ product / dashboard screenshot ]"

Card style: white bg, 1px --line border, border-radius 10px, padding 18px, subtle box-shadow.
```

---

## Step 5 — Client Logo Strip

**Prompt:**
```
After the hero section in index.html, add a client logo strip section.

Structure:
- Section with class "strip", id "clients"
- Inside .wrap: flex row, space-between, align-center, flex-wrap, gap 30px
- Left: small label "Trusted by teams at" (12px, uppercase, letter-spacing 0.16em, --slate-light, weight 600)
- Right: five ghost logo names in a flex row with gap 46px:
  Northbank · Meridian · Vesta Health · Atlas Logistics · Orbit

Logo ghost style: Source Serif 4, weight 600, 21px, color #aab1c2, letter-spacing 0.01em.

Section style: padding 34px 0, bottom border 1px solid --line, white background.
```

---

## Step 6 — Services Section

**Prompt:**
```
Add a Services section after the client strip in index.html, id="services".

Section padding: 104px 0, white background.

Section header (.sec-head, max-width 640px):
- Eyebrow: "What we do"
- h2 (Source Serif 4, weight 500, 42px, line-height 1.1, letter-spacing -0.015em, --navy-900, margin-top 16px): "Two focused practices, engineered for outcomes."
- p (18px, --slate, margin-top 18px): "We keep our offering deliberately narrow so we can go deep. Every engagement is led by senior engineers and measured against your business goals."

Below it, a 2-column grid (.svc-grid, gap 28px, margin-top 56px) with two service cards:

Card base (.svc): 1px --line border, border-radius 16px, padding 40px, white bg. On hover: translateY(-4px), larger shadow, darker border. Also on hover: reveal a 3px top gradient bar (navy to blue) using a ::before pseudo-element.

Card 1 — Web Development:
- Icon box (52×52px, border-radius 12px, mist bg, --line border): use an SVG code/brackets icon
- h3 (Source Serif 4, 25px, weight 600): "Web Development"
- p: "High-performance web platforms and internal tools, built on modern, maintainable foundations your team can own for years."
- Bulleted list (top border, gap 11px): "Custom web apps & SaaS platforms" · "API design & system integration" · "Cloud architecture & DevOps"
  Each bullet has a small circle with a blue checkmark SVG.

Card 2 — Agentic AI:
- Icon box: use an SVG robot/agent icon
- h3: "Agentic AI"
- p: "Production-grade AI agents and automations that take real work off your team — designed, evaluated, and deployed responsibly."
- List: "Autonomous agents & workflows" · "RAG & knowledge integrations" · "Evaluation, guardrails & monitoring"
```

---

## Step 7 — CTA Band

**Prompt:**
```
Add a dark CTA band section after Services in index.html, id="contact".

Background: --navy-900 (very dark navy). Add a radial blue glow in the top-right corner using a ::after pseudo-element (rgba(50,102,227,.32)).

Inside .wrap (.band-inner): flex row, space-between, align-center, flex-wrap, gap 40px, padding-block 80px.

Left side:
- h2 (Source Serif 4, weight 500, 38px, white, max-width 18ch): "Let's talk about what you're building."
- p (margin-top 14px, color #aeb9d4, 17px, max-width 42ch): "A 30-minute call with a senior engineer — no sales pitch, just a clear view of what's possible."

Right side (two buttons, flex, gap 14px):
- Light button: white bg, --navy-900 text — "Book a consultation →"
- Outline button: transparent bg, white text, border rgba(255,255,255,.3), hover → white border — "View our work"
```

---

## Step 8 — Footer

**Prompt:**
```
Add a footer to index.html after the main content.

Background: --navy-900, top border 1px solid rgba(255,255,255,.08), white text.

Footer grid (.foot): 4 columns (1.4fr 1fr 1fr 1fr), gap 40px, padding 72px 0 44px.

Column 1 — Brand:
- Same brand logo as the navbar but in white
- Tagline below (color #9aa6c2, 15px, max-width 30ch): "A software house building reliable web platforms and agentic AI for leadership teams."

Column 2 — Services (h4 label + links):
h4 style: 12px, uppercase, letter-spacing 0.16em, color #7d89a8, weight 600, margin-bottom 18px.
Links (color #c2cadd, 15px, margin-bottom 12px, hover → white): Web Development · Agentic AI · Cloud & DevOps · Consulting

Column 3 — Company:
Links: Approach · Clients · Careers · Contact

Column 4 — Get in touch:
Links: hello@abc.dev · +1 (000) 000-0000 · 123 Market Street, Suite 400

Below the grid, a footer bottom bar (.foot-bottom):
- Left: "© 2026 ABC Software House. All rights reserved." in #7d89a8, 14px
- Right: three social icon buttons (36×36px, border-radius 8px, border rgba(255,255,255,.14), color #c2cadd, hover → white) for LinkedIn, X (Twitter), and GitHub using inline SVG icons.

Top border on the bar: 1px solid rgba(255,255,255,.1), padding 24px 0 30px.
```

---

## Step 9 — Responsive Polish

**Prompt:**
```
Add responsive breakpoints to index.html:

At max-width 900px:
- .wrap padding reduces to 0 24px
- Hide .nav-links (display: none)
- .hero-grid becomes single column (grid-template-columns: 1fr), gap 48px, padding-top 64px, padding-bottom 64px
- h1 font-size reduces to 44px
- .svc-grid becomes single column
- .sec-head h2 reduces to 34px
- .band-inner padding-block reduces to 56px
- .foot grid becomes 2 columns (1fr 1fr), gap 34px

At max-width 560px:
- .foot becomes single column (1fr)
- .trust allows flex-wrap with gap 20px
- .hero-cta becomes column direction, align-items stretch (full-width buttons)
```

---



## Step 10 — Final Review & QA

**Prompt:**
```
Review index.html and fix any issues:

1. Make sure all section anchor IDs are correct: #services, #clients, #contact (navbar links should scroll to these)
2. Confirm the hero h1 <em> tag renders in italic blue (--blue-600), not just italic
3. Ensure the .panel in the hero visual has the diagonal stripe background on .panel-body only
4. Double-check the footer brand mark uses a white-text "A" on the gradient square (same as the header)
5. Verify the CTA band ::after radial glow doesn't block pointer events (add pointer-events: none)
6. Confirm smooth scroll is on the <html> element

After fixes, open index.html in a browser and confirm:
- Navbar sticks on scroll
- All section links work
- Both service cards have the hover top-bar animation
- Page looks correct on a narrow mobile viewport
```

---

## 🎉 Done!

Your `index.html` now matches the ABC landing page design. Here's a summary of what was built:

| Step | Section | Key Technique |
|------|---------|---------------|
| 1 | Design tokens | CSS custom properties, Google Fonts |
| 2 | Navbar | Sticky + glassmorphism backdrop-filter |
| 3 | Hero copy | CSS Grid, text-wrap: balance |
| 4 | Hero visual | Decorative UI panel with pseudo-elements |
| 5 | Client strip | Flex logo row |
| 6 | Services | Card grid with ::before hover bar |
| 7 | CTA band | Dark section with radial glow overlay |
| 8 | Footer | Multi-column grid, social icons |
| 9 | Responsive | Two-breakpoint mobile layout |
| 10 | QA | Anchor links, pointer-events, scroll |

> **Tip:** If Claude Code gets something wrong in a step, just describe what looks off: *"The hero h1 is too small and not italic blue"* — Claude Code will fix it without redoing the whole file.
