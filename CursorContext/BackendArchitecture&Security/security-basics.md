# Suppli — Security Basics

## Purpose of This Document
This document defines Suppli’s baseline security posture and non-negotiable security practices.
It exists to prevent common failures, reduce attack surface, and ensure user trust—especially in a system that handles financial operations and sensitive business data.

This is **defensive engineering**, not compliance theater.

---

## Core Security Principles
1. **Least privilege by default**
2. **Defense in depth**
3. **Assume inputs are hostile**
4. **Secure by default, configurable later**
5. **Prevent catastrophic failure before optimizing convenience**

---

## Threat Model (MVP Scope)

Suppli must protect against:
- Cross-tenant data access
- Unauthorized actions (privilege escalation)
- Malicious file uploads
- Injection attacks
- Credential leakage
- Accidental destructive actions

Suppli does not attempt to solve:
- Nation-state attacks
- Zero-day browser exploits
- Insider threats beyond role enforcement (MVP)

---

## Authentication Security

### Supabase Auth
- Supabase manages password storage and hashing
- JWTs are short-lived
- Refresh tokens handled by Supabase

Rules:
- Never store passwords in Suppli
- Never log JWTs
- Never expose service role keys to the client

---

## Authorization Security

### Role Enforcement
- Enforced at UI, API, and RLS layers
- API must never trust UI enforcement
- RLS is the final authority

Rules:
- Missing role = no access
- Ambiguous permissions default to deny

---

## Multi-Tenant Isolation

### Business Isolation
- Every table includes `business_id`
- RLS enforced on all tenant-scoped tables
- No shared mutable data between businesses

Rules:
- No “admin override” paths in MVP
- Service role bypass used only for background jobs

---

## API Security

### Input Validation
- All inputs validated using Zod
- No implicit type coercion
- Reject unknown fields

---

### Rate Limiting
- Rate limit all authenticated endpoints
- Stricter limits on:
  - File uploads
  - Order generation
  - Authentication-related routes

Purpose:
- Prevent abuse
- Prevent accidental runaway requests

---

### Idempotency
- Required for mutating endpoints
- Prevents duplicate submissions
- Especially important for:
  - Order generation
  - Payments
  - File uploads

---

## File Upload Security

### Accepted Files
- Explicit allowlist of file types
- Maximum file size enforced

### Processing Rules
- Files scanned and validated
- Stored in Supabase Storage
- Access scoped by business_id

Rules:
- Never execute uploaded files
- Never trust file metadata alone
- Never expose raw storage paths publicly

---

## Database Security

### Row Level Security
- Enabled on all tables
- No exceptions
- Tested explicitly

### Constraints
- Foreign keys enforced
- NOT NULL where applicable
- Enum constraints for state fields

---

## Secrets Management

Rules:
- Secrets stored in environment variables
- Never committed to source control
- Rotated periodically

Secrets include:
- Supabase service role key
- Stripe secret keys
- API keys for integrations

---

## Logging & Sensitive Data

### What Can Be Logged
- Error codes
- Entity IDs
- business_id
- user_id (non-PII)

### What Must NOT Be Logged
- Passwords
- Tokens
- Full invoice contents
- File contents
- Payment details

Logs are treated as sensitive data.

---

## UI-Level Safeguards

### Destructive Actions
- Require confirmation
- Clear labeling
- No ambiguous buttons

### Financial Actions
- Explicit approval steps
- No background auto-sending in MVP

---

## Background Jobs Security

Rules:
- Use service role only where required
- Validate inputs even in jobs
- Jobs are idempotent
- Job failures are logged and visible

---

## Dependency Security

Rules:
- Keep dependencies minimal
- Avoid unmaintained packages
- Audit dependencies regularly

---

## MVP vs Later

### MVP
- Baseline security controls
- Manual audits
- Conservative defaults

### Later
- Automated security scans
- Penetration testing
- Fine-grained audit alerts
- Compliance tooling (SOC2 readiness)

---

## Incident Response (MVP-Light)

If a security issue is detected:
1. Disable affected functionality
2. Protect tenant boundaries
3. Investigate using audit logs
4. Communicate clearly if user impact exists

---

## Success Criteria
- No cross-tenant data leaks
- No unauthorized state changes
- No silent failures
- Security issues fail closed, not open

---

## Summary
Security in Suppli exists to:
- Protect user trust
- Prevent irreversible mistakes
- Enable safe growth

If security slows development, it is doing its job.
If security is invisible to users, it is doing its job even better.
