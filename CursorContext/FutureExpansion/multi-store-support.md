# Suppli — Multi-Store Support

## Purpose of This Document
This document defines how Suppli will support multi-location businesses in the future.
Multi-store support is **out of scope for MVP** but the architecture should be designed to accommodate it without major rewrites.

This document serves as a design guide for future implementation.

---

## Core Principles
1. **Architecture supports multi-store from day one**
2. **Single-store is the default and simplest case**
3. **Store isolation is as strict as business isolation**
4. **Cross-store features are opt-in**
5. **Store context is explicit, never inferred**

---

## Store Model (Conceptual)

### Store Definition
A store represents a single physical location or operational unit within a business.

### Store Attributes
- Store name
- Address
- Timezone
- Currency (inherits from business, can override)
- Store-specific settings

### Store Relationships
- One business → many stores
- Orders belong to one store
- Vendors can be shared or store-specific
- Products can be shared or store-specific

---

## Data Model Considerations

### Current Architecture
- All tables include `business_id`
- RLS enforces business isolation
- Business context required for all operations

### Multi-Store Extension
- Add `store_id` to relevant tables
- RLS enforces both business and store isolation
- Store context required for store-scoped operations

### Tables That Need Store Context
- Orders
- Sales events
- Invoices
- Learning adjustments
- Store-specific settings

### Tables That Don't Need Store Context
- Businesses (top-level)
- Users (business-level)
- Vendors (can be shared or store-specific)
- Products (can be shared or store-specific)

---

## Store Selection & Context

### Store Selector
- Visible in top bar
- Required for store-scoped operations
- Persists selection in session
- Clear indication of active store

### Store Context Resolution
Every request must resolve:
- business_id (from user membership)
- store_id (from selection or default)
- user_id (from auth)
- role (from business_users)

### Default Store Behavior
- Single-store businesses: auto-select only store
- Multi-store businesses: require explicit selection
- No implicit store inference

---

## Store Isolation

### Data Isolation
- Store data is isolated via RLS
- Cross-store queries require explicit permission
- Store-specific data never leaks to other stores

### Vendor Isolation
- Vendors can be:
  - Business-wide (shared)
  - Store-specific
- Store-specific vendors only visible to that store
- Shared vendors visible to all stores

### Product Isolation
- Products can be:
  - Business-wide (shared)
  - Store-specific
- Store-specific products only in that store's orders
- Shared products available to all stores

---

## Cross-Store Features (Future)

### Aggregated Reporting
- Business-level insights
- Cross-store comparisons
- Rollup analytics
- Opt-in only

### Shared Learning
- Option to share learning across stores
- Store-specific learning by default
- Configurable per business

### Centralized Ordering
- Generate orders for multiple stores
- Store-specific vendor orders
- Consolidated vendor communications

---

## Ordering Workflows

### Single-Store Ordering (Current)
- Select store (or auto-select if only one)
- Generate order for that store
- Review and approve
- Send/export

### Multi-Store Ordering (Future)
- Select stores to include
- Generate orders per store
- Review each store's order
- Approve individually or in bulk
- Send/export per store

---

## Sales Data & Learning

### Store-Specific Data
- Sales events tagged with store_id
- Learning adjustments per store
- Store-specific confidence levels
- Store-specific ordering patterns

### Shared Learning (Optional)
- Option to learn from all stores
- Weighted by store size/volume
- Configurable per business

---

## Vendor Management

### Vendor Scoping
- Business-wide vendors (default)
- Store-specific vendors (optional)
- Vendor visibility based on scope

### Vendor Formatting
- Store-specific formatting rules (optional)
- Business-wide defaults
- Override per store if needed

---

## User Permissions & Stores

### Store Access
- Users can have access to:
  - All stores (default for Owner/Manager)
  - Specific stores (Staff)
- Store access enforced via RLS
- Store selector filtered by access

### Role Extensions
- Store Manager (store-specific Manager)
- Store Staff (store-specific Staff)
- Business Owner (all stores)

---

## Migration Path

### Single-Store to Multi-Store
1. Business adds first additional store
2. Existing data remains store-agnostic or assigned to default store
3. New data requires store selection
4. Gradual migration of historical data (optional)

### Data Migration
- Assign existing orders to default store
- Assign existing sales data to default store
- Vendors remain business-wide (can be made store-specific later)

---

## UI/UX Considerations

### Store Selector
- Prominent in top bar
- Shows current store name
- Dropdown for switching
- Clear indication when multi-store

### Store Context Indicators
- Page titles include store name (when multi-store)
- Breadcrumbs show store
- Filters default to current store

### Empty States
- Store-specific empty states
- Option to view all stores
- Clear store context

---

## API Considerations

### Store in Requests
- Store ID in headers or route params
- Required for store-scoped endpoints
- Optional for business-scoped endpoints

### Store in Responses
- Store context included where relevant
- Store ID in order/vendor/product responses
- Store filtering in list endpoints

---

## MVP vs Later

### MVP
- Single-store only
- Architecture supports future extension
- No store_id in data model yet
- Business context only

### Phase 1 (Post-MVP)
- Add store model
- Store selection UI
- Store-scoped orders
- Store-specific data

### Phase 2
- Multi-store ordering
- Cross-store analytics
- Shared learning options
- Advanced store management

---

## Success Criteria
- Single-store remains simple
- Multi-store doesn't complicate single-store
- Store isolation is strict
- Migration path is clear
- Users understand store context

---

## Summary
Multi-store support exists to:
- Serve growing businesses
- Maintain simplicity for single-store
- Enable future expansion
- Support real-world business structures

If multi-store complicates single-store, the design is wrong.
If store context is ambiguous, it must be made explicit.
