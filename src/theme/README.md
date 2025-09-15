Theme & Tokens

Files
- tokens.ts: brand tokens (norsari/patagonia/kingsford/canopy), semantic typography (typeScale), motion and elevation tokens.
- tailwind.config.ts: extended theme (fonts, sizes, colors, elevation, blur, durations, zIndex).

Usage
- Typography: use semantic classes
  - Display: className="text-display font-extrabold"
  - Headline: "text-headline font-bold"
  - Title: "text-title font-semibold"
  - Body: "text-body"
  - Caption: "text-caption"
- Cards: glass/glass-subtle/glass-strong + border
- Elevation: shadow-elevated for hover, shadow-glow for focus
- Motion: transition-duration-normal (300ms) and ease-in-out; keep motion purposeful

Patterns
- Layout: wrap main content in max-w-7xl, 24px padding; grid with 16–24px gaps
- Buttons: primary (bg-brand-primary text-white), secondary (border/ghost)
- Sections: headline, subtext, primary action right-aligned

