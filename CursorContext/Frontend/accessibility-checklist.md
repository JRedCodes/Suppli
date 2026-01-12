# Suppli — Accessibility Checklist

## Purpose of This Document
This document provides a comprehensive accessibility checklist for Suppli's frontend implementation.
Accessibility is not optional—it is a requirement for every feature, component, and page.

This checklist ensures Suppli is usable by everyone, regardless of ability or assistive technology.

---

## Core Accessibility Principles
1. **Perceivable** — Information must be presentable in ways users can perceive
2. **Operable** — Interface components must be operable by all users
3. **Understandable** — Information and UI operation must be understandable
4. **Robust** — Content must be robust enough for various assistive technologies

---

## WCAG 2.1 Level AA Compliance
Suppli must meet WCAG 2.1 Level AA standards as a minimum.

---

## Keyboard Navigation

### Requirements
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical and predictable
- [ ] Focus indicators are visible and clear
- [ ] No keyboard traps
- [ ] Skip links available for main content
- [ ] Escape key closes modals/dialogs

### Testing
- Navigate entire app using only keyboard
- Verify focus order matches visual order
- Test with screen reader (NVDA, JAWS, VoiceOver)

---

## Screen Reader Support

### Semantic HTML
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Form labels associated with inputs
- [ ] Buttons have descriptive text
- [ ] Links have meaningful text (not "click here")
- [ ] Tables have proper headers and scope
- [ ] Lists use proper list elements (ul, ol)

### ARIA Usage
- [ ] ARIA labels used when native semantics insufficient
- [ ] ARIA live regions for dynamic content
- [ ] ARIA roles used correctly
- [ ] ARIA attributes kept minimal (prefer native HTML)

### Testing
- Test with screen reader
- Verify all content is announced
- Verify dynamic updates are announced

---

## Color & Contrast

### Color Contrast
- [ ] Text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- [ ] Interactive elements meet contrast requirements
- [ ] Focus indicators meet contrast requirements

### Color Independence
- [ ] Color is never the only indicator of state
- [ ] Error states use text + icon + color
- [ ] Success states use text + icon + color
- [ ] Status indicators use text + color

### Testing
- Use contrast checker tools
- Test in grayscale mode
- Verify all states are distinguishable without color

---

## Forms & Inputs

### Labels
- [ ] All inputs have visible labels
- [ ] Labels are associated with inputs (for/id or aria-labelledby)
- [ ] Required fields clearly marked
- [ ] Error messages associated with inputs

### Input Types
- [ ] Correct input types used (email, number, date, etc.)
- [ ] Autocomplete attributes used where appropriate
- [ ] Placeholders supplement, not replace, labels

### Validation
- [ ] Validation errors are announced to screen readers
- [ ] Error messages are specific and actionable
- [ ] Success states are communicated

### Testing
- Fill forms using only keyboard
- Verify labels are announced
- Verify errors are announced

---

## Tables

### Structure
- [ ] Tables have proper headers (th elements)
- [ ] Headers have proper scope (col, row, colgroup, rowgroup)
- [ ] Complex tables have captions
- [ ] Tables are not used for layout

### Accessibility
- [ ] Screen readers can navigate table structure
- [ ] Sortable columns are keyboard accessible
- [ ] Row actions are keyboard accessible

### Testing
- Navigate tables with screen reader
- Verify header relationships are clear

---

## Modals & Dialogs

### Focus Management
- [ ] Focus trapped within modal when open
- [ ] Focus returns to trigger when closed
- [ ] Initial focus set to first interactive element

### Announcements
- [ ] Modal title announced when opened
- [ ] Purpose of modal clear from title
- [ ] ARIA modal/dialog roles used

### Keyboard
- [ ] Escape key closes modal
- [ ] Tab order stays within modal
- [ ] Close button is keyboard accessible

### Testing
- Open/close modals with keyboard
- Verify focus management
- Test with screen reader

---

## Dynamic Content

### Live Regions
- [ ] Dynamic updates use ARIA live regions
- [ ] Live region politeness set appropriately (polite, assertive, off)
- [ ] Loading states announced
- [ ] Error messages announced

### Loading States
- [ ] Loading indicators are accessible
- [ ] Skeleton screens have appropriate labels
- [ ] Progress indicators are announced

### Testing
- Verify dynamic updates are announced
- Test loading states with screen reader

---

## Images & Media

### Alt Text
- [ ] All images have alt text
- [ ] Decorative images have empty alt text
- [ ] Informative images have descriptive alt text
- [ ] Complex images have long descriptions

### Icons
- [ ] Icons have text labels or aria-labels
- [ ] Icon-only buttons have accessible names
- [ ] Icon meaning is clear from context

### Testing
- Verify all images have appropriate alt text
- Test icon-only buttons with screen reader

---

## Motion & Animation

### Reduced Motion
- [ ] Respects `prefers-reduced-motion` media query
- [ ] Animations can be disabled
- [ ] No essential information conveyed only through motion

### Animation Guidelines
- [ ] Animations are subtle and purposeful
- [ ] No flashing content (WCAG 2.3.1)
- [ ] Auto-playing content can be paused

### Testing
- Test with reduced motion preference
- Verify no essential information lost

---

## Error Handling

### Error Messages
- [ ] Errors are clearly identified
- [ ] Error messages are specific and actionable
- [ ] Errors are announced to screen readers
- [ ] Error recovery is possible

### Form Errors
- [ ] Field-level errors are associated with inputs
- [ ] Summary errors provided for forms
- [ ] Errors persist until resolved

### Testing
- Trigger errors and verify announcements
- Test error recovery with keyboard

---

## Navigation

### Structure
- [ ] Clear navigation hierarchy
- [ ] Breadcrumbs available where needed
- [ ] Current page/location indicated

### Skip Links
- [ ] Skip to main content link available
- [ ] Skip links visible on focus
- [ ] Logical tab order throughout

### Testing
- Navigate entire site with keyboard
- Verify skip links work
- Test navigation with screen reader

---

## Responsive Design

### Mobile Accessibility
- [ ] Touch targets are at least 44x44px
- [ ] Content is readable without zooming
- [ ] Orientation changes don't break functionality

### Testing
- Test on mobile devices
- Test with mobile screen readers
- Verify touch targets are adequate

---

## Testing Tools & Resources

### Automated Testing
- [ ] axe DevTools integrated
- [ ] Lighthouse accessibility audits passing
- [ ] WAVE browser extension used

### Manual Testing
- [ ] Keyboard-only navigation tested
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Color contrast verified
- [ ] Focus indicators visible

### Testing Checklist Per Feature
- [ ] Keyboard accessible
- [ ] Screen reader tested
- [ ] Color contrast verified
- [ ] Focus management correct
- [ ] Error handling accessible
- [ ] Dynamic content announced

---

## Common Accessibility Issues to Avoid

### Anti-Patterns
- [ ] Using div/span for buttons (use button element)
- [ ] Hiding content with display:none when it should be accessible
- [ ] Using color alone to indicate state
- [ ] Missing form labels
- [ ] Poor heading hierarchy
- [ ] Keyboard traps
- [ ] Missing alt text
- [ ] Insufficient color contrast

---

## MVP Requirements

### Must Have
- [ ] Keyboard navigation throughout
- [ ] Screen reader support for core flows
- [ ] WCAG AA color contrast
- [ ] Proper semantic HTML
- [ ] Form accessibility
- [ ] Focus indicators

### Should Have
- [ ] Skip links
- [ ] ARIA live regions for dynamic content
- [ ] Reduced motion support

---

## Success Criteria
- All core flows are keyboard accessible
- Screen reader users can complete all tasks
- Color contrast meets WCAG AA
- No accessibility blockers in MVP

---

## Summary
Accessibility in Suppli exists to:
- Ensure equal access for all users
- Meet legal and ethical requirements
- Improve overall usability

If a feature is not accessible, it is not complete.
Accessibility is not a feature—it is a requirement.
