# Suppli — Design System

## Purpose of This Document
This document defines Suppli’s visual and interaction design system. It establishes consistent rules for layout, typography, color, spacing, components, and accessibility to ensure the UI is calm, trustworthy, and scalable.

This system prioritizes clarity and accessibility over visual novelty.

---

## Design Philosophy
- **Calm over clever**: Suppli should feel reliable and predictable.
- **Clarity over density**: Prefer whitespace to compression.
- **Consistency over customization**: Reuse patterns everywhere.
- **Accessible by default**: Accessibility is not optional or layered on later.
- **Subtle hierarchy**: Visual hierarchy should guide attention without distraction.

Suppli is an operations tool. The UI should never compete with the task.

---

## Color System

### Color Principles
- Use color to **communicate meaning**, not decoration.
- Avoid large areas of saturated color.
- Color must never be the only indicator of state.

### Core Palette
(Exact hex values can be finalized later; relationships matter more than values.)

- **Background**
  - Primary background (light): near-white, slightly warm or neutral
  - Secondary background: subtle gray for panels/cards
- **Text**
  - Primary text: high-contrast dark neutral
  - Secondary text: muted neutral
  - Disabled text: clearly muted but readable
- **Brand Accent**
  - One primary accent color (used sparingly)
  - Used for primary actions, links, focus states
- **Semantic Colors**
  - Success (green)
  - Warning (amber)
  - Error (red)
  - Info (blue/neutral)

### Usage Rules
- Never stack multiple accent colors in one view.
- Error/warning colors appear only when necessary.
- Confidence states should use both color AND text/iconography.

---

## Typography

### Font Philosophy
- Neutral, modern sans-serif
- High readability at small sizes
- No decorative fonts

### Type Scale
Use a restrained scale. Avoid too many sizes.

- H1: Page title
- H2: Section header
- H3: Subsection header
- Body (default): Main content
- Small: Helper text, metadata
- Mono: IDs, SKUs, technical values

### Typography Rules
- Sentence case for most UI text.
- Avoid all caps except for very short labels or badges.
- Line length should favor readability (not full-width text walls).

---

## Spacing & Layout

### Spacing Scale
Use a consistent spacing scale (example):
- xs
- sm
- md
- lg
- xl
- 2xl

All padding, margins, and gaps must use this scale.

### Layout Rules
- Pages use a vertical flow:
  - Page header
  - Content sections
- Cards and panels should have consistent padding.
- Avoid nested cards unless necessary.

---

## Component Philosophy

### Core Components (Reusable)
- Buttons
- Inputs (text, number, select, textarea)
- Checkboxes & radio buttons
- Tables
- Modals / dialogs
- Tabs
- Badges
- Alerts
- Tooltips
- Dropdown menus

All components should be implemented once and reused everywhere.

### Buttons
- Primary: one per page or section
- Secondary: neutral styling
- Destructive: visually distinct, requires confirmation

Rules:
- Never place two primary buttons side-by-side.
- Destructive actions must be clearly labeled.

---

## Forms

### Form Design Rules
- Always use visible labels (never placeholders-only).
- Group related fields visually.
- Inline help text explains *why*, not *what*.
- Validation messages should be specific and calm.

### Validation States
- Error: explain what went wrong and how to fix it.
- Warning: indicate risk without blocking.
- Success: subtle confirmation, not celebratory.

---

## Tables

### Table Rules
- Tables are the default for list views.
- Column headers use `<th>` with proper scope.
- Row actions are accessible via buttons or menus.
- Avoid horizontal scrolling when possible.

### States
- Loading
- Empty
- Error
- Filtered (no results)

Each state must have a clear explanation and next step.

---

## Badges & Status Indicators

Used heavily in ordering workflows.

Examples:
- Draft
- Needs Review
- Approved
- Sent
- Learning
- High Confidence

Rules:
- Always pair color with text.
- Avoid overly saturated colors.
- Status labels should be consistent across the app.

---

## Modals & Dialogs

### When to Use
- Confirmations
- Quick creation/edit flows
- Focused tasks

### When NOT to Use
- Long multi-step workflows
- Heavy data entry

Rules:
- Trap focus while open.
- Escape key closes non-destructive modals.
- Primary action clearly indicated.

---

## Accessibility Standards

### Non-Negotiable Requirements
- Keyboard navigation everywhere.
- Visible focus states (never removed).
- Proper heading hierarchy.
- ARIA used only when native semantics are insufficient.
- Color contrast meets WCAG AA minimums.
- Motion respects `prefers-reduced-motion`.

### Forms & Inputs
- Labels explicitly associated with inputs.
- Error messages announced to screen readers.
- Required fields clearly marked.

### Tables
- Proper semantic markup.
- Screen-reader-friendly row/column relationships.

---

## Motion & Feedback

### Motion Rules
- Subtle and purposeful.
- Never block task completion.
- Reduced or removed for users who prefer reduced motion.

### Feedback Patterns
- Loading states for async actions.
- Optimistic updates where safe.
- Toasts for confirmations, not critical errors.

---

## Icons & Visual Aids
- Simple, consistent icon set.
- Icons supplement text, never replace it.
- Avoid decorative icons without meaning.

---

## Dark Mode (Future)
- Design tokens must support light/dark theming.
- Avoid hardcoded colors.
- Contrast rules apply equally.

---

## MVP vs Later

### MVP
- Light mode only
- Core components
- Conservative visual design
- Full accessibility baseline

### Later
- Dark mode
- Theme customization (limited)
- Advanced data visualizations (sparingly)

---

## Summary
Suppli’s design system exists to:
- Reduce cognitive load
- Build trust
- Enable rapid feature expansion
- Guarantee accessibility and consistency

If a UI decision conflicts with clarity or accessibility, clarity wins.
