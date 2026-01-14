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

---

## Orders API Endpoints

### Generate Order

**POST** `/api/v1/orders/generate`

Generate order recommendations without saving to database. Returns recommendations that can be reviewed, edited, and then saved as draft or approved. The order is stored client-side (localStorage) until explicitly saved.

**Authentication:** Required (Manager or Owner)

**Request Body:**
```json
{
  "orderPeriodStart": "2026-01-01",
  "orderPeriodEnd": "2026-01-07",
  "mode": "guided",
  "vendorIds": ["uuid-1", "uuid-2"] // Optional
}
```

**Response:**
```json
{
  "data": {
    "recommendations": {
      "vendorOrders": [
        {
          "vendorId": "uuid",
          "vendorName": "Vendor Name",
          "orderLines": [
            {
              "productId": "uuid",
              "productName": "Product Name",
              "recommendedQuantity": 10.5,
              "finalQuantity": 10.5,
              "unitType": "unit",
              "confidenceLevel": "high",
              "explanation": "Based on recent sales data."
            }
          ]
        }
      ],
      "summary": {
        "totalProducts": 25,
        "highConfidence": 10,
        "moderateConfidence": 8,
        "needsReview": 7
      }
    },
    "summary": {
      "totalProducts": 25,
      "highConfidence": 10,
      "moderateConfidence": 8,
      "needsReview": 7
    }
  }
}
```

**Note:** This endpoint does NOT save the order to the database. Use `POST /api/v1/orders/draft` to save as draft, or approve directly from the UI.

---

### List Orders

**GET** `/api/v1/orders`

List orders with optional filters and pagination.

**Authentication:** Required (Staff, Manager, or Owner)

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `approved`, `sent`, `cancelled`)
  - Note: Legacy `needs_review` status is treated as `draft` for filtering
- `vendorId` (optional): Filter by vendor ID
- `dateFrom` (optional): Filter orders from date (YYYY-MM-DD)
- `dateTo` (optional): Filter orders to date (YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 25, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "business_id": "uuid",
      "order_period_start": "2026-01-01",
      "order_period_end": "2026-01-07",
      "status": "needs_review",
      "mode": "guided",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 50,
    "totalPages": 2
  }
}
```

---

### Get Order Detail

**GET** `/api/v1/orders/:id`

Get detailed information about a specific order, including vendor orders and order lines.

**Authentication:** Required (Staff, Manager, or Owner)

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "business_id": "uuid",
    "order_period_start": "2026-01-01",
    "order_period_end": "2026-01-07",
    "status": "needs_review",
    "mode": "guided",
    "vendor_orders": [
      {
        "id": "uuid",
        "vendor_id": "uuid",
        "vendors": {
          "name": "Vendor Name"
        },
        "order_lines": [
          {
            "id": "uuid",
            "product_id": "uuid",
            "recommended_quantity": 10.5,
            "final_quantity": 10.5,
            "unit_type": "unit",
            "confidence_level": "high",
            "explanation": "Based on recent sales data.",
            "products": {
              "name": "Product Name"
            }
          }
        ]
      }
    ]
  }
}
```

---

### Update Order Line Quantity

**PATCH** `/api/v1/orders/:id/lines/:lineId`

Update the final quantity for a specific order line. Creates an audit event.

**Authentication:** Required (Staff, Manager, or Owner)

**Request Body:**
```json
{
  "finalQuantity": 12.5
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "final_quantity": 12.5,
    "recommended_quantity": 10.5,
    "unit_type": "unit",
    "confidence_level": "high",
    "explanation": "Based on recent sales data."
  }
}
```

**Errors:**
- `404 NOT_FOUND` - Order or order line not found
- `400` - Cannot update sent or cancelled orders

---

### Save Draft Order

**POST** `/api/v1/orders/draft`

Save an order as a draft to the database. Accepts the full order structure including vendorOrders and orderLines. This endpoint is used after generating an order and making edits.

**Authentication:** Required (Manager or Owner)

**Request Body:**
```json
{
  "orderPeriodStart": "2026-01-01",
  "orderPeriodEnd": "2026-01-07",
  "mode": "guided",
  "vendorOrders": [
    {
      "vendorId": "uuid",
      "vendorName": "Vendor Name",
      "orderLines": [
        {
          "productId": "uuid",
          "recommendedQuantity": 10.5,
          "finalQuantity": 10.5,
          "unitType": "unit",
          "confidenceLevel": "high",
          "explanation": "Based on recent sales data."
        }
      ]
    }
  ],
  "summary": {
    "totalProducts": 25,
    "highConfidence": 10,
    "moderateConfidence": 8,
    "needsReview": 7
  },
  "orderId": "uuid" // Optional: for updating existing draft
}
```

**Response:**
```json
{
  "data": {
    "orderId": "uuid",
    "status": "draft",
    "summary": {
      "totalProducts": 25,
      "highConfidence": 10,
      "moderateConfidence": 8,
      "needsReview": 7
    }
  }
}
```

**Errors:**
- `400 VALIDATION_ERROR` - Invalid request body
- `401 UNAUTHORIZED` - Missing or invalid authentication

---

### Delete Order

**DELETE** `/api/v1/orders/:id`

Delete an order. Only allowed for orders with status `draft`, `cancelled`, or `approved`. Sent orders cannot be deleted.

**Authentication:** Required (Manager or Owner)

**Response:**
- `204 No Content` on success

**Errors:**
- `404 NOT_FOUND` - Order not found
- `400` - Cannot delete order with status `sent`
- `403 FORBIDDEN` - Insufficient permissions

---

### Approve Order

**POST** `/api/v1/orders/:id/approve`

Approve an order, changing status from `draft` (or legacy `needs_review`) to `approved`.

**Authentication:** Required (Manager or Owner)

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "approved",
    "approved_at": "2026-01-01T12:00:00Z",
    "approved_by": "user-uuid"
  }
}
```

**Errors:**
- `404 NOT_FOUND` - Order not found
- `400` - Order cannot be approved (wrong status)

---

### Send Order

**POST** `/api/v1/orders/:id/send`

Mark an order as sent, changing status from `approved` to `sent`.

**Authentication:** Required (Manager or Owner)

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "sent"
  }
}
```

**Errors:**
- `404 NOT_FOUND` - Order not found
- `400` - Order must be approved before sending

---

## Order State Transitions

Orders follow this state flow:

```
draft → approved → sent
  ↓         ↓
cancelled cancelled
```

**Rules:**
- Orders start as `draft` when generated (stored client-side) or saved via `/orders/draft`
- Only `draft` orders can be approved (legacy `needs_review` status is treated as `draft`)
- Only `approved` orders can be sent
- Orders can be deleted if status is `draft`, `cancelled`, or `approved` (not `sent`)
- Orders can be cancelled from any state (except `sent`)

**Note:** The `needs_review` status has been removed as an order status. It is now only used for order line confidence levels. Legacy orders with `needs_review` status are treated as `draft` for all operations.

---

## Payments API

### Create Checkout Session

**POST** `/api/v1/payments/checkout-session`

Creates a Stripe Checkout session for subscription signup.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "lookupKey": "starter-plan",
  "successUrl": "http://localhost:5173/payment-success",
  "cancelUrl": "http://localhost:5173/payment-cancelled",
  "customerEmail": "customer@example.com"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Errors:**
- `400 INVALID_INPUT` - Invalid request body
- `400 PRICE_NOT_FOUND` - Price lookup key not found
- `500 CHECKOUT_SESSION_ERROR` - Failed to create checkout session

### Create Billing Portal Session

**POST** `/api/v1/payments/billing-portal`

Creates a Stripe Billing Portal session for managing subscriptions.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "sessionId": "cs_test_...",
  "returnUrl": "http://localhost:5173/settings"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

**Errors:**
- `400 INVALID_INPUT` - Invalid request body
- `400 CUSTOMER_NOT_FOUND` - No customer on checkout session
- `500 PORTAL_SESSION_ERROR` - Failed to create portal session

### Webhook Endpoint

**POST** `/api/v1/webhooks/stripe`

Handles Stripe webhook events. Uses raw body for signature verification.

**Authentication:** None (uses Stripe signature verification)

**Webhook Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`

**Response:**
```json
{
  "received": true
}
```

**Errors:**
- `400` - Missing or invalid Stripe signature
- `500` - Webhook secret not configured

See `docs/STRIPE_INTEGRATION.md` for detailed Stripe integration documentation.

---

## Next Steps

- See `docs/AUTHENTICATION.md` for authentication details
- See `docs/ORDER_GENERATION.md` for order generation algorithm
- See `docs/STRIPE_INTEGRATION.md` for Stripe integration details
- See `server/src/validators/` for available validation schemas
- See `server/src/middleware/validation.ts` for validation middleware
- See `server/src/lib/response.ts` for response utilities
