# Suppli — Learning Loop Documentation

## Overview

The learning loop is a conservative, rule-based system that improves order generation accuracy over time by learning from user behavior. It tracks user edits to order quantities and applies gradual adjustments to future recommendations.

**Key Principles:**
- **Conservative**: Changes are gradual and capped
- **Transparent**: Users can see what influenced recommendations
- **Reversible**: Learning never bypasses safety rules
- **Non-blocking**: Learning failures don't break order flow

---

## How It Works

### 1. Learning from User Edits

When a user edits an order line quantity, the system:

1. **Calculates the bias** from the edit (ratio of final to recommended quantity)
2. **Checks if the change is meaningful** (at least 5% or 0.5 units difference)
3. **Retrieves existing bias** for that product (if any)
4. **Calculates new bias** using exponential moving average (30% weight for new data, 70% for existing)
5. **Stores the adjustment** if it's meaningfully different from existing bias

**Example:**
- Recommended: 10 units
- User edits to: 9 units
- Calculated bias: 0.9 (10% decrease)
- If existing bias is 1.0, new bias becomes: 0.97 (conservative update)

### 2. Applying Learning Adjustments

When generating orders, the system:

1. **Fetches quantity biases** for all products in the order
2. **Applies the bias** as a multiplier to the recommended quantity
3. **Respects safety caps** (adjustment caps still apply)
4. **Includes in explanation** so users know why quantities were adjusted

**Example:**
- Baseline quantity: 10 units
- Learning bias: 0.95 (5% decrease from past edits)
- Adjusted quantity: 9.5 units
- Explanation: "Based on recent sales data. Learning adjustment: decreased by 5% based on past edits"

---

## Implementation Details

### Database Schema

Learning adjustments are stored in the `learning_adjustments` table:

```sql
CREATE TABLE learning_adjustments (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL,
  product_id UUID NOT NULL,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('quantity_bias')),
  adjustment_value NUMERIC(10, 2) NOT NULL, -- Multiplier (e.g., 0.95, 1.1)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Service Functions

#### `recordQuantityEdit(businessId, productId, recommendedQuantity, finalQuantity)`

Records a learning adjustment from a user edit.

- Only records if change is meaningful (≥5% or ≥0.5 units)
- Uses exponential moving average for conservative updates
- Only stores if new bias differs by ≥1% from existing

#### `getQuantityBias(businessId, productId)`

Returns the quantity bias multiplier for a product (default: 1.0).

#### `getQuantityBiases(businessId, productIds)`

Returns a Map of productId → bias multiplier for multiple products.

### Integration Points

1. **Order Generation Service** (`order-generation.service.ts`)
   - Fetches learning biases for all products
   - Includes in `ProductContext` for quantity calculation

2. **Quantity Calculator** (`quantity-calculator.ts`)
   - Applies learning adjustment as multiplier
   - Includes in adjustment reason for transparency

3. **Orders Service** (`orders.service.ts`)
   - Tracks user edits via `updateOrderLine`
   - Triggers learning adjustment calculation (non-blocking)

---

## Conservative Safeguards

### Adjustment Caps

Learning adjustments are still subject to the same safety caps as other adjustments:

- **Guided mode**: ±10-20% (waste-sensitive: ±10%)
- **Full auto mode**: ±15-25% (waste-sensitive: ±15%)
- **Simulation mode**: No caps

### Bias Limits

Quantity biases are capped to prevent extreme values:

- **Minimum**: 0.8 (20% decrease)
- **Maximum**: 1.2 (20% increase)

### Update Frequency

New adjustments are only stored if they differ from existing by at least 1%, preventing noise from minor variations.

---

## Future Enhancements

### MVP Scope (Current)

- ✅ Quantity bias adjustments from user edits
- ✅ Conservative exponential moving average
- ✅ Integration with order generation
- ✅ Non-blocking learning (failures don't break orders)

### Future Enhancements

- **Confidence adjustments**: Track edit frequency to adjust confidence levels
- **Seasonal learning**: Account for seasonal patterns
- **Promo performance**: Learn from promotion outcomes
- **Vendor reliability**: Track vendor-specific patterns
- **Multi-store learning**: Share learnings across stores (opt-in)

---

## AI Integration Strategy

The learning loop is designed to be **AI-ready**:

1. **Structured Data**: All learning signals are stored in a structured format
2. **Conservative Baseline**: Rule-based learning provides a safe baseline
3. **Gradual Enhancement**: AI can enhance the learning loop incrementally
4. **Transparency**: All adjustments are explainable

**Future AI Integration:**
- AI can analyze patterns across products, vendors, and time periods
- AI can suggest more sophisticated adjustments while respecting safety caps
- AI can detect anomalies and drift patterns
- Rule-based learning remains as a fallback and safety net

The learning loop will continue to work alongside AI, providing:
- **Baseline adjustments** from explicit user signals
- **Safety constraints** that AI must respect
- **Explainability** for all recommendations

---

## Testing

### Unit Tests

Test learning service functions:
- `recordQuantityEdit` with various scenarios
- `getQuantityBias` and `getQuantityBiases`
- Bias calculation and averaging logic

### Integration Tests

Test learning integration:
- Order generation includes learning adjustments
- User edits trigger learning
- Learning adjustments are applied correctly in recommendations

### Manual Testing

1. Create an order with a product
2. Edit the quantity (increase or decrease by >5%)
3. Generate a new order for the same product
4. Verify the recommendation reflects the learning adjustment
5. Check the explanation includes "Learning adjustment"

---

## Troubleshooting

### Learning Not Applied

- Check that user edit was meaningful (≥5% or ≥0.5 units)
- Verify `learning_adjustments` table has records for the product
- Check that order generation service is fetching biases
- Ensure learning service errors are logged (non-blocking)

### Adjustments Too Aggressive

- Verify bias limits (0.8-1.2) are enforced
- Check that adjustment caps are still applied
- Review exponential moving average alpha value (currently 0.3)

### Performance Issues

- Learning adjustments are fetched in batch for all products
- Learning recording is non-blocking (async, errors logged)
- Consider adding indexes if querying becomes slow

---

## Summary

The learning loop improves order accuracy by:

1. **Tracking** user edits to order quantities
2. **Calculating** conservative quantity biases
3. **Applying** biases to future recommendations
4. **Respecting** all safety rules and caps
5. **Explaining** adjustments to users

It's designed to be safe, transparent, and ready for future AI enhancement while maintaining conservative, rule-based behavior as the foundation.
