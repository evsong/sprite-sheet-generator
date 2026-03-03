# Proposal: SpriteForge Mobile Responsive

## Problem

SpriteForge landing page and auth pages have zero mobile responsiveness. All layouts use fixed CSS grid columns (`repeat(3, 1fr)`, `1.1fr 1fr`, `1.5fr repeat(3,1fr)`) and inline styles with no breakpoints. On mobile devices:

- Navbar overflows (4 links + button + user menu in a single row)
- Hero section's 2-column grid is unreadable
- Features/HowItWorks/Pricing 3-column grids are cramped
- Footer 4-column grid overflows
- Editor page's fixed `180px 1fr 220px` grid is completely unusable

## Solution

### Landing Page — Full Responsive Adaptation

Convert all landing components to use Tailwind responsive breakpoints:

1. **Navbar** — Add hamburger menu for mobile, hide nav links behind toggle on `<md`
2. **Hero** — Stack to single column on `<md`, reduce font sizes
3. **Features** — `grid-cols-1` on mobile, `grid-cols-2` on `sm`, `grid-cols-3` on `md+`
4. **HowItWorks** — `grid-cols-1` on mobile, `grid-cols-3` on `md+`
5. **Pricing** — `grid-cols-1` on mobile, `grid-cols-3` on `md+`
6. **Footer** — `grid-cols-2` on mobile, `grid-cols-4` on `md+`

### Editor Page — Desktop-Only Gate

The sprite sheet editor is inherently a desktop tool (drag-drop, canvas manipulation, multi-panel layout). Instead of forcing a broken responsive layout, show a "Please use a desktop browser" message on `<md` screens.

### Auth Pages — Verify Existing Responsiveness

Auth pages (signin/signup/verify) are simple centered forms — verify they work on mobile, fix if needed.

## Affected Files

| File | Change |
|------|--------|
| `src/components/landing/Navbar.tsx` | Hamburger menu + mobile nav |
| `src/components/landing/Hero.tsx` | Responsive grid + font sizes |
| `src/components/landing/Features.tsx` | Responsive grid columns |
| `src/components/landing/HowItWorks.tsx` | Responsive grid columns |
| `src/components/landing/Pricing.tsx` | Responsive grid columns |
| `src/components/landing/Footer.tsx` | Responsive grid columns |
| `src/app/editor/page.tsx` | Mobile gate component |
| `src/app/globals.css` | Mobile utility styles if needed |

## Out of Scope

- Editor responsive layout (desktop-only tool)
- Projects page (already has `sm:grid-cols-2 lg:grid-cols-3`)
- PWA / native mobile app
- Touch gesture support in editor

## Cost

- ~8 files modified
- No new dependencies
- No API changes
- No database changes
