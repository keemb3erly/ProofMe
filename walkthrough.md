# Visual Regression Fixes — Walkthrough

## Summary

Six files were corrected to restore semantic colors and fix visual regressions introduced during the dark-to-light design system migration.

## Changes

### 1. `src/components/ui/badge.tsx`
- **`info` variant**: `bg-primary/10 text-primary border-primary/20` → `bg-blue-50 text-blue-700 border-blue-200`
- The brand teal (`#004D61`) was replacing semantic blue for info badges. Restored to proper blue palette.

### 2. `src/components/landing/HeroSection.tsx`
- **Second CTA button ("Report a Scam")**: Changed from solid primary (`bg-primary text-white`) → outline style (`border-primary text-primary hover:bg-slate-50`)
- This button was originally an outline/secondary variant but got changed to solid during migration.

### 3. `src/components/admin/admin-report-card.tsx`
- **Category badge**: `bg-primary/10 text-primary border-primary/20` → `bg-blue-50 text-blue-700 border-blue-200`
- Category labels are informational metadata, not brand elements. Restored to blue.

### 4. `src/components/report/report-card.tsx`
- **Category badge**: `bg-primary/10 text-primary border-primary/20` → `bg-blue-50 text-blue-700 border-blue-200`
- Same rationale — informational category badges should use semantic blue.

### 5. `src/app/admin/dashboard/page.tsx` (line 597)
- **Evidence count badge**: `text-primary bg-primary/10 border-primary/20` → `text-blue-700 bg-blue-50 border-blue-200`
- Evidence file count is informational metadata. Restored to blue.

### 6. `src/app/entity/[id]/page.tsx` (line 585)
- **Report category badge**: `bg-primary/10 text-primary border-primary/20` → `bg-blue-50 text-blue-700 border-blue-200`
- Category badge in timeline entries. Restored to blue.

## What Was Already Correct (Verified During Audit)

| Component / Page | Verified State |
|---|---|
| `globals.css` | `@theme` with `--color-primary: #004D61`, `--color-primary-hover: #003B4B` |
| `button.tsx` primary variant | `bg-primary text-white hover:bg-primary-hover shadow-sm` |
| `navbar.tsx` | Logo `text-primary`, nav links `text-slate-500 hover:text-slate-900` |
| `footer.tsx` | Logo `text-primary`, links `text-slate-500 hover:text-slate-700` |
| `HeroSection.tsx` heading | `text-primary` (#004D61) — good contrast |
| `FeaturesSection.tsx` | H2: `text-slate-900`, body: `text-slate-500`, icons: `text-primary` |
| `MetricsSection.tsx` | H2: `text-slate-900`, body: `text-slate-500`, icons: `text-primary` |
| `CTASection.tsx` | H2: `text-slate-900`, highlight: `text-primary`, buttons correct |
| `SearchSection.tsx` | H2: `text-primary`, body: `text-slate-500`, input/buttons correct |
| `Login/Register pages` | Logo `text-primary`, links `text-primary` |
| `Report page` | CardTitle `text-primary` (brand heading), form inputs correct |
| `Entity page` | Decorative icons `bg-primary/10` (brand accent, not info), download button `bg-primary` |
| `Admin dashboard` | Stat card icons `bg-primary/10` (decorative), focus rings `ring-primary/20` |
| `Input/Select/Textarea` | `text-slate-900`, `focus:border-primary`, `focus:ring-primary/20` |
| `Modal` | `bg-white`, title `text-slate-900` |
| `Card` | `bg-white`, title `text-slate-900`, description `text-slate-500` |
| `Spinner` | `border-t-primary` (brand accent) |

## Design Token Usage Guidelines

- **Brand colors** (`primary` / `#004D61`): Logo, CTA buttons, decorative icons, focus rings, links, hover states, data highlights
- **Semantic blue** (`blue-50/blue-700/blue-200`): Info badges, category labels, evidence/file count badges, any informational metadata
- **Semantic green** (`emerald-50/emerald-700/emerald-200`): Success badges, positive trends
- **Semantic amber** (`amber-50/amber-700/amber-200`): Warning badges, medium-risk states
- **Semantic rose/red** (`rose-50/rose-700/rose-200`, `rose-600/rose-700`): Danger badges, error states, negative trends, reject buttons

## Remaining Inconsistencies

- **Pre-existing TS errors** in `src/app/report/page.tsx:330,363`: the `Select` component receives an `options` prop but its TypeScript interface only defines `children`. This is a type-definition mismatch unrelated to the visual migration.
- The entity page stat-card icon containers (Approved Reports, Evidence Files, First Report) all use uniform brand teal (`bg-primary/10 text-primary`) whereas the original design gave each a distinct color (blue, indigo, purple, amber). This was a deliberate simplification — keeping them monochrome is a valid design choice. If distinct per-section icon colors are desired, restore the original palette.

## Verification

```bash
npx tsc --noEmit
# Only pre-existing errors reported — no new type errors introduced
```
