# Suppli — API Contracts

## Purpose of This Document
This document defines Suppli’s API contracts: endpoint structure, request/response conventions, error formats, and versioning rules.
Its goal is to keep frontend and backend tightly aligned, predictable, and safe for iteration.

This is a **contract**, not an implementation guide.

---

## Core Principles
1. **Explicit over implicit**
2. **Consistent shapes everywhere**
3. **Validation at the edge**
4. **Human-readable errors**
5. **Backward compatibility by default**

---

## API Versioning
- Base path includes version: `/api/v1`
- Breaking changes require a new version
- Non-breaking additions are allowed within a version

Example:
/api/v1/orders

yaml
Copy code

---

## Authentication
- All endpoints require authentication unless explicitly public
- JWT provided via `Authorization: Bearer <token>`
- Business context provided via header or route param

Example header:
X-Business-Id: <uuid>

yaml
Copy code

Requests without valid auth or business context are rejected.

---

## Standard Request Conventions

### Content Types
- JSON for all requests and responses
- File uploads use `multipart/form-data`

### IDs
- All IDs are UUIDs
- IDs are opaque to clients

---

## Standard Response Envelope

### Success
```json
{
  "data": { }
}
List Responses
json
Copy code
{
  "data": [ ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 120
  }
}
Standard Error Envelope
json
Copy code
{
  "error": {
    "code": "ORDER_NOT_APPROVED",
    "message": "This order must be approved before sending."
  }
}
Rules:

code is stable and machine-readable

message is human-readable

No stack traces or internal details

Orders API
Generate Order
bash
Copy code
POST /api/v1/orders/generate
Request:

json
Copy code
{
  "orderPeriodStart": "2026-01-01",
  "orderPeriodEnd": "2026-01-07"
}
Response:

json
Copy code
{
  "data": {
    "orderId": "uuid",
    "status": "needs_review"
  }
}
Get Orders
bash
Copy code
GET /api/v1/orders
Query Params:

status

vendorId

dateFrom

dateTo

Get Order Detail
bash
Copy code
GET /api/v1/orders/{orderId}
Update Order Line Quantity
bash
Copy code
PATCH /api/v1/orders/{orderId}/lines/{lineId}
Request:

json
Copy code
{
  "finalQuantity": 12
}
Approve Order
bash
Copy code
POST /api/v1/orders/{orderId}/approve
Send / Export Order
bash
Copy code
POST /api/v1/orders/{orderId}/send
Request:

json
Copy code
{
  "vendorId": "uuid",
  "method": "email"
}
Vendors API
Create Vendor
bash
Copy code
POST /api/v1/vendors
Update Vendor
bash
Copy code
PATCH /api/v1/vendors/{vendorId}
List Vendors
bash
Copy code
GET /api/v1/vendors
Sales Data API
Upload Sales Data
swift
Copy code
POST /api/v1/sales/import
multipart/form-data

Async processing

Response:

json
Copy code
{
  "data": {
    "importId": "uuid",
    "status": "processing"
  }
}
Promotions API
Create Promotion
bash
Copy code
POST /api/v1/promotions
Invoices API
Upload Invoice
bash
Copy code
POST /api/v1/invoices
Get Invoice Detail
bash
Copy code
GET /api/v1/invoices/{invoiceId}
Validation Rules
All inputs validated using Zod

Validation errors return 400 with field-level details

Business rules return 409 or 422

Example validation error:

json
Copy code
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "finalQuantity must be greater than or equal to 0"
  }
}
Idempotency
Mutating endpoints should support idempotency keys

Prevents duplicate submissions

Header:

makefile
Copy code
Idempotency-Key: <uuid>
Pagination
Cursor or page-based pagination (consistent per endpoint)

Default page size enforced server-side

Deprecation Policy
Deprecated endpoints are documented

Removal requires a major version bump

MVP vs Later
MVP
Core order, vendor, data ingestion endpoints

Manual exports

Basic pagination

Later
Webhooks

Bulk endpoints

GraphQL read layer (optional)

Success Criteria
Frontend never guesses response shapes

Errors are predictable and actionable

API changes do not break existing clients

Summary
Suppli’s API contracts exist to:

Protect correctness

Enable parallel frontend/backend work

Prevent accidental breaking changes

If an endpoint’s behavior is ambiguous, the contract must be clarified before implementation.