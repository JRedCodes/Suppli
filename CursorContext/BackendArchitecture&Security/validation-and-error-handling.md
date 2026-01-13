# Suppli — Validation & Error Handling

## Purpose of This Document
This document defines Suppli’s validation and error-handling standards across frontend, API, domain, and database layers.
Its goal is to prevent unsafe actions, surface clear guidance to users, and ensure failures are predictable and recoverable.

Errors are not exceptional events — they are part of normal system behavior and must be designed.

---

## Core Principles
1. **Validate early**
2. **Fail fast, fail safely**
3. **Errors are user-facing, not developer-facing**
4. **One source of truth for rules**
5. **Never lose user work due to errors**

---

## Validation Layers

Validation occurs at multiple layers, each with a specific responsibility.

### 1. Frontend Validation
Purpose:
- Improve UX
- Catch obvious issues early

Examples:
- Required fields
- Number ranges
- File size/type checks

Rules:
- Frontend validation is advisory
- Frontend validation never replaces backend validation
- Errors must be inline and actionable

---

### 2. API Validation (Required)
Purpose:
- Protect domain logic
- Enforce contract correctness

Implementation:
- Zod schemas for all inputs
- Validation occurs before controller logic

Rules:
- Invalid requests return 400
- Field-level errors preferred
- No partial execution on invalid input

---

### 3. Domain Validation
Purpose:
- Enforce business rules

Examples:
- Order must be reviewed before approval
- Quantity cannot be negative
- Vendor must exist before order generation

Rules:
- Domain errors are explicit
- Domain errors are intentional, not exceptions
- Domain logic never assumes valid state

---

### 4. Database Constraints
Purpose:
- Enforce invariants at the data layer

Examples:
- NOT NULL constraints
- Enum constraints
- Foreign keys

Rules:
- Database errors are caught and translated
- Raw DB errors are never returned to users

---

## Error Categories

### Validation Errors
- Invalid input
- Missing required fields
- Type mismatches

HTTP Status:
- 400 Bad Request

---

### Authorization Errors
- User lacks permission
- Role mismatch

HTTP Status:
- 403 Forbidden

---

### Authentication Errors
- Missing or invalid token
- Expired session

HTTP Status:
- 401 Unauthorized

---

### Domain Rule Violations
- Invalid state transitions
- Unsafe operations

HTTP Status:
- 409 Conflict or 422 Unprocessable Entity

---

### External Service Failures
- Stripe errors
- File storage issues
- OCR failures

HTTP Status:
- 502 Bad Gateway or 503 Service Unavailable

---

## Standard Error Response Shape

All API errors must follow this structure:

```json
{
  "error": {
    "code": "ORDER_INVALID_STATE",
    "message": "This order must be reviewed before approval."
  }
}
Rules:

code is stable and machine-readable

message is human-readable

No stack traces

No internal identifiers

Error Codes
Naming Convention
UPPER_SNAKE_CASE

Describes the problem, not the solution

Examples:

VALIDATION_ERROR

UNAUTHORIZED_ACTION

ORDER_NOT_APPROVED

VENDOR_MISSING_CONTACT

FILE_UPLOAD_FAILED

Error codes must be documented and reused.

User Messaging Rules
Errors should:

Explain what happened

Explain why it matters (if relevant)

Explain what to do next

Good:

“This order must be reviewed before approval.”

Bad:

“Invalid order state.”

Avoid:

Technical jargon

Blame language

Generic messages

Partial Failure Handling
Some operations may partially succeed.

Examples:

Sales data import with invalid rows

Invoice parsing with unreadable items

Rules:

Partial success is allowed

Failures are surfaced clearly

Successful parts are preserved

Example response:

json
Copy code
{
  "data": {
    "imported": 120,
    "failed": 8
  }
}
Retry & Recovery
Retriable Operations
File uploads

Background jobs

External service calls

Rules:

Idempotency keys supported

Safe retries only

No duplicate side effects

Logging & Debugging
What Gets Logged
Error code

Request context

business_id

user_id (if available)

What Does NOT Get Logged
Secrets

Raw file contents

PII beyond identifiers

Logs are for developers, not users.

Frontend Error Display
Rules:

Inline errors for form issues

Page-level errors for blocking issues

Toasts only for non-blocking notifications

Never:

Show raw error objects

Display error codes without explanation

MVP vs Later
MVP
Centralized error handling

Consistent API responses

Manual retries

Later
Error analytics

User-facing recovery suggestions

Automated retry policies

Success Criteria
Users understand what went wrong

Errors do not cause data loss

Developers can diagnose issues quickly

No silent failures

Summary
Validation and error handling exist to:

Protect the system

Protect user trust

Enable safe iteration

If an error is confusing, it is a design failure.
If an error is silent, it is a system failure.