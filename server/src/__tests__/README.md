# Testing Guide

## Overview

This directory contains tests for the Suppli backend API. Tests are organized by type and feature.

## Test Structure

```
__tests__/
  ├── api/              # API endpoint integration tests
  ├── helpers/          # Test utilities and setup
  └── ...

domain/
  └── orders/
      └── __tests__/    # Domain logic unit tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test
# Press 'a' to run all tests
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests once (CI mode)
```bash
npm run test:run
```

### Generate coverage report
```bash
npm run test:coverage
```

## Test Types

### Unit Tests
- Test individual functions and logic
- Located in `domain/**/__tests__/`
- Fast execution, no external dependencies

### Integration Tests
- Test API endpoints and database interactions
- Located in `__tests__/api/`
- May require test database setup

## Writing Tests

### Example Unit Test
```typescript
import { describe, it, expect } from 'vitest';
import { calculateQuantity } from '../quantity-calculator';

describe('calculateQuantity', () => {
  it('returns conservative default with no data', () => {
    const result = calculateQuantity({});
    expect(result).toBeGreaterThan(0);
  });
});
```

### Example Integration Test
```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

describe('POST /api/v1/orders/generate', () => {
  it('requires authentication', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/v1/orders/generate')
      .send({ orderPeriodStart: '2026-01-01' });
    
    expect(response.status).toBe(401);
  });
});
```

## Test Database

For integration tests that require database access:

1. Set up a test Supabase project
2. Run migrations on test database
3. Use test environment variables
4. Clean up test data between tests

## Mocking

- Mock external services (Supabase, Stripe)
- Use test factories for test data
- Mock time for date-dependent tests

## Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Keep tests isolated**
4. **Clean up after tests**
5. **Test edge cases and error scenarios**

## Coverage Goals

- Unit tests: 80%+ coverage
- Integration tests: Critical paths covered
- Focus on business logic and financial operations
