# Suppli — Integrations

## Purpose of This Document
This document defines Suppli's integration strategy, supported third-party services, and patterns for adding new integrations.
Integrations extend Suppli's capabilities without requiring users to manually transfer data.

Integrations must be **reliable, secure, and optional**.

---

## Core Principles
1. **Integrations enhance, never replace core functionality**
2. **Read-only access preferred**
3. **Failures don't block core workflows**
4. **User controls what connects**
5. **Data privacy is paramount**

---

## Integration Categories

### Sales Data Sources
- POS systems
- E-commerce platforms
- Manual uploads (always available)

### Communication
- Email (for sending orders)
- SMS (future)

### Vendor Systems
- Vendor portals (future)
- EDI systems (future)

---

## POS Integrations (MVP+)

### Supported Systems (Planned)

#### Square
- OAuth-based connection
- Read-only access to sales data
- Daily sync of item-level sales
- Manual refresh available

#### Clover
- API key-based connection
- Sales data import
- Transaction-level data

#### Toast (Future)
- OAuth connection
- Sales data sync

---

## Integration Architecture

### Connection Model
Each integration has:
- Connection status (connected, disconnected, error)
- Last sync timestamp
- Sync frequency
- Error history

### Data Flow
1. User initiates connection
2. OAuth flow (where applicable)
3. Store credentials securely
4. Schedule sync jobs
5. Import data to Suppli
6. Map to Suppli products

---

## OAuth Integration Pattern

### Flow
1. User clicks "Connect [Service]"
2. Redirect to service OAuth page
3. User authorizes
4. Callback with authorization code
5. Exchange for access token
6. Store token securely (encrypted)
7. Test connection
8. Enable sync

### Token Management
- Tokens stored encrypted
- Refresh tokens handled automatically
- Token expiration handled gracefully
- Re-authentication flow when needed

---

## Data Mapping

### Product Mapping
- Map external SKU/ID to Suppli product
- Handle unmapped products
- Allow manual mapping
- Save mapping for future syncs

### Sales Data Mapping
- Date/time mapping
- Quantity mapping
- Product identifier mapping
- Category mapping (optional)

---

## Sync Strategies

### Scheduled Sync
- Daily automatic sync
- Configurable time
- Background processing
- Error notifications

### Manual Sync
- User-triggered refresh
- Immediate processing
- Progress indicator
- Success/failure feedback

### Incremental Sync
- Only fetch new data
- Track last sync timestamp
- Handle gaps gracefully

---

## Error Handling

### Connection Errors
- Network failures
- Authentication failures
- Rate limiting
- Service unavailability

### Data Errors
- Invalid data formats
- Missing required fields
- Mapping failures
- Duplicate detection

### Error Response
- Log errors
- Notify user (non-blocking)
- Allow retry
- Fall back to manual upload

---

## Security Considerations

### Credential Storage
- Encrypt at rest
- Never log credentials
- Use secure secret management
- Rotate credentials periodically

### Access Scopes
- Request minimum required permissions
- Read-only when possible
- Document required permissions
- User must understand what's shared

### Data Privacy
- Only fetch necessary data
- No cross-tenant data sharing
- Comply with data protection regulations
- User can disconnect anytime

---

## Integration Status UI

### Connection Status
- Connected (green)
- Disconnected (gray)
- Error (amber/red)
- Syncing (loading)

### Status Details
- Last sync time
- Next sync time
- Error messages (if any)
- Sync history

### Actions
- Connect
- Disconnect
- Sync now
- View sync history
- Edit mapping

---

## MVP vs Later

### MVP
- Manual CSV/Excel upload
- Basic POS connection (Square or Clover)
- Simple product mapping
- Manual sync only

### Later
- Multiple POS integrations
- Automatic scheduled sync
- Advanced product mapping
- Vendor portal integrations
- Email integration for sending
- Webhook support

---

## Integration Testing

### Test Scenarios
- Successful connection
- Connection failure
- Token expiration
- Data mapping
- Sync errors
- Partial data import

### Test Accounts
- Maintain test accounts for each service
- Test with real data (sanitized)
- Test error scenarios

---

## User Experience

### Onboarding
- Clear explanation of benefits
- Step-by-step connection flow
- Preview of data to be imported
- Easy disconnect option

### Ongoing Use
- Sync status visible
- Errors clearly communicated
- Manual sync always available
- No blocking on integration failures

---

## API Integration Patterns

### REST APIs
- Standard HTTP methods
- Rate limiting respect
- Retry with exponential backoff
- Idempotent operations

### Webhooks (Future)
- Receive real-time updates
- Verify webhook signatures
- Handle duplicate events
- Process asynchronously

---

## Success Criteria
- Users can connect integrations easily
- Integrations work reliably
- Failures don't block core workflows
- Data mapping is accurate
- Users trust the integration

---

## Summary
Integrations exist to:
- Reduce manual data entry
- Improve accuracy
- Save time
- Enhance value

If an integration is unreliable, it should be optional.
If an integration blocks core workflows, it must be fixed or disabled.
