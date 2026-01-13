# Suppli — Authentication & Authorization Guide

## Overview

Suppli uses Supabase Auth for authentication and implements role-based access control (RBAC) at the API layer. All protected endpoints require:

1. **Valid JWT token** (authentication)
2. **Business context** (multi-tenant isolation)
3. **Appropriate role** (authorization)

---

## Authentication Flow

### 1. User Login
Users authenticate via Supabase Auth (email/password or magic link). Supabase issues a JWT token.

### 2. API Request
Client sends JWT in `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### 3. Business Context
Client must also provide business context via one of:
- **Header** (preferred): `X-Business-Id: <business_uuid>`
- **Query parameter**: `?business_id=<business_uuid>`
- **Request body**: `{ "business_id": "<business_uuid>", ... }`

### 4. Middleware Chain
Request flows through middleware in order:
1. `verifyJWT` - Validates JWT and extracts `userId`
2. `resolveBusinessContext` - Validates business membership and extracts `role`
3. `requireRole(...)` - Enforces role-based access

### 5. Controller Access
If all middleware passes, controller receives request with:
- `req.userId` - Authenticated user ID
- `req.businessId` - Current business context
- `req.role` - User's role in this business

---

## Middleware

### `verifyJWT`
Verifies JWT token and extracts user ID.

**Usage:**
```typescript
import { verifyJWT } from './middleware';

app.get('/api/v1/protected', verifyJWT, (req, res) => {
  // req.userId is available
});
```

**Errors:**
- `401 UNAUTHORIZED` - Missing or invalid token

---

### `resolveBusinessContext`
Resolves business context and validates user membership.

**Usage:**
```typescript
import { verifyJWT, resolveBusinessContext } from './middleware';

app.get(
  '/api/v1/business-data',
  verifyJWT,
  resolveBusinessContext,
  (req, res) => {
    // req.userId, req.businessId, req.role are available
  }
);
```

**Errors:**
- `401 UNAUTHORIZED` - Missing business context or invalid format
- `403 FORBIDDEN` - User is not a member of the business

---

### `requireRole(...roles)`
Enforces role-based access control.

**Usage:**
```typescript
import { verifyJWT, resolveBusinessContext, requireRole } from './middleware';

// Owner only
app.post(
  '/api/v1/billing',
  verifyJWT,
  resolveBusinessContext,
  requireRole('owner'),
  (req, res) => {
    // Only owners can access
  }
);

// Owner or Manager
app.post(
  '/api/v1/orders',
  verifyJWT,
  resolveBusinessContext,
  requireRole('owner', 'manager'),
  (req, res) => {
    // Owners and managers can access
  }
);
```

**Convenience Middleware:**
- `requireOwner` - Owner only
- `requireManager` - Owner or Manager
- `requireStaff` - Owner, Manager, or Staff

**Errors:**
- `403 FORBIDDEN` - User's role is not in allowed roles

---

## Roles

### Owner
- Highest level of access
- Can manage billing, users, and all business settings
- Can approve and send orders
- Can delete vendors

### Manager
- Operational authority
- Can create/edit vendors
- Can generate and approve orders
- Can upload sales data and promotions
- Cannot manage billing or remove Owner

### Staff
- Limited operational access
- Can view orders and vendors
- Can edit order quantities (if permitted)
- Can upload invoices
- Cannot approve or send orders

---

## Error Responses

All authentication/authorization errors follow this format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization token"
  }
}
```

**Error Codes:**
- `UNAUTHORIZED` (401) - Authentication failed
- `FORBIDDEN` (403) - Authorization failed

---

## Example: Protected Endpoint

```typescript
import { verifyJWT, resolveBusinessContext, requireManager } from './middleware';
import { AuthRequest } from './types/auth';

app.get(
  '/api/v1/orders',
  verifyJWT,              // 1. Verify JWT
  resolveBusinessContext, // 2. Resolve business context
  requireManager,         // 3. Require Manager or Owner role
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    
    // Access authenticated context
    const userId = authReq.userId!;
    const businessId = authReq.businessId!;
    const role = authReq.role!;
    
    // Use businessId for data queries (RLS will enforce tenant isolation)
    // ...
  }
);
```

---

## Testing Authentication

### 1. Get JWT Token
```bash
# Using Supabase client (frontend)
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

const token = data.session?.access_token;
```

### 2. Test Protected Endpoint
```bash
curl -X GET http://localhost:3001/api/v1/test-auth \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-Business-Id: <business_uuid>"
```

### 3. Expected Response
```json
{
  "message": "Authentication successful",
  "userId": "user-uuid",
  "businessId": "business-uuid",
  "role": "manager"
}
```

---

## Security Notes

1. **Never trust the client** - Always verify JWT and business membership server-side
2. **RLS is the final enforcement** - Even if middleware passes, RLS policies prevent data leakage
3. **Business context is explicit** - Never infer business_id from user context
4. **Role changes take effect immediately** - Active sessions respect updated permissions

---

## Common Patterns

### Pattern 1: Owner-Only Endpoint
```typescript
app.post('/api/v1/billing', verifyJWT, resolveBusinessContext, requireOwner, handler);
```

### Pattern 2: Manager+ Endpoint
```typescript
app.post('/api/v1/orders', verifyJWT, resolveBusinessContext, requireManager, handler);
```

### Pattern 3: All Authenticated Users
```typescript
app.get('/api/v1/profile', verifyJWT, resolveBusinessContext, requireStaff, handler);
```

### Pattern 4: Public Endpoint (No Auth)
```typescript
app.get('/api/v1/public', handler); // No middleware
```

---

## Troubleshooting

### Error: "Missing or invalid authorization token"
- Check that `Authorization: Bearer <token>` header is present
- Verify token is not expired
- Ensure token is from Supabase Auth

### Error: "Business context required"
- Provide `X-Business-Id` header, `business_id` query param, or `business_id` in body
- Ensure business_id is a valid UUID

### Error: "User is not a member of this business"
- Verify user exists in `business_users` table for the given business_id
- Check that business_id matches the user's membership

### Error: "Access denied. Required role: owner"
- User's role in `business_users` table doesn't match required role
- Update user's role or use appropriate endpoint

---

## Next Steps

- See `CursorContext/BackendArchitecture&Security/auth-and-roles.md` for detailed role definitions
- See `server/src/middleware/` for middleware implementation
- See `server/src/types/auth.ts` for TypeScript types
