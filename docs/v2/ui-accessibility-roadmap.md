# UI accessibility & chart usability roadmap

This document captures EMR/EHR-oriented UX and accessibility goals aligned with common vendor patterns (e.g. [OpenEMR](https://www.open-emr.org/) community emphasis on configurable layouts and keyboard-friendly forms; Epic and similar enterprise EHRs emphasize **dense but scannable** charting, **clear hierarchy**, **consistent navigation**, and **documented clinical actions**).

## Implemented (Phase 6 shell pass)

- **Skip link** to `#main-content` in `AppShell.tsx` (visible on keyboard focus).  
- **Single `<main>` landmark** wrapping authenticated app content (avoids nested `main`).  
- **Collapsible primary sidebar** with preference persisted in `localStorage` (`ayekta-sidebar-collapsed`).  
- **Chart section rail**: `aria-label="Chart sections"`; active section `aria-current="page"`.  
- **Review & sign** table: `<caption class="sr-only">` for screen readers.

## Implemented (Phase 7 UI / a11y polish)

- **Section focus** — After changing chart section, focus moves to a visible “Section …” strip with `focus-visible` ring (`PatientWorkspacePage.tsx`).  
- **Chart density** — Comfortable vs compact preference in Settings (`chartDensityStore` + `data-chart-density` on `<html>`; compact caps prose width / tightens type in `globals.css`).  
- **Reduced motion** — Login / decorative animations disabled under `prefers-reduced-motion` (`globals.css`); module loading spinner uses `motion-safe:animate-spin`.  
- **Keyboard focus** — Global `focus-visible` outline for buttons/links inside `.font-clinical`.  
- **Assertive errors** — Review & sign errors use `role="alert"` / `aria-live="assertive"`; signed rows show a text “(locked)” label beside status (not color-only).  
- **Settings nav** — `aria-current="page"` on active item.

## Recommended next steps (patient chart)

1. **Focus management** — Deeper: move focus into first field of each module when section changes (optional; avoid over-aggressive focus stealing).  
2. **Keyboard** — Full tab order audit inside large modules (Demographics, Op note).  
3. **Density & typography** — Optional third preset or per-user server sync of preference.  
4. **Color & state** — Extend non–color-only cues to triage badges / vitals widgets.  
5. **Errors & attestations** — Header save path: expose `role="alert"` on hard PDF/save failures.  
6. **Reduced motion** — Audit any remaining `transition-all` / `animate-*` in modules.

## References (external)

- W3C [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — perceivable, operable, understandable, robust criteria for health and complex apps.  
- OpenEMR — open workflow, form-heavy UI; useful for **offline-first** and **role-based** parallels.  
- Epic / Hyperspace — industry reference for **chart review**, **activity / timeline**, and **sidebar navigation** density (adapt concepts, not proprietary assets).
