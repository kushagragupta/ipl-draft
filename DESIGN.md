# Design System: Team Squads

## Design Theme Configuration
- **Color Mode:** Dark
- **Overall Font:** Space Grotesk
- **Headline Font:** Space Grotesk
- **Body Font:** Manrope
- **Label Font:** Lexend
- **Primary Custom Color:** #FFD700
- **Overall Roundness:** ROUND_FOUR
- **Color Variant:** VIBRANT

---

## Color Palette

| Token Name | Hex Code |
| :--- | :--- |
| **background** | `#0c0e12` |
| **primary** | `#ffe792` |
| **primary_container** | `#ffd709` |
| **secondary** | `#72a2fd` |
| **secondary_container** | `#004ba0` |
| **tertiary** | `#ff7163` |
| **tertiary_container** | `#f6322d` |
| **surface** | `#0c0e12` |
| **surface_container_low** | `#111318` |
| **surface_container_highest** | `#23262c` |
| **surface_variant** | `#23262c` |
| **error** | `#ff7351` |
| **error_container** | `#b92902` |

*(Note: Other detailed system variants of primary/secondary/tertiary colors follow Material 3 schema for Dark mode)*

---

# Design System Document: The Stadium Lights Protocol

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Arena"**

This design system moves beyond the static "fantasy sports spreadsheet" and enters the realm of high-octane broadcast media. The goal is to capture the electrifying atmosphere of a night match under the stadium lights. We achieve this through **Kinetic Layering**—an aesthetic characterized by deep, atmospheric blacks, high-contrast neon accents, and intentional asymmetry that mimics the movement of a cricket ball in play.

Rather than a flat grid, the UI is treated as a 3D space. Components should feel like they are floating above a dark, vast field. We break the "template" look by using overlapping player imagery, aggressive typography scales, and "NBA-style" draft boards that prioritize motion and impact over traditional data density.

---

## 2. Colors & The "No-Line" Rule
The palette is rooted in a deep, nocturnal base (`background: #0c0e12`) to allow team-specific accent colors to vibrate with maximum intensity.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. 
*   **Alternative:** Use background color shifts. A `surface-container-low` section should sit on a `surface` background to define its boundary. 
*   **The Depth Stack:** Use `surface-container-lowest` (#000000) for the main background and `surface-container-high` (#1d2025) for interactive modules.

### Signature Textures & Glass
*   **Glassmorphism:** For floating overlays (like player stats or draft notifications), use semi-transparent `surface-variant` with a 12px-20px backdrop-blur. This keeps the user connected to the "arena" behind the UI.
*   **Vibrant Gradients:** Use gradients for primary CTAs (transitioning from `primary` #ffe792 to `primary-container` #ffd709) to simulate the glow of stadium floodlights.

---

## 3. Typography: Editorial Impact
Our type system is designed to shout across the field. We use a tri-font strategy to balance aggression with readability.

*   **Display & Headline (Space Grotesk):** This is our "Scoreboard" font. Use `display-lg` (3.5rem) for massive draft numbers and `headline-lg` (2rem) for team names. Its technical, wide stance feels modern and competitive.
*   **Title & Body (Manrope):** The workhorse. `title-lg` (1.375rem) provides a clean, neutral balance to the aggressive headlines.
*   **Labels (Lexend):** Used for "Overseas" and "Top 20" badges. `label-sm` (0.6875rem) in all-caps ensures high legibility in tight spaces.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too "soft" for a high-intensity sports app. We use **Tonal Layering** to create a sense of hierarchy.

*   **The Layering Principle:** 
    *   **Base:** `surface-dim` (#0c0e12)
    *   **Cards:** `surface-container-low` (#111318)
    *   **Active/Selected Items:** `surface-container-highest` (#23262c)
*   **Ambient Shadows:** If a card must float, use a large, diffused shadow (32px blur) with a tint of the team's primary color at 8% opacity. Never use pure black shadows.
*   **The "Ghost Border":** For player cards, if a boundary is required for accessibility, use `outline-variant` (#46484d) at 20% opacity. It should feel like a suggestion of a line, not a hard cage.

---

## 5. Components

### Dynamic Player Cards
*   **The Build:** No hard borders. Use a `surface-container-low` base. 
*   **Team Accents:** Use a 4px vertical "Flash" of color on the left edge using `secondary` (Blue), `tertiary` (Red), or custom team tokens.
*   **Overlays:** Player headshots should break the top boundary of the card (negative margin) to create 3D depth.

### The NBA-Style Draft Board
*   **The Ticker:** A continuous horizontal scroll using `surface-container-lowest`. 
*   **Active Pick:** Use a high-contrast gradient background (`primary` to `primary-container`) with `on-primary-fixed` (Dark Gold) text.
*   **Spacing:** Use `spacing-8` (2rem) between player entries to let the typography breathe like a premium broadcast graphic.

### Badges (Overseas / Top 20)
*   **Style:** Pill-shaped (`rounded-full`). 
*   **Color:** `tertiary-container` (#f6322d) for high-priority alerts. `secondary-container` (#004ba0) for categorical info.
*   **Typography:** Always `label-sm` Lexend, bold, uppercase.

### Buttons & Inputs
*   **Primary Button:** `rounded-md` (0.375rem). Use the `primary` #ffe792 fill. On hover, increase the outer glow (shadow) rather than changing the color.
*   **Input Fields:** `surface-container-highest` backgrounds. No borders. Use `primary` for the bottom 2px "Focus Line" only.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Place a "Next Pick" widget slightly offset from the main grid to create visual energy.
*   **Embrace the Dark:** Keep 90% of the UI in the `surface` and `surface-container` range. Let the accent colors be the stars.
*   **Layer Imagery:** Allow player photos to overlap containers and text to create an editorial, magazine-style feel.

### Don't:
*   **Don't use Dividers:** Never use a horizontal rule `<hr>` to separate list items. Use `spacing-4` or a subtle shift from `surface-container-low` to `surface-container-high`.
*   **Don't use Standard "Web Blue":** Stick strictly to the defined `secondary` (#72a2fd) and `secondary-container` (#004ba0) for that premium, sporty feel.
*   **Don't Over-round:** Stick to `md` (0.375rem) for most cards. Too much rounding (like 1rem+) makes the app feel "cute" rather than "competitive."
