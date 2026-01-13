# Suppli — API Contracts & Validation Guide

## Overview

This document describes Suppli's API contracts, validation standards, and response formats. All API endpoints follow consistent patterns for requests, responses, and error handling.

---

## API Versioning

All API endpoints are versioned under `/api/v1`:

```
GET /api/v1/orders
POST /api/v1/vendors
```

Breaking changes require a new version (e.g., `/api/v2`).

---

## Authentication

All protected endpoints require:

1. **JWT Token** in `Authorization` header:
   ```
   Authorization: Bearer <jwt_token>
   ```

2. **Business Context** via one of:
   - Header: `X-Business-Id: <business_uuid>`
   - Query param: `?business_id=<business_uuid>`
   - Request body: `{ "business_id": "<business_uuid>", ... }`

See `docs/AUTHENTICATION.md` for detailed authentication flow.

---

## Standard Response Formats

### Success Response

Single resource:
```json
{
  "data": {
    "id": "uuid",
    "name": "Example"
  }
}
```

List response:
```json
{
  "data": [
    { "id": "uuid-1", "name": "Item 1" },
    { "id": "uuid-2", "name": "Item 2" }
  ]
}
```

Paginated response:
```json
{
  "data": [
    { "id": "uuid-1", "name": "Item 1" }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "totalPages": 4
  }
}
```

### Error Response

All errors follow this format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name is required"
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR` (400) - Invalid input data
- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Business rule violation
- `INTERNAL_SERVER_ERROR` (500) - Unexpected server error

---

## Validation

All API inputs are validated using [Zod](https://zod.dev/) schemas. Validation occurs before controller logic executes.

### Validation Middleware

Use the validation middleware to validate request data:

```typescript
import { validateBody, validateQuery, validateParams } from './middleware';
import { z } from 'zod';

// Validate request body
app.post('/api/v1/example', 
  validateBody(z.object({
    name: z.string().min(1),
    email: z.string().email(),
  })),
  handler
);

// Validate query parameters
app.get('/api/v1/example',
  validateQuery(z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
  })),
  handler
);

// Validate route parameters
app.get('/api/v1/example/:id',
  validateParams(z.object({
    id: z.string().uuid(),
  })),
  handler
);

// Validate multiple
app.post('/api/v1/example/:id',
  validate({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({ name: z.string().min(1) }),
    query: z.object({ include: z.string().optional() }),
  }),
  handler
);
```

### Common Validation Schemas

Pre-built schemas are available in `server/src/validators/common.ts`:

```typescript
import { uuidSchema, dateSchema, paginationSchema, emailSchema } from './validators';

// UUID validation
const idSchema = uuidSchema;

// Date validation (YYYY-MM-DD)
const dateSchema = dateSchema;

// Pagination
const querySchema = paginationSchema;

// Email
const emailSchema = emailSchema;
```

### Validation Error Format

When validation fails, the error response includes a clear message:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "name: String must contain at least 1 character(s); email: Invalid email"
  }
}
```

For single field errors:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email: Invalid email"
  }
}
```

---

## Response Utilities

Use standard response utilities for consistent formatting:

```typescript
import { sendSuccess, sendPaginated } from './lib/response';

// Single resource
sendSuccess(res, { id: 'uuid', name: 'Example' });

// Paginated list
sendPaginated(res, items, {
  page: 1,
  pageSize: 25,
  total: 100,
  totalPages: 4,
});
```

---

## Common Patterns

### Pattern 1: Protected Endpoint with Validation

```typescript
app.post(
  '/api/v1/orders',
  verifyJWT,                    // 1. Authenticate
  resolveBusinessContext,       // 2. Resolve business
  requireManager,                // 3. Check role
  validateBody(orderSchema),     // 4. Validate input
  async (req: Request, res: Response) => {
    // Controller logic
    const order = await createOrder(req.body);
    sendSuccess(res, order, 201);
  }
);
```

### Pattern 2: List with Pagination

```typescript
app.get(
  '/api/v1/orders',
  verifyJWT,
  resolveBusinessContext,
  requireStaff,
  validateQuery(paginationSchema),
  async (req: Request, res: Response) => {
    const { page = 1, pageSize = 25 } = req.query;
    const { items, total } = await getOrders(page, pageSize);
    
    sendPaginated(res, items, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  }
);
```

### Pattern 3: Resource by ID

```typescript
app.get(
  '/api/v1/orders/:id',
  verifyJWT,
  resolveBusinessContext,
  requireStaff,
  validateParams(z.object({ id: uuidSchema })),
  async (req: Request, res: Response) => {
    const order = await getOrderById(req.params.id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    sendSuccess(res, order);
  }
);
```

---

## Error Handling

### Custom Error Classes

Use custom error classes for consistent error handling:

```typescript
import { ValidationError, NotFoundError, ConflictError } from './errors';

// Validation error (400)
throw new ValidationError('Name is required');

// Not found (404)
throw new NotFoundError('Order not found');

// Conflict (409)
throw new ConflictError('Order already approved');
```

### Error Handler

The error handler middleware automatically formats errors:

```typescript
// Error handler (in app.ts)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if ('statusCode' in err && 'code' in err) {
    const appError = err as { statusCode: number; code: string; message: string };
    res.status(appError.statusCode).json({
      error: {
        code: appError.code,
        message: appError.message,
      },
    });
    return;
  }
  
  // Unexpected errors
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
});
```

---

## Testing Validation

### Test Valid Request

```bash
curl -X POST http://localhost:3001/api/v1/test-validation \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }'
```

**Response:**
```json
{
  "data": {
    "message": "Validation successful",
    "received": {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30
    }
  }
}
```

### Test Invalid Request

```bash
curl -X POST http://localhost:3001/api/v1/test-validation \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "email": "invalid-email"
  }'
```

**Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "name: String must contain at least 1 character(s); email: Invalid email"
  }
}
```

---

## Best Practices

1. **Always validate inputs** - Never trust client data
2. **Use common schemas** - Reuse validation schemas where possible
3. **Clear error messages** - Errors should guide users to fix issues
4. **Consistent responses** - Always use `sendSuccess` or `sendPaginated`
5. **Type safety** - Use TypeScript types derived from Zod schemas
6. **Fail fast** - Validate before processing business logic

---

## Next Steps

- See `docs/AUTHENTICATION.md` for authentication details
- See `server/src/validators/` for available validation schemas
- See `server/src/middleware/validation.ts` for validation middleware
- See `server/src/lib/response.ts` for response utilities
