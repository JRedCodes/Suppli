# Suppli — Order Generation Algorithm

## Overview

This document describes the order generation algorithm implemented in Suppli. The algorithm is designed to be conservative, explainable, and safe in low-data environments.

---

## Algorithm Flow

### 1. Input Collection

The order generation service collects:

1. **Vendor Information**
   - Active vendors for the business
   - Vendor ordering methods

2. **Product Information**
   - Products associated with each vendor
   - Product attributes (waste sensitivity, unit type)

3. **Sales Data** (if available)
   - Recent sales events for the order period
   - Average quantities
   - Data recency and consistency

4. **Previous Orders** (if available)
   - Most recent approved order quantities per product

5. **Active Promotions** (if any)
   - Promotions active during the order period
   - Promotion uplift levels

---

## Quantity Calculation

### Baseline Quantity

The baseline quantity is determined in priority order:

1. **Recent Sales Data** (highest priority)
   - Average quantity from sales events in the order period
   - Used if available and recent

2. **Previous Approved Order**
   - Most recent approved order quantity for the product
   - Used if sales data is unavailable

3. **Conservative Default**
   - Minimal quantity (1 unit) if no historical data exists
   - Prevents zero-quantity orders

### Promotion Uplift

If an active promotion exists, the baseline is adjusted:

- **Low uplift**: +10% (1.1x)
- **Medium uplift**: +20% (1.2x)
- **High uplift**: +30% (1.3x)

### Adjustment Caps

Conservative caps are applied based on mode and confidence:

#### Guided Mode (Default)
- **Max increase**: +10% (waste-sensitive) or +20% (regular)
- **Max decrease**: -20%
- **Applies to**: All products regardless of confidence

#### Full Auto Mode
- **Max increase**: +15% (waste-sensitive) or +25% (regular)
- **Max decrease**: -30%
- **Applies to**: Only products with high confidence (≥0.7)

#### Simulation Mode
- **No caps applied**
- Used for preview/testing only

---

## Confidence Scoring

Confidence is calculated per product using multiple factors:

### Scoring Factors

1. **Sales Data Availability** (40% base)
   - +0.4 if sales data exists

2. **Data Recency** (20% of base)
   - Score decreases as data ages
   - 30+ days old = 0
   - Formula: `1 - (daysSince / 30)`

3. **Data Consistency** (20% of base)
   - Lower variance = higher score
   - Coefficient of variation used
   - Score: `1 - (stdDev / mean)`

4. **Previous Approved Order** (+20%)
   - Bonus if previous order was approved

5. **Active Promotion** (-10%)
   - Reduces confidence due to uncertainty

6. **Waste Sensitivity Penalty**
   - If waste-sensitive and score < 0.6, multiply by 0.8
   - Ensures extra caution for perishable items

### Confidence Levels

Numeric scores are converted to user-facing levels:

- **High**: Score ≥ 0.7
- **Moderate**: Score 0.4 - 0.69
- **Needs Review**: Score < 0.4

---

## Explanation Generation

Every order line includes an explanation that describes:

1. **Primary Data Source**
   - "Based on recent sales data"
   - "Based on previous approved order"
   - "Conservative estimate due to limited data"

2. **Adjustment Details** (if quantity differs from baseline)
   - Percentage change (increase/decrease)
   - Reason (e.g., "due to active promotion")

3. **Confidence Note** (if needed)
   - "(needs review)" for low confidence items

**Example Explanations:**
- "Based on recent sales data. Increased by 15% due to active promotion."
- "Based on previous approved order. (needs review)"
- "Conservative estimate due to limited data."

---

## Generation Modes

### Guided Mode (Default)

**When Used:**
- New businesses
- Limited sales data
- Low historical approval consistency

**Characteristics:**
- Conservative adjustment caps
- All orders require review
- Prominent explanations
- No auto-sending

### Full Auto Mode

**When Used:**
- Sufficient sales data exists
- User demonstrates consistent approval behavior
- Explicit user opt-in

**Characteristics:**
- Looser adjustment caps (for high-confidence items)
- Fewer confirmations
- Still reversible and auditable

### Simulation Mode

**When Used:**
- User wants to preview ordering logic
- Testing scenarios

**Characteristics:**
- No adjustment caps
- No approval or sending allowed
- Clearly labeled as preview

---

## Safety Rules

### Missing Data Handling

- **No sales data**: Falls back to previous order or conservative default
- **No previous order**: Uses minimal quantity (1 unit)
- **Never generates zero** without explicit explanation
- **Never generates large guesses** without data support

### Waste-Sensitive Products

Special handling for perishable items:

- Smaller upward adjustments (+10% vs +20%)
- Higher confidence threshold required
- Penalty applied to low-confidence scores

### Conflicting Signals

If inputs conflict (e.g., sales down but promotion active):

- Favor lower quantities
- Surface warning in explanation
- Require review (low confidence)

---

## Implementation Details

### File Structure

```
server/src/domain/orders/
  ├── types.ts              # Type definitions
  ├── confidence.ts          # Confidence scoring logic
  ├── quantity-calculator.ts # Quantity calculation logic
  └── index.ts              # Exports

server/src/services/
  └── order-generation.service.ts  # Orchestration service
```

### Key Functions

- `calculateConfidenceScore()` - Calculates 0-1 confidence score
- `scoreToConfidenceLevel()` - Converts score to user-facing level
- `calculateBaselineQuantity()` - Determines baseline from available data
- `applyPromotionUplift()` - Applies promotion adjustments
- `applyAdjustmentCaps()` - Enforces conservative limits
- `generateExplanation()` - Creates human-readable explanations
- `generateOrder()` - Main orchestration function

---

## Testing Scenarios

### Scenario 1: No Sales Data
- **Input**: New business, no sales events
- **Expected**: Conservative quantities based on defaults
- **Confidence**: "needs_review"

### Scenario 2: Recent Sales Data
- **Input**: 30 days of consistent sales
- **Expected**: Quantities based on averages
- **Confidence**: "high" or "moderate"

### Scenario 3: Active Promotion
- **Input**: Sales data + active promotion
- **Expected**: Baseline + promotion uplift (capped)
- **Confidence**: Slightly reduced due to uncertainty

### Scenario 4: Waste-Sensitive Product
- **Input**: Fresh produce with low confidence
- **Expected**: Extra conservative quantities
- **Confidence**: Penalized score

---

## Future Enhancements

### MVP Limitations
- Deterministic logic (no ML)
- Simple confidence tiers
- Manual review required
- Fixed adjustment caps

### Future Improvements
- Adaptive caps based on user behavior
- Seasonal modeling
- Vendor-specific forecasting
- Auto-approval rules for high-confidence items
- Machine learning integration

---

## Success Criteria

The algorithm succeeds when:

- ✅ No catastrophic over-ordering
- ✅ Users understand why quantities exist
- ✅ Users trust Suppli's restraint
- ✅ Edits decrease over time
- ✅ Conservative by default, optimized when confident

---

## Summary

Suppli's order generation algorithm prioritizes safety and explainability. It uses available data sources in priority order, applies conservative caps, and generates clear explanations for every recommendation. The system is designed to build trust through transparency and restraint.
