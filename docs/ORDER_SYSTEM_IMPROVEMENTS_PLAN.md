# Order System Improvements - Implementation Plan

## Overview
This document outlines the plan to address 5 systemic issues in the order management system without regressing existing features.

---

## Issue 1: Orders Saved to DB Before Approval

### Current Behavior
- Orders are immediately saved to the database when generated via `POST /api/v1/orders/generate`
- Order status is set to `'needs_review'` or `'draft'` (for simulation mode)
- All order lines, vendor orders, and events are persisted immediately

### Problem
- Users may generate multiple orders while exploring options
- Database gets cluttered with unapproved orders
- No way to "discard" a generated order without deleting it
- Learning algorithm could be affected by unapproved orders (though we fixed this)

### Proposed Solution
**Option A: Client-Side Draft State (Recommended)**
- Keep generated orders in React state/localStorage until user clicks "Save Draft" or "Approve"
- Only persist to DB when:
  - User explicitly saves as draft (status: 'draft')
  - User approves the order (status: 'approved')
- Add "Save Draft" button alongside "Approve"
- Auto-save to localStorage every 30 seconds while editing

**Option B: Temporary Draft Table**
- Create a `draft_orders` table separate from `orders`
- Move orders from `draft_orders` to `orders` on approval
- Clean up old drafts after 7 days

**Recommendation: Option A** - Simpler, no DB changes needed, better UX

### Implementation Steps
1. **Frontend Changes:**
   - Modify `OrderGenerationPage` to store result in state instead of immediately calling API
   - Add "Save Draft" button that calls new `POST /api/v1/orders/draft` endpoint
   - Add localStorage persistence for draft orders (key: `draft_order_${businessId}_${timestamp}`)
   - Modify `OrderDetailPage` to handle both DB orders and draft orders
   - Add "Discard Draft" functionality

2. **Backend Changes:**
   - Create new `POST /api/v1/orders/draft` endpoint (similar to generate but saves to DB)
   - Modify `POST /api/v1/orders/generate` to return data without saving (or rename to `/simulate`)
   - Keep existing `POST /api/v1/orders/generate` for backward compatibility but mark as deprecated
   - Add `POST /api/v1/orders/:id/approve` to move from draft to approved (already exists, but ensure it works)

3. **Testing:**
   - Generate order, edit it, navigate away, come back - should restore from localStorage
   - Save draft, refresh page, should load from DB
   - Approve order, should move from draft to approved
   - Multiple draft orders should not interfere with each other

### Risk Assessment
- **Low Risk:** Mostly frontend changes, backward compatible API
- **Migration:** Existing unapproved orders remain in DB (can add cleanup script later)

---

## Issue 2: Marking Review Changes Confidence to Moderate

### Current Behavior
- "Mark Reviewed" button sets confidence_level to 'moderate'
- This happens in `OrderLineRow.tsx` line 139: `onClick={() => onConfidenceChange(line.id, 'moderate')}`

### Problem
- User intent unclear: Do they want to change confidence or just acknowledge they've reviewed it?
- Confidence should reflect data quality, not review status
- Mixing review status with confidence level is confusing

### Proposed Solution
**Option A: Separate Review Status (Recommended)**
- Add `reviewed_at TIMESTAMPTZ` column to `order_lines` table
- "Mark Reviewed" sets `reviewed_at` timestamp instead of changing confidence
- UI shows checkmark or "Reviewed" badge when `reviewed_at` is set
- Confidence level remains unchanged (reflects data quality)
- Order can only be approved when all lines are reviewed OR all "needs_review" lines are reviewed

**Option B: Keep Current Behavior but Clarify**
- Rename button to "Mark as Moderate Confidence"
- Add tooltip explaining this changes confidence level
- Keep current behavior but make intent clear

**Recommendation: Option A** - Better separation of concerns, clearer UX

### Implementation Steps
1. **Database Migration:**
   - Add `reviewed_at TIMESTAMPTZ` to `order_lines` table
   - Add index on `reviewed_at` for queries

2. **Backend Changes:**
   - Modify `updateOrderLineQuantity` to accept `reviewed: boolean` instead of `confidenceLevel` change
   - Add validation: can't approve order if lines with `confidence_level = 'needs_review'` don't have `reviewed_at` set
   - Update `approveOrder` to check all "needs_review" lines are reviewed

3. **Frontend Changes:**
   - Change "Mark Reviewed" button to set `reviewed: true` instead of `confidenceLevel: 'moderate'`
   - Add visual indicator (checkmark/badge) for reviewed lines
   - Update order approval logic to check review status
   - Show warning if trying to approve with unreviewed "needs_review" items

4. **Testing:**
   - Mark line as reviewed, verify `reviewed_at` is set, confidence unchanged
   - Try to approve order with unreviewed "needs_review" lines - should fail
   - Approve order with all reviewed - should succeed

### Risk Assessment
- **Medium Risk:** Requires DB migration and logic changes
- **Breaking Change:** Existing orders won't have `reviewed_at`, need default behavior

---

## Issue 3: Archived Products in DB

### Current Behavior
- Products use soft delete (`archived_at` timestamp)
- Archived products remain in database
- Queries filter by `archived_at IS NULL` to exclude archived

### Problem
- Database grows with archived products
- Need to decide: keep for history/reporting or delete permanently?

### Analysis
**Pros of Keeping:**
- Historical data for reporting (e.g., "what products did we order last year?")
- Can restore if archived by mistake
- Maintains referential integrity for old orders
- Audit trail

**Cons of Keeping:**
- Database bloat over time
- Queries need to filter archived (already doing this)
- Potential confusion in UI (already handled)

### Proposed Solution
**Recommendation: Keep Archived Products**
- Current implementation is correct for business needs
- Add periodic cleanup script (optional): Delete archived products older than 2 years that have no order history
- Add "Restore Product" functionality for accidental archiving
- Consider adding `archived_reason` field for audit purposes

### Implementation Steps (Optional Enhancements)
1. **Add Restore Functionality:**
   - `POST /api/v1/products/:id/restore` endpoint
   - Sets `archived_at = NULL`
   - Only restore if product name is still unique

2. **Add Cleanup Script (Future):**
   - Script to delete archived products with no order_lines after 2 years
   - Run monthly via cron job
   - Log what was deleted for audit

3. **Add Archive Reason:**
   - Migration: `ALTER TABLE products ADD COLUMN archived_reason TEXT`
   - Update archive API to accept reason
   - Display reason in UI

### Risk Assessment
- **Low Risk:** Current approach is fine, enhancements are optional
- **No Breaking Changes:** All optional

---

## Issue 4: Save Order State When Backing Out

### Current Behavior
- Order edits are saved to DB immediately via `PATCH /api/v1/orders/:id/lines/:lineId`
- If user navigates away and comes back, order state is loaded from DB
- **BUT:** If order is in draft state (not yet approved), user might lose work if they don't explicitly save

### Problem
- User generates order, makes edits, navigates away without saving
- Draft order might be lost or not easily accessible
- No way to "resume" editing a draft order

### Proposed Solution
**Combine with Issue 1 Solution:**
- If using Option A (client-side drafts), localStorage handles this automatically
- If order is saved to DB as draft, it persists and can be resumed
- Add "My Drafts" section to orders list page
- Auto-save draft orders every 30 seconds while editing

### Implementation Steps
1. **Frontend Auto-Save:**
   - Add `useEffect` in `OrderDetailPage` that saves draft every 30 seconds
   - Debounce to avoid excessive API calls
   - Show "Saving..." indicator when auto-saving
   - Save to both localStorage (immediate) and DB (debounced)

2. **Backend Draft Endpoint:**
   - `POST /api/v1/orders/draft` - Create new draft
   - `PATCH /api/v1/orders/:id/draft` - Update existing draft
   - `GET /api/v1/orders?status=draft` - List user's drafts

3. **UI Enhancements:**
   - Add "Drafts" filter to orders list
   - Show "Last saved: 2 minutes ago" on draft orders
   - Add "Resume Editing" button for draft orders
   - Warn user if navigating away with unsaved changes

4. **Testing:**
   - Edit draft order, wait 30 seconds, refresh - changes should persist
   - Edit draft, navigate away immediately, come back - should restore from localStorage
   - Multiple users editing same draft - should handle gracefully (last write wins with warning)

### Risk Assessment
- **Medium Risk:** Requires careful state management
- **Edge Cases:** Concurrent edits, network failures during auto-save

---

## Issue 5: Approved Order Showing "No Order Lines"

### Current Behavior
- After approving an order, the detail page shows "No Order Lines" message
- This suggests the query is not returning order lines correctly

### Problem
- Likely a query issue in `getOrderById` or frontend data handling
- Order lines exist in DB but not being fetched/displayed

### Root Cause Analysis Needed
1. Check `getOrderById` query - does it properly join `vendor_orders` and `order_lines`?
2. Check frontend - is it checking `order.vendor_orders` correctly?
3. Check if order lines are being filtered out somewhere
4. Check if approval process is accidentally deleting order lines

### Proposed Solution
1. **Debug Steps:**
   - Add logging to `getOrderById` to see what's returned
   - Check browser network tab - what does the API actually return?
   - Check if `vendor_orders` array is empty or if `order_lines` within it are empty
   - Verify order lines exist in DB after approval

2. **Likely Fixes:**
   - If query issue: Fix Supabase query joins
   - If frontend issue: Fix data access pattern (`order.vendor_orders?.[0]?.order_lines`)
   - If deletion issue: Check `approveOrder` function - ensure it doesn't delete lines

3. **Implementation:**
   - Fix the root cause once identified
   - Add test case: approve order, verify lines are still visible
   - Add error boundary to catch and display query errors

### Risk Assessment
- **Low Risk:** Likely a simple bug fix
- **High Priority:** This is a critical bug affecting core functionality

---

## Implementation Priority & Order

### Phase 1: Critical Bug Fix (Issue 5)
**Priority: HIGH - Do First**
- Fix "No Order Lines" bug
- This is blocking core functionality
- Estimated: 1-2 hours

### Phase 2: Draft Order System (Issues 1 & 4 Combined)
**Priority: HIGH - Core Feature**
- Implement client-side draft state
- Add auto-save functionality
- Add "Save Draft" and "Discard" buttons
- Estimated: 4-6 hours

### Phase 3: Review Status Separation (Issue 2)
**Priority: MEDIUM - UX Improvement**
- Add `reviewed_at` column
- Separate review status from confidence
- Update approval validation
- Estimated: 3-4 hours

### Phase 4: Archive Product Enhancements (Issue 3)
**Priority: LOW - Optional**
- Add restore functionality
- Add archive reason
- Cleanup script (future)
- Estimated: 2-3 hours

---

## Testing Strategy

### For Each Issue:
1. **Unit Tests:**
   - Test service functions with mocked DB
   - Test validation logic
   - Test state management

2. **Integration Tests:**
   - Test API endpoints
   - Test database operations
   - Test query results

3. **E2E Tests:**
   - Test full user workflows
   - Test edge cases (network failures, concurrent edits)
   - Test data persistence

4. **Regression Tests:**
   - Verify existing features still work
   - Test order generation, editing, approval, sending
   - Test product/vendor management

---

## Rollback Plan

### For Each Change:
1. **Database Migrations:**
   - All migrations should be reversible
   - Keep migration files for rollback
   - Test rollback in staging first

2. **API Changes:**
   - Maintain backward compatibility where possible
   - Version APIs if breaking changes needed
   - Keep old endpoints until migration complete

3. **Frontend Changes:**
   - Feature flags for new functionality
   - Gradual rollout
   - Ability to disable new features if issues arise

---

## Notes

- All changes should be made in feature branches
- Each issue should be a separate PR for easier review
- Update documentation as changes are made
- Consider user communication if UX changes significantly
- Monitor error rates and performance after deployment
