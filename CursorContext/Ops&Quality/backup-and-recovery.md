# Suppli — Backup & Recovery

## Purpose of This Document
This document defines Suppli's backup strategy, recovery procedures, and data retention policies.
Backup and recovery exist to protect user data, ensure business continuity, and meet compliance requirements—without creating operational complexity.

Data loss is unacceptable. Recovery must be tested and reliable.

---

## Core Principles
1. **Automated backups are non-negotiable**
2. **Backups are tested regularly**
3. **Recovery time objectives are defined**
4. **User data is never permanently lost**
5. **Backups are encrypted and secure**

---

## Backup Strategy

### Database Backups (Supabase)
Supabase provides automated backups, but Suppli must verify and supplement as needed.

#### Automated Backups
- Daily full backups (retained for 7 days)
- Point-in-time recovery (PITR) available
- Backups stored in secure, encrypted storage

#### Manual Backup Triggers
- Before major migrations
- Before risky operations
- On-demand via admin tools

---

## What Gets Backed Up

### Critical Data (Must Back Up)
- All business data (orders, vendors, products)
- User accounts and business memberships
- Sales data and promotions
- Invoices and verification records
- Audit logs
- Learning adjustments

### Configuration Data
- Business settings
- Vendor formatting rules
- Feature flags (if stored in DB)

### Files (Supabase Storage)
- Invoice PDFs/images
- Sales data uploads
- Promotion materials

---

## Backup Frequency

### Production Database
- Continuous WAL (Write-Ahead Log) archiving
- Daily full backups
- Weekly full backups retained longer

### File Storage
- Daily snapshots
- Versioning enabled for critical files

### Configuration & Code
- Infrastructure as Code (IaC) in version control
- Environment variables in secure secret management
- Application code in Git

---

## Retention Policies

### Database Backups
- Daily: 7 days
- Weekly: 4 weeks
- Monthly: 12 months (if available)

### File Storage
- Active files: retained indefinitely
- Deleted files: soft-delete with 30-day recovery window

### Audit Logs
- Retained indefinitely (subject to plan limits)
- Immutable once written

---

## Recovery Procedures

### Point-in-Time Recovery (PITR)
Used for:
- Accidental data deletion
- Data corruption
- Rollback after failed migration

Process:
1. Identify target recovery time
2. Restore database to point-in-time
3. Verify data integrity
4. Re-apply any necessary corrections
5. Notify affected users if needed

---

### Full Database Restore
Used for:
- Complete disaster recovery
- Migration to new environment

Process:
1. Provision new database instance
2. Restore from most recent backup
3. Verify all tables and relationships
4. Test critical queries
5. Update connection strings
6. Monitor for issues

---

### Selective Data Recovery
Used for:
- Single business data recovery
- Single user data recovery
- Single entity recovery (order, vendor, etc.)

Process:
1. Identify affected records
2. Extract from backup
3. Restore to production (with care)
4. Verify isolation and permissions
5. Notify affected users

---

## Disaster Recovery Plan

### Recovery Time Objectives (RTO)
- Critical data: < 4 hours
- Full system: < 24 hours

### Recovery Point Objectives (RPO)
- Maximum data loss: 1 hour (aligned with backup frequency)

### Disaster Scenarios

#### Database Failure
1. Failover to backup (if available)
2. Restore from most recent backup
3. Replay transaction logs if possible
4. Verify data integrity

#### Storage Failure
1. Restore files from backup
2. Re-link file references
3. Verify file accessibility

#### Regional Outage
1. Activate backup region (if configured)
2. Restore services
3. Update DNS/routing
4. Communicate with users

---

## Backup Verification

### Automated Testing
- Weekly restore tests (non-production)
- Verify data integrity
- Test recovery procedures

### Manual Verification
- Monthly full recovery drill
- Document any issues
- Update procedures as needed

---

## Security Considerations

### Backup Encryption
- All backups encrypted at rest
- Encrypted in transit
- Access restricted to authorized personnel

### Access Control
- Backup access requires elevated permissions
- All backup access logged
- No user-facing backup access in MVP

---

## Monitoring & Alerts

### Backup Monitoring
- Alert if backup fails
- Alert if backup is delayed
- Alert if backup size is abnormal

### Recovery Monitoring
- Log all recovery operations
- Alert on recovery attempts
- Track recovery success rates

---

## User Data Protection

### User-Initiated Deletion
- Soft-delete with recovery window
- Hard-delete only after retention period
- Recovery available during window

### Business Closure
- Data retained per retention policy
- Export available before deletion
- Compliance with data protection regulations

---

## Compliance Considerations

### Data Protection Regulations
- GDPR: Right to deletion (with recovery window)
- CCPA: Data export and deletion
- Industry-specific requirements

### Audit Requirements
- Backup operations logged
- Recovery operations logged
- Retention policies documented

---

## MVP vs Later

### MVP
- Rely on Supabase automated backups
- Manual recovery procedures
- Basic monitoring
- 7-day retention minimum

### Later
- Custom backup scheduling
- Automated recovery testing
- Multi-region backups
- Extended retention options
- User-initiated exports

---

## Success Criteria
- No data loss incidents
- Recovery tested and verified
- Recovery time meets objectives
- Users trust data safety

---

## Summary
Backup and recovery exist to:
- Protect user trust
- Ensure business continuity
- Meet compliance requirements

If backups are not tested, they are not reliable.
If recovery takes too long, the system is not production-ready.
