# Suppli — Product Vision

## Purpose of This Document
This document defines what Suppli is, who it is for, the core problems it solves, and the boundaries that prevent feature creep. It is the source of truth for product direction and prioritization.

## One-Sentence Definition
Suppli helps small businesses generate accurate, vendor-ready orders using sales signals and promotions, with guardrails that keep users in control while accuracy improves over time.

## Target Users
### Primary Users (MVP)
- Small business owners/operators responsible for ordering (grocery, convenience, specialty retail, small chains).
- Store managers who place orders weekly/daily.
- Staff who assist with ordering (with limited permissions).

### Secondary Users (Later)
- Multi-location operations managers.
- Accountants/bookkeepers (read-only reporting use cases).
- Vendor reps (limited portal access, only if necessary later).

## Core Problems Suppli Solves
1. Ordering takes too much time and attention.
2. Ordering decisions are inconsistent and error-prone (over-ordering, under-ordering, missed promos).
3. Vendor ordering formats are annoying and vary widely (email, phone, portals, in-person sheets).
4. Deliveries and invoices don’t always match what was ordered (missing items, wrong quantities, price discrepancies).
5. New systems fail because onboarding is too heavy or early recommendations are wrong and break trust.

## Product Principles (Non-Negotiables)
1. **Trust first:** Suppli must avoid large, confident mistakes that cost money.
2. **User remains in control:** For low-confidence situations, Suppli suggests; the user decides.
3. **Progressive automation:** Full automation is earned through data and usage, not assumed on day one.
4. **Minimal setup:** Ask for the smallest amount of information that prevents bad outcomes.
5. **Explainability:** Every recommendation must have a readable reason, especially early on.
6. **Operational consistency:** The UI should feel calm, reliable, and predictable. No flashy styling.
7. **Multi-tenant safety:** Business data must be isolated and protected by default (RLS, roles).

## Product Positioning
### What Suppli Is
- An ordering engine with vendor-ready formatting.
- A learning system that improves through approvals/edits and invoice reconciliation.
- A workflow product: ingest → recommend → review → send → verify → learn.

### What Suppli Is NOT (to prevent scope creep)
- Not a full inventory management platform (MVP).
- Not an accounting system.
- Not an employee scheduling system.
- Not a generic BI dashboard.
- Not a payment processor for vendors (MVP).

## The Core Loop (North Star)
1. Import sales signals (POS integration, CSV, or lightweight baseline).
2. Add promotions/ads (optional early, powerful later).
3. Generate vendor-specific orders with confidence + explanations.
4. User reviews/edits and approves.
5. Orders are formatted/sent/exported per vendor method.
6. Invoice confirmation compares delivered vs ordered.
7. Suppli learns from edits and mismatches.

## Success Metrics (MVP)
### Activation
- A business adds at least 1 vendor and generates its first draft order.
- A business completes at least 1 order review and saves/exports/sends it.

### Retention (most important)
- Weekly active ordering: business returns to generate orders again the following week.
- Reduction in manual effort: fewer edits needed over time.

### Quality / Trust
- “Edit rate” decreases over time.
- Invoice mismatch detection is accurate enough to be useful (later MVP+).

## Accuracy Modes (User Experience Contract)
Suppli uses modes to avoid early trust failure.

### Guided Mode (Default for new users)
- Conservative recommendations.
- Requires review before sending/exporting.
- Limits large quantity swings.
- Clear “learning” messaging and confidence indicators.

### Full Auto Mode (Unlocked)
Unlocked when:
- Sales data is connected or sufficient history exists (e.g., 30+ days), AND
- User has demonstrated stable approval behavior.

Behavior:
- More automation, fewer prompts.
- Still allows manual overrides.

### Simulation / Preview Mode (Optional)
- Shows what Suppli would recommend without allowing sending.
- Used when there is no sales data and the user wants a preview.

## MVP Scope (What Ships First)
- Business + user onboarding (lightweight).
- Vendor profiles and ordering methods.
- Sales import options: CSV upload + minimal baseline.
- Order generation with conservative guardrails and explanations.
- Order review/edit/approve.
- Vendor-ready formatting: email draft, printable sheet, CSV export (phone script later if needed).
- Audit log for key actions (generated, edited, approved, exported).

## Out of Scope for MVP (Explicit)
- Full inventory tracking and cycle counts.
- Automated vendor portal submission (unless a simple export works).
- Advanced forecasting (seasonality models, external datasets).
- Multi-location organization management (can be designed for but not shipped).
- Deep analytics dashboards.

## Risks & Mitigations
### Risk: Bad early recommendations cause churn
Mitigation:
- Guided Mode default
- conservative caps on increases
- confidence UI + explanations
- requires review

### Risk: Data ingestion is painful
Mitigation:
- multiple import paths
- AI-assisted column mapping
- templates + sample files
- partial data still provides value

### Risk: Trust around “AI”
Mitigation:
- calm UI + clear reasoning
- “Suppli learns over time”
- no overpromises
- audit log transparency

## Brand / Tone Summary
Suppli should feel like:
- Calm operations assistant
- Reliable, conservative with money
- Transparent when unsure
- Always improving

Preferred language:
- “learning,” “needs review,” “high confidence,” “conservative by design”
Avoid:
- “experimental,” “beta,” “untrained,” “may be wrong”
