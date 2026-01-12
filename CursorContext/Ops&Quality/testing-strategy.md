# Suppli — Testing Strategy

## Purpose of This Document
This document defines Suppli's testing strategy, test types, coverage goals, and testing practices.
Testing exists to **prevent bugs, maintain quality, and enable confident refactoring**.

Testing is not optional—it is essential for a system that handles financial decisions.

---

## Core Principles
1. **Test behavior, not implementation**
2. **Fast feedback loops**
3. **Tests prevent regressions**
4. **Tests document expected behavior**
5. **Balance coverage with velocity**

---

## Testing Pyramid

### Unit Tests (Base)
- Most tests
- Fast execution
- Test individual functions/components
- Isolated from dependencies

### Integration Tests (Middle)
- Fewer tests
- Test component interactions
- Test API endpoints
- Test database interactions

### End-to-End Tests (Top)
- Fewest tests
- Test critical user flows
- Slow execution
- High confidence

---

## Unit Testing

### Frontend Unit Tests

#### What to Test
- Component rendering
- User interactions
- State changes
- Form validation
- Utility functions

#### Tools
- **Vitest** (recommended with Vite)
- React Testing Library
- Jest (alternative)

#### Example
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Backend Unit Tests

#### What to Test
- Domain logic
- Validation functions
- Utility functions
- Business rules
- Error handling

#### Tools
- **Vitest** or **Jest**
- Mock external dependencies

#### Example
```typescript
import { describe, it, expect } from 'vitest';
import { calculateOrderQuantity } from './orderGeneration';

describe('calculateOrderQuantity', () => {
  it('returns conservative quantity with no data', () => {
    const result = calculateOrderQuantity({ salesData: [] });
    expect(result).toBeLessThanOrEqual(10);
  });
});
```

---

## Integration Testing

### API Integration Tests

#### What to Test
- Endpoint behavior
- Request/response formats
- Error handling
- Authentication/authorization
- Database interactions

#### Tools
- **Vitest** or **Jest**
- Test database (separate from production)
- API testing utilities

#### Example
```typescript
import { describe, it, expect } from 'vitest';
import { createTestClient } from './testUtils';

describe('POST /api/v1/orders/generate', () => {
  it('generates order with valid input', async () => {
    const client = createTestClient();
    const response = await client.post('/api/v1/orders/generate', {
      orderPeriodStart: '2026-01-01',
      orderPeriodEnd: '2026-01-07',
    });
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('orderId');
  });
});
```

### Database Integration Tests

#### What to Test
- RLS policies
- Data isolation
- Query correctness
- Migration integrity

#### Tools
- Test database
- Supabase test client
- Migration testing

---

## End-to-End Testing

### Critical User Flows

#### What to Test
- User onboarding
- Order generation
- Order approval
- Invoice upload
- Vendor creation

#### Tools
- **Playwright** (recommended)
- Cypress (alternative)
- Browser automation

#### Example
```typescript
import { test, expect } from '@playwright/test';

test('user can generate and approve order', async ({ page }) => {
  await page.goto('/orders');
  await page.click('text=Generate Orders');
  await page.fill('[name="orderPeriodStart"]', '2026-01-01');
  await page.fill('[name="orderPeriodEnd"]', '2026-01-07');
  await page.click('text=Generate');
  await page.waitForSelector('text=Needs Review');
  await page.click('text=Approve Order');
  await expect(page.locator('text=Approved')).toBeVisible();
});
```

---

## Test Coverage Goals

### Coverage Targets
- **Unit tests**: 80%+ coverage
- **Integration tests**: Critical paths covered
- **E2E tests**: Critical user flows covered

### What to Prioritize
- Business logic (high coverage)
- Financial operations (high coverage)
- User-facing features (high coverage)
- Utilities (moderate coverage)
- UI components (moderate coverage)

### What NOT to Test
- Third-party library code
- Framework code
- Trivial getters/setters
- Generated code

---

## Test Organization

### File Structure
```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx
  services/
    ordersService.ts
    ordersService.test.ts
  domain/
    orderGeneration.ts
    orderGeneration.test.ts
tests/
  integration/
    api.test.ts
  e2e/
    orders.spec.ts
```

### Naming Conventions
- Test files: `*.test.ts` or `*.spec.ts`
- Describe blocks: Describe the unit under test
- Test names: Describe the behavior being tested

---

## Test Data Management

### Test Fixtures
- Reusable test data
- Factory functions for entities
- Seed data for integration tests

### Test Database
- Separate test database
- Reset between tests
- Isolated from production

### Mocking Strategy
- Mock external services (Stripe, etc.)
- Mock file uploads
- Mock time (for date-dependent tests)

---

## Testing Best Practices

### Test Isolation
- Tests don't depend on each other
- Tests can run in any order
- Tests clean up after themselves

### Test Readability
- Clear test names
- Arrange-Act-Assert pattern
- Minimal setup
- Focused assertions

### Test Maintainability
- DRY (Don't Repeat Yourself)
- Reusable test utilities
- Update tests when behavior changes
- Remove obsolete tests

---

## Continuous Integration

### Pre-Commit
- Linting
- Type checking
- Quick unit tests

### CI Pipeline
- Run all tests
- Generate coverage reports
- Fail on coverage drop
- Block merge on test failures

### Test Execution
- Fast feedback (<5 minutes for full suite)
- Parallel test execution
- Cached dependencies

---

## Testing Critical Paths

### Must Have Tests

#### Order Generation
- Conservative quantities with no data
- Quantity calculation with sales data
- Promo impact on quantities
- Confidence levels

#### Order Approval
- Approval workflow
- Status transitions
- Authorization checks
- Audit logging

#### Invoice Verification
- Invoice parsing
- Order matching
- Mismatch detection
- Resolution workflow

#### Multi-Tenant Isolation
- RLS policies
- Cross-tenant access prevention
- Business context enforcement

---

## Performance Testing (Future)

### Load Testing
- API endpoint performance
- Concurrent user handling
- Database query performance

### Stress Testing
- System limits
- Failure scenarios
- Recovery procedures

---

## Accessibility Testing

### Automated
- axe DevTools
- Lighthouse
- WAVE

### Manual
- Keyboard navigation
- Screen reader testing
- Color contrast verification

---

## Security Testing

### What to Test
- Authentication bypass attempts
- Authorization checks
- SQL injection prevention
- XSS prevention
- CSRF protection

### Tools
- Security scanning tools
- Penetration testing (later)
- Dependency vulnerability scanning

---

## MVP vs Later

### MVP
- Unit tests for core logic
- Integration tests for critical paths
- Basic E2E tests for key flows
- Manual testing for edge cases

### Later
- Comprehensive test coverage
- Advanced E2E scenarios
- Performance testing
- Security testing
- Visual regression testing

---

## Test Maintenance

### Keeping Tests Updated
- Update tests when features change
- Remove obsolete tests
- Refactor tests when needed
- Document test purpose

### Test Debt
- Address flaky tests immediately
- Fix broken tests before new features
- Refactor slow tests
- Improve test coverage gaps

---

## Success Criteria
- Tests prevent regressions
- Tests run quickly (<5 min)
- Tests are maintainable
- Coverage meets targets
- CI/CD blocks bad code

---

## Summary
Testing strategy exists to:
- Prevent bugs
- Maintain quality
- Enable refactoring
- Build confidence

If tests are slow, optimize them.
If tests are flaky, fix them.
If tests don't catch bugs, improve them.
