# Suppli — Observability

## Purpose of This Document
This document defines Suppli's observability strategy: logging, monitoring, alerting, and debugging capabilities.
Observability ensures we can understand system behavior, diagnose issues, and maintain reliability.

Observability is **essential for production systems** and must be built in from the start.

---

## Core Principles
1. **Logs are structured and searchable**
2. **Metrics track what matters**
3. **Alerts are actionable**
4. **Debugging is possible without production access**
5. **Privacy is maintained (no PII in logs)**

---

## Observability Pillars

### Logs
- What happened and when
- Structured JSON logs
- Searchable and filterable
- Retained for debugging

### Metrics
- System performance
- Business metrics
- User behavior (aggregated)
- Error rates

### Traces (Future)
- Request flow through system
- Performance bottlenecks
- Distributed system debugging

---

## Logging Strategy

### Log Levels
- **ERROR**: System errors, failures
- **WARN**: Warnings, recoverable issues
- **INFO**: Important events, state changes
- **DEBUG**: Detailed debugging information

### What to Log

#### Must Log
- API requests (method, path, status, duration)
- Errors and exceptions
- Authentication events
- Authorization failures
- Critical business events (order generated, approved, etc.)
- Database errors
- External service failures

#### Should Log
- User actions (aggregated, not PII)
- Performance metrics
- Cache hits/misses
- Background job execution

#### Must NOT Log
- Passwords
- Tokens (JWTs, API keys)
- Full request/response bodies (sensitive data)
- PII beyond user_id and business_id
- File contents

---

## Structured Logging

### Log Format
```json
{
  "timestamp": "2026-01-15T10:30:00Z",
  "level": "INFO",
  "service": "api",
  "request_id": "uuid",
  "user_id": "uuid",
  "business_id": "uuid",
  "message": "Order approved",
  "metadata": {
    "order_id": "uuid",
    "action": "approve"
  }
}
```

### Benefits
- Searchable by fields
- Filterable by context
- Aggregatable for analytics
- Parseable by tools

---

## Log Aggregation

### Platform (MVP)
- **Option 1**: Supabase Logs (built-in)
- **Option 2**: Simple file logging + rotation
- **Option 3**: Cloud logging service (Datadog, LogRocket, etc.)

### Requirements
- Centralized log storage
- Search capabilities
- Retention policy (30 days minimum)
- Access control

---

## Metrics & Monitoring

### System Metrics

#### Application Metrics
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (errors/requests)
- Active users
- Database query performance

#### Infrastructure Metrics
- CPU usage
- Memory usage
- Disk usage
- Network traffic

### Business Metrics

#### User Engagement
- Daily active users
- Weekly active users
- Orders generated per day
- Orders approved per day

#### Quality Metrics
- Edit rate (edits per order)
- Approval rate
- Invoice mismatch rate
- Confidence distribution

#### Performance Metrics
- Order generation time
- Page load times
- API response times
- Database query times

---

## Monitoring Tools

### MVP Options
- **Supabase Dashboard**: Built-in metrics
- **Simple monitoring**: Custom dashboards
- **Error tracking**: Sentry (recommended)

### Later Options
- **Datadog**: Full observability platform
- **New Relic**: APM and monitoring
- **Grafana**: Custom dashboards
- **Prometheus**: Metrics collection

---

## Alerting Strategy

### Alert Levels

#### Critical
- System down
- Database unavailable
- High error rate (>5%)
- Security incidents

#### Warning
- Elevated error rate (2-5%)
- Performance degradation
- Integration failures
- Backup failures

#### Info
- Deployment notifications
- Scheduled maintenance
- Feature flag changes

### Alert Channels
- Email (for critical)
- Slack (for team)
- PagerDuty (for on-call, future)
- In-app notifications (for users, if needed)

### Alert Rules
- Avoid alert fatigue
- Actionable alerts only
- Clear alert messages
- Runbook for each alert

---

## Error Tracking

### Error Tracking Tool
- **Sentry** (recommended for MVP)
- Tracks exceptions
- Provides stack traces
- Groups similar errors
- Shows error frequency

### What to Track
- Unhandled exceptions
- API errors
- Frontend errors
- Database errors
- External service errors

### Error Context
- User ID (non-PII)
- Business ID
- Request context
- Browser/device info (frontend)
- Stack traces

---

## Performance Monitoring

### Key Performance Indicators (KPIs)

#### API Performance
- Response time percentiles
- Throughput
- Error rate
- Database query time

#### Frontend Performance
- Page load time
- Time to interactive
- First contentful paint
- Core Web Vitals

### Performance Budgets
- API: <200ms p95
- Page load: <2s
- Database queries: <100ms p95

---

## Debugging Capabilities

### Request Tracing
- Unique request ID per request
- Trace ID through system
- Log correlation
- Request/response logging (sanitized)

### Debug Mode
- Enhanced logging in development
- Detailed error messages
- Stack traces
- Request/response dumps (sanitized)

### Production Debugging
- Structured logs searchable
- Error tracking with context
- Metrics for performance
- No sensitive data exposure

---

## Privacy & Security

### Data Protection
- No PII in logs (beyond IDs)
- No tokens in logs
- No file contents in logs
- Encrypted log storage

### Access Control
- Log access restricted
- Audit log access
- Role-based access
- Retention policies

---

## Dashboard Requirements

### Operational Dashboard
- System health
- Error rates
- Response times
- Active users
- Recent deployments

### Business Dashboard
- Orders generated
- Orders approved
- User activity
- Quality metrics

### Custom Dashboards (Later)
- Per-business metrics (internal only)
- Feature usage
- A/B test results

---

## Log Retention

### Retention Policy
- **Production logs**: 30 days minimum
- **Error logs**: 90 days
- **Audit logs**: Indefinite (per requirements)
- **Debug logs**: 7 days

### Storage Considerations
- Log rotation
- Compression
- Archival for long-term
- Cost management

---

## MVP vs Later

### MVP
- Structured logging
- Basic error tracking (Sentry)
- Simple metrics (Supabase dashboard)
- Manual alerting
- 30-day log retention

### Later
- Advanced log aggregation
- Custom dashboards
- Automated alerting
- Distributed tracing
- Advanced analytics
- Real-time monitoring

---

## Success Criteria
- Issues are diagnosable from logs
- Performance is monitored
- Errors are tracked and alerted
- Debugging is possible without production access
- Privacy is maintained

---

## Summary
Observability exists to:
- Understand system behavior
- Diagnose issues quickly
- Maintain reliability
- Improve over time

If you can't debug an issue, observability is insufficient.
If alerts are noisy, they need tuning.
If logs expose sensitive data, they need sanitization.
