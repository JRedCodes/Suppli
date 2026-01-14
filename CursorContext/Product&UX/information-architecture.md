# Suppli — Information Architecture

## Purpose of This Document
This document defines Suppli’s information architecture: page hierarchy, navigation structure, and content responsibilities. It ensures the product remains understandable, scalable, and accessible as features expand.

This is not a visual design document. It defines *what exists and where*, not how it looks.

## Core IA Principles
1. **Ordering is the center of gravity**  
   Navigation, workflows, and mental models should always lead back to ordering.
2. **Shallow hierarchy**  
   Users should reach any core action within 2–3 clicks.
3. **Predictable patterns**  
   Lists lead to detail views. Detail views use tabs.
4. **Progressive disclosure**  
   Advanced configuration is hidden until needed.
5. **Accessible navigation**  
   All navigation must be keyboard-accessible and screen-reader friendly.

## Global Layout Structure
Suppli uses a standard B2B application layout:

- **Top Bar**
  - Current business/store selector (future-proofed)
  - Global search (orders, vendors, products)
  - Notifications (order issues, invoice mismatches)
  - Help / Docs
  - User profile menu

- **Left Sidebar (Primary Navigation)**
  - Orders
  - Vendors
  - Promotions
  - Sales Data
  - Invoices
  - Insights (later / limited in MVP)
  - Settings

- **Main Content Area**
  - Page header (title + primary action)
  - Content sections (tables, cards, forms)

## Primary Navigation Map (MVP)

### 1. Dashboard (Optional but Recommended)
**Path:** `/dashboard`

Purpose:
- At-a-glance operational status
- Entry point into ordering

Content:
- Next upcoming order(s)
- Orders needing review
- Recent invoice mismatches
- Primary CTA: “Generate Orders”

Note:
Dashboard should not become a data-heavy analytics page.

---

### 2. Orders (Core)
**Path:** `/orders`

#### Orders List
**Path:** `/orders`
- Table of generated orders (grouped by date or cycle)
- Filters: vendor, status, confidence, date
- Status badges: Draft, Needs Review, Approved, Sent
- Primary CTA: “Generate New Orders”

#### Order Detail
**Path:** `/orders/:orderId`
Tabs:
- Overview (recommended quantities, confidence, explanations)
- Vendor Breakdown (per-vendor orders)
- History (edits, approvals, sends)
- Notes (optional)

Primary actions:
- Approve
- Edit
- Export / Send
- Save as Draft

---

### 3. Vendors
**Path:** `/vendors`

#### Vendors List
**Path:** `/vendors`
- Vendor name
- Ordering method (email, phone, portal, in-person)
- Last order date
- Accuracy indicators (later)

Primary CTA:
- “Add Vendor”

#### Vendor Detail
**Path:** `/vendors/:vendorId`
Tabs:
- Overview
- Ordering Rules (cutoffs, minimums, format)
- Products / SKUs
- Order History
- Documents (price lists, PDFs)

---

### 4. Promotions / Ads
**Path:** `/promotions`

Purpose:
- Capture sales-impacting events that influence ordering.

#### Promotions List
**Path:** `/promotions`
- Active / upcoming / past promos
- Source (flyer, manual, email)

#### Promotion Detail
**Path:** `/promotions/:promotionId`
- Affected products
- Date range
- Expected uplift (manual or AI-estimated)
- Notes

---

### 5. Sales Data
**Path:** `/sales-data`

Purpose:
- Manage inputs that influence order accuracy.

Sections:
- Connected integrations (POS)
- Uploaded files (CSV, Excel)
- Manual baseline inputs

Subpages:
- `/sales-data/import`
- `/sales-data/history`

Key messaging:
- Sales data improves accuracy but is not required.

---

### 6. Invoices
**Path:** `/invoices`

Purpose:
- Verify delivered orders and close the learning loop.

#### Invoice List
**Path:** `/invoices`
- Status: Matched, Mismatch, Pending Review
- Linked order
- Vendor

#### Invoice Detail
**Path:** `/invoices/:invoiceId`
- Uploaded image/PDF
- Parsed line items
- Comparison vs ordered quantities
- Highlighted discrepancies
- Suggested actions

---

### 7. Insights (Limited MVP)
**Path:** `/insights`

MVP Scope:
- Simple insights only:
  - Ordering accuracy trend
  - Edit frequency over time
  - Vendor mismatch frequency

Explicitly NOT:
- Deep analytics
- Custom reporting
- Financial dashboards

---

### 8. Settings
**Path:** `/settings`

Settings is split into clear sections:

#### Business Settings
**Path:** `/settings/business`
- Business info
- Timezone
- Currency
- Ordering preferences

#### Users & Roles
**Path:** `/settings/users`
- Invite users
- Role management

#### Billing
**Path:** `/settings/billing`
- Plan
- Usage limits
- Stripe portal

#### Integrations
**Path:** `/settings/integrations`
- POS connections
- Email connections

#### Security
**Path:** `/settings/security`
- Sessions
- API keys (if applicable later)

---

## Onboarding-Specific Routes
Onboarding uses a guided flow separate from main navigation.

**Paths:**
- `/onboarding`
- `/onboarding/business`
- `/onboarding/vendors`
- `/onboarding/sales-data`
- `/onboarding/finish`

Rules:
- Sidebar hidden or limited during onboarding.
- User can skip optional steps.
- Clear progress indicator.

---

## Page Types & Reusable Patterns

### List Pages
- Tables with pagination
- Filters and saved views
- Bulk actions (where safe)
- Empty states with next-step guidance

### Detail Pages
- Header with entity name + primary action
- Tabbed content
- Secondary actions in overflow menu

### Modals
Used for:
- Quick create (vendor, promo)
- Confirmations
- Inline edits

Avoid:
- Long multi-step workflows in modals

---

## Accessibility Considerations
- Sidebar navigation must be keyboard navigable.
- Page titles map to H1.
- Breadcrumbs used sparingly for deep pages.
- Routes should be semantic and human-readable.

---

## Future-Proofing Notes
- All routes assume multi-tenant support (businessId implicit).
- Navigation supports feature gating by plan.
- IA avoids coupling to specific industries.

---

## Summary
Suppli’s information architecture prioritizes:
- Ordering as the core workflow
- Clarity over density
- Predictable navigation
- Expandability without reorganization

If a new feature does not clearly fit into this structure, it should be reconsidered or deferred.
