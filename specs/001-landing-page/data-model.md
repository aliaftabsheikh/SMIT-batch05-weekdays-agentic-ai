# Data Model: Velocity Landing Page

**Note**: This is a static landing page with no backend, no database, and no
API. The "data model" describes the content entities rendered in HTML/CSS.

## Entities

### Section

A distinct visual block of the landing page.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Anchor identifier for nav scrolling (e.g., "hero", "features") |
| title | string | Section heading text |
| subtitle | string | Supporting text below heading |
| background | CSS value | Background color or gradient |

**Sections defined**: Hero, Features, Stats, Testimonials, CTA, Footer

---

### FeatureCard

A single card in the 3-column Features grid.

| Field | Type | Description |
|-------|------|-------------|
| icon | Unicode/CSS | Visual icon (e.g., ⚡, 🔒, 🚀 or CSS-drawn) |
| title | string | Feature name (e.g., "Lightning Fast") |
| description | string | 1-2 sentence feature explanation |

**Cards**:

| # | Icon | Title | Description |
|---|------|-------|-------------|
| 1 | ⚡ | Lightning Fast | Optimized for speed. Your users will never wait. |
| 2 | 🔒 | Secure by Design | Enterprise-grade security baked into every layer. |
| 3 | 🚀 | Developer First | APIs, SDKs, and tools your team will love. |

---

### StatMetric

A single metric in the Stats section.

| Field | Type | Description |
|-------|------|-------------|
| value | string | Large displayed number/metric (e.g., "500+") |
| label | string | Descriptive label below the value |

**Metrics**:

| # | Value | Label |
|---|-------|-------|
| 1 | 500+ | Clients Served |
| 2 | 99.9% | Uptime Guarantee |
| 3 | 10M+ | Requests Processed |
| 4 | 24/7 | Expert Support |

---

### Testimonial

A single quote card in the Testimonials section.

| Field | Type | Description |
|-------|------|-------------|
| quote | string | The customer testimonial text |
| name | string | Customer full name |
| role | string | Customer job title and company |

**Testimonials**:

| # | Quote | Name | Role |
|---|-------|------|------|
| 1 | "Velocity transformed our deployment pipeline. We ship 3x faster now." | Sarah Chen | CTO, TechFlow Inc. |
| 2 | "The platform is incredibly intuitive. Our team adopted it in days." | Marcus Johnson | Engineering Lead, DataPulse |
| 3 | "Enterprise-grade reliability without the enterprise complexity." | Priya Patel | VP of Engineering, CloudScale |

---

### NavLink

A single navigation link in the Navbar.

| Field | Type | Description |
|-------|------|-------------|
| label | string | Link text displayed in navbar |
| target | string | Section ID to scroll to (e.g., "#features") |

**Links**: Hero (#hero), Features (#features), Stats (#stats), Testimonials (#testimonials), Contact (#cta)

---

### FooterLink

A link in the footer grouped by category.

| Field | Type | Description |
|-------|------|-------------|
| category | string | Group name (Product, Company, Legal) |
| label | string | Link text |
| href | URL string | Link destination |

**Links**:
- **Product**: Features, Pricing, API
- **Company**: About, Blog, Careers
- **Legal**: Privacy, Terms, Cookies

---

### SocialIcon

A social media icon in the footer.

| Field | Type | Description |
|-------|------|-------------|
| platform | string | Social platform name (Twitter, GitHub, LinkedIn) |
| icon | Unicode | Symbol displayed |

**Icons**: Twitter (𝕏), GitHub, LinkedIn
