# Suppli — Learning Loop Implementation

## Overview

The learning loop is a conservative, incremental system that improves order recommendations over time based on user behavior. It learns from explicit signals (edits, approvals) and adjusts future recommendations accordingly.

---

## How It Works

### 1. Tracking User Behavior

The system tracks:
- **Order line edits** - When users modify recommended quantities
- **Order approvals** - When orders are approved without edits
- **Edit patterns** - Consistent adjustments in the same direction

### 2. Learning Adjustments

#### Quantity Bias

When users consistently edit a product in the same direction:
- System calculates average adjustment from last 10 approved orders
- Applies 50% of average (conservative approach)
- Caps adjustments at ±5 units maximum
- Only stores adjustments ≥ 0.5 units

**Example:**
- User consistently reduces bread by 2 units
- System learns: -1 unit bias (50% of -2)
- Next order: Recommends 1 unit less

#### Confidence Adjustment

Based on approval history:
- **High edit frequency (>50%)** → Reduces confidence by 20%
- **Low edit frequency (<20%)** → Increases confidence by 10%
- **Moderate edit frequency** → No adjustment

---

## Implementation Details

### Learning Service

**File:** `server/src/services/learning.service.ts`

**Key Functions:**
- `calculateQuantityBias()` - Calculates adjustment from edit history
- `getLearningAdjustment()` - Gets or creates learning adjustment
- `updateLearningFromEdit()` - Updates learning when user edits
- `calculateConfidenceAdjustment()` - Adjusts confidence based on approvals

### Integration Points

1. **Order Generation**
   - Fetches learning adjustments for all products
   - Applies quantity bias to recommendations
   - Adjusts confidence scores

2. **Order Line Updates**
   - Tracks edits via `updateOrderLineQuantity()`
   - Updates learning adjustments after edit
   - Stores in `learning_adjustments` table

3. **Order Approval**
   - Tracks approval patterns
   - Updates confidence adjustments
   - Used in future order generation

---

## Learning Data Storage

### learning_adjustments Table

```sql
CREATE TABLE learning_adjustments (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL,
  product_id UUID NOT NULL,
  adjustment_type TEXT NOT NULL, -- 'quantity_bias'
  adjustment_value NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
```

**Adjustment Types:**
- `quantity_bias` - Quantity adjustment learned from edits

---

## Learning Algorithm

### Quantity Bias Calculation

1. **Fetch Recent History**
   - Get last 10 approved orders for product
   - Only consider orders where `final_quantity ≠ recommended_quantity`
   - Only count meaningful edits (>5% change)

2. **Calculate Average**
   - Sum all adjustments (final - recommended)
   - Divide by count of edits
   - Apply 50% conservative factor

3. **Apply Caps**
   - Maximum adjustment: ±5 units
   - Minimum threshold: ±0.5 units (don't store smaller)

4. **Store Adjustment**
   - Update existing or create new record
   - Used in next order generation

### Confidence Adjustment Calculation

1. **Fetch Approval History**
   - Get last 5 approved orders for product
   - Count how many were edited (>5% change)

2. **Calculate Edit Frequency**
   - `editFrequency = editCount / totalApproved`

3. **Apply Multiplier**
   - `> 50% edited` → `0.8x` (reduce confidence)
   - `< 20% edited` → `1.1x` (increase confidence)
   - `20-50% edited` → `1.0x` (no change)

---

## Safety Rules

### Conservative by Design

1. **50% Factor** - Only applies half of learned adjustment
2. **Caps** - Maximum ±5 unit adjustment
3. **Thresholds** - Only stores meaningful adjustments (≥0.5 units)
4. **Meaningful Edits** - Only counts edits >5% change

### Never Auto-Approve

- Learning never bypasses review requirements
- Learning never auto-sends orders
- Learning never hides explanations

---

## User Visibility

### Explanation Updates

When learning adjustments are applied, explanations include:
- "adjusted based on past approvals"
- Adjustment reason shows: "Learned adjustment: +X" or "Learned adjustment: -X"

### Transparency

Users can see:
- What influenced recommendations
- Why quantities differ from baseline
- That system is learning from their behavior

---

## Example Flow

### Scenario: User Consistently Reduces Bread

1. **Order 1**: System recommends 20 units, user edits to 18
2. **Order 2**: System recommends 20 units, user edits to 18
3. **Order 3**: System recommends 20 units, user edits to 18
4. **Learning**: System calculates -2 unit average, applies 50% = -1 unit bias
5. **Order 4**: System recommends 19 units (20 - 1)
6. **Result**: User approves without edit

---

## Testing

### Test Scenarios

1. **No Learning Data**
   - System uses baseline quantities
   - No adjustments applied

2. **Consistent Edits**
   - Multiple edits in same direction
   - System learns and applies bias

3. **Inconsistent Edits**
   - Edits in different directions
   - System learns smaller or zero bias

4. **Approval Patterns**
   - High approval rate → Higher confidence
   - High edit rate → Lower confidence

---

## Future Enhancements

### MVP Limitations
- Rule-based learning (no ML)
- Simple quantity bias only
- Basic confidence adjustment

### Future Improvements
- Seasonal learning patterns
- Vendor-specific learning
- Promo performance tracking
- Multi-store learning (opt-in)
- Advanced trend modeling

---

## Success Criteria

The learning loop succeeds when:
- ✅ Fewer edits over time
- ✅ Higher approval confidence
- ✅ No catastrophic failures
- ✅ Users trust the system's restraint
- ✅ Recommendations improve gradually

---

## Summary

The learning loop is designed to:
- **Improve accuracy safely** - Conservative adjustments only
- **Respect user intent** - Explicit signals take precedence
- **Reduce effort over time** - Fewer edits needed

If learning creates surprise or confusion, it has failed. The system prioritizes safety and transparency over optimization.
