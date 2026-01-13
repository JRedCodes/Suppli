# Suppli — Copy, Voice, and Tone

## Purpose of This Document
This document defines how Suppli communicates with users across the product: onboarding, UI labels, helper text, system messages, errors, confirmations, and notifications.

Consistent language builds trust. Inconsistent language creates doubt—especially in a product that touches money.

---

## Brand Voice Summary
Suppli’s voice should feel like:
- A calm, reliable operations assistant
- Conservative with money
- Transparent when unsure
- Helpful without being patronizing

Suppli does not sound like:
- A hype-driven startup
- A chatbot
- A corporate policy document
- A “genius AI” replacing humans

---

## Core Voice Traits

### 1. Calm
- Neutral language
- No exclamation points
- No urgency unless truly required

Good:
> “This order needs review before sending.”

Bad:
> “Action required! This order might be wrong!”

---

### 2. Clear
- Short sentences
- Plain language
- Minimal jargon

Good:
> “Sales data improves order accuracy over time.”

Bad:
> “Our machine learning model optimizes predictive outcomes.”

---

### 3. Honest
- Acknowledge uncertainty
- Avoid overpromising

Good:
> “We’re still learning your store.”

Bad:
> “This order is fully optimized.”

---

### 4. Supportive
- Guide the user toward next steps
- Never blame the user

Good:
> “Add a vendor to start generating orders.”

Bad:
> “You haven’t added any vendors.”

---

## Tone Adjustments by Context

### Onboarding
Tone:
- Reassuring
- Encouraging
- Non-technical

Example:
> “Suppli starts conservatively and improves as it learns your store.”

Avoid:
- Long explanations
- Dense paragraphs

---

### Order Generation & Review
Tone:
- Confident but cautious
- Explanatory

Example:
> “We increased this item slightly based on recent demand.”

Avoid:
- Absolutes
- Jargon like “algorithm,” “model,” or “AI engine”

---

### Errors
Tone:
- Calm
- Specific
- Actionable

Structure:
1. What happened
2. Why it matters (if relevant)
3. What to do next

Example:
> “We couldn’t upload this file. Please check the format and try again.”

Never:
- “Something went wrong”
- Technical error codes

---

### Warnings & Risk
Tone:
- Informative, not alarming

Example:
> “This order has low confidence due to limited sales data.”

Avoid:
- Fear-based language
- Red banners unless truly necessary

---

### Success & Confirmation
Tone:
- Subtle
- Reassuring

Example:
> “Order approved.”

Avoid:
- Celebratory language
- Emojis
- Excessive animations

---

## Terminology Standards

### Preferred Terms
- “Order” (not “recommendation” when user action is required)
- “Needs review”
- “Learning”
- “High confidence”
- “Conservative by design”
- “Approve” (not “confirm”)
- “Send” or “Export” (clear verbs)

### Avoided Terms
- “AI”
- “Model”
- “Automation” (unless necessary)
- “Beta”
- “Experimental”
- “Prediction”

If advanced concepts are needed, explain them in human terms.

---

## Confidence Language

Confidence must be communicated clearly and consistently.

Examples:
- “High confidence”
- “Moderate confidence”
- “Needs review”

Never:
- Numeric confidence scores exposed to users
- Technical probability language

---

## Empty State Copy

Rules:
- Explain why the state exists
- Tell the user what to do next
- Keep it short

Example:
> “No vendors yet. Add a vendor to generate your first order.”

Avoid:
- Humor
- Sarcasm
- Overly clever phrasing

---

## Button & CTA Copy

Rules:
- Use verbs
- Be specific
- Avoid vague actions

Good:
- “Generate Orders”
- “Approve Order”
- “Upload Sales Data”
- “Add Vendor”

Bad:
- “Submit”
- “Continue” (unless part of a wizard)
- “Click here”

---

## Helper Text & Tooltips

Use helper text to explain *why*, not *what*.

Good:
> “Sales data helps Suppli avoid over-ordering.”

Bad:
> “Upload sales data here.”

Tooltips should:
- Be optional
- Add clarity, not repeat labels

---

## Notifications & Toasts

Rules:
- Short
- Informational
- Auto-dismiss

Examples:
- “Order saved.”
- “Invoice uploaded.”
- “Vendor updated.”

Avoid:
- Long sentences
- Calls to action inside toasts

---

## System Messages

System-generated messages should:
- Sound human
- Avoid technical phrasing
- Be consistent across features

Example:
> “Suppli adjusted this order based on recent changes.”

---

## Accessibility Considerations
- Avoid idioms and slang
- Avoid directional language (“click the button on the right”)
- Ensure copy makes sense when read aloud by screen readers

---

## MVP vs Later

### MVP
- Conservative language
- Clear explanations everywhere
- Frequent reassurance

### Later
- Shorter copy for experienced users
- Optional “compact” mode for power users

---

## Summary
Suppli’s copy exists to:
- Build trust
- Reduce anxiety
- Encourage correct actions
- Set realistic expectations

If copy sounds impressive but unclear, rewrite it.
Clarity always wins.
