# Incident Response Plan

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Classification:** Internal

---

## 1. Purpose

This document establishes the incident response procedures for HeyGetOnMyLevel. It covers identification, containment, notification, and resolution of security incidents.

---

## 2. Scope

This plan covers:
- Security breaches or suspected breaches
- Unauthorized access to systems
- Data integrity incidents
- Service disruptions
- AI content safety incidents
- Feedback system incidents (PII exposure)

---

## 3. Risk Context

HeyGetOnMyLevel has a **low risk profile** because:
- No personal information is collected or stored
- No user accounts exist
- All session data is ephemeral
- No payment data is processed
- No sensitive data categories are handled

However, incidents can still occur and must be handled professionally.

---

## 4. Incident Classification

### Severity Levels

| Level | Description | Examples | Response Time |
|-------|-------------|----------|---------------|
| **Critical** | Active breach or data exposure | Unauthorized database access; secrets exposed | Immediate (< 1 hour) |
| **High** | Potential breach or significant risk | Suspicious access patterns; vulnerability discovered | < 4 hours |
| **Medium** | Service disruption or content issue | Inappropriate AI content; edge function failure | < 24 hours |
| **Low** | Minor issue, no data risk | UI bugs; performance degradation | < 72 hours |

---

## 5. Incident Response Phases

### Phase 1: Identify

- Monitor for anomalies in system behavior
- Review any user-reported issues via feedback
- Check edge function logs for errors
- Assess whether incident involves any data exposure

**Key Question:** Is any personal data at risk?  
**For HeyGetOnMyLevel:** Almost certainly not — we don't collect PII.

### Phase 2: Contain

| Action | Responsibility |
|--------|---------------|
| Isolate affected systems | Platform team |
| Disable compromised edge functions | Developer |
| Rotate exposed secrets | Developer via Lovable Cloud |
| Preserve evidence (logs, screenshots) | Incident lead |

### Phase 3: Assess

Determine:
1. What happened and how
2. What data (if any) was affected
3. Whether personal data was involved
4. Scope and duration of incident
5. Root cause

### Phase 4: Notify

#### GDPR Requirements (if personal data involved)
- **Supervisory Authority:** Within 72 hours of awareness
- **Data Subjects:** Without undue delay if high risk to rights

#### Practical Reality for HeyGetOnMyLevel
Since no personal data is collected:
- No data breach notification is typically required
- No identity theft risk exists for users
- Notification focus is on service restoration

#### Exception: Feedback System
If a user included PII in feedback despite warnings:
- Delete the feedback email containing PII
- Document the incident
- Review and strengthen PII warnings

### Phase 5: Recover

1. Remediate the vulnerability
2. Restore affected services
3. Verify system integrity
4. Update security measures

### Phase 6: Review

1. Conduct post-incident review
2. Document lessons learned
3. Update this plan if needed
4. Update security measures
5. File incident report (see template below)

---

## 6. Incident Report Template

```
INCIDENT REPORT

Date Discovered: _______________
Date Resolved: _______________
Severity: Critical / High / Medium / Low

Description:
_________________________________________________

Systems Affected:
_________________________________________________

Data Impact:
☐ No personal data involved
☐ Personal data potentially involved (detail below)
_________________________________________________

Root Cause:
_________________________________________________

Actions Taken:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Preventive Measures:
1. _______________________________________________
2. _______________________________________________

Notifications Sent:
☐ None required
☐ Supervisory authority (date: _______)
☐ Affected individuals (date: _______)
```

---

## 7. Escalation Procedures

| Severity | Escalation Path |
|----------|----------------|
| Critical | Immediate: All team members notified |
| High | Within 4 hours: Project owner + developer |
| Medium | Within 24 hours: Developer review |
| Low | Next business day: Standard review |

---

## 8. Specific Scenario Playbooks

### Scenario A: Database Credentials Exposed

1. Immediately rotate all database credentials
2. Review access logs for unauthorized queries
3. Verify RLS policies are intact
4. Assess whether any session data was accessed
5. Document and close

### Scenario B: Inappropriate AI Content Reported

1. Review the reported content
2. Assess severity (offensive, dangerous, or merely inaccurate)
3. Update AI prompts to prevent recurrence
4. Respond to feedback if possible
5. Document pattern for future prevention

### Scenario C: Edge Function Compromise

1. Disable the affected function
2. Rotate API keys (RESEND_API_KEY, LOVABLE_API_KEY)
3. Review function logs
4. Deploy patched function
5. Verify functionality

### Scenario D: PII Received in Feedback

1. Delete the email containing PII
2. Do not copy, forward, or store the PII
3. Review feedback form warnings for adequacy
4. Consider strengthening character limits or content filters
5. Document as low-severity incident

---

## 9. Security Incident History

| Date | Incident | Severity | Impact | Resolution |
|------|----------|----------|--------|------------|
| None | No incidents recorded | N/A | N/A | N/A |

---

## 10. Plan Maintenance

This plan should be reviewed:
- After any incident
- When system architecture changes
- When new vendors are added
- Annually, at minimum

---

## Document Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 2026 | Initial incident response plan |
