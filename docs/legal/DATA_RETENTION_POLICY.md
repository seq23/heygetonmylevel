# Data Retention Policy

**Document Version:** 1.1  
**Last Updated:** April 2026

---

## 1. Purpose

This policy defines how long data is retained by HeyGetOnMyLevel and the mechanisms for deletion.

---

## 2. Retention Schedule

| Data Category | Retention Period | Deletion Method | Justification |
|---------------|-----------------|-----------------|---------------|
| Session ID (UUID) | Browser session only | `delete_session_data()` DB function | Required only for active session |
| Reading level selection | Browser session only | Cascade delete with session | Required only for content generation |
| Assessment flag | Browser session only | Cascade delete with session | Required only for session flow |
| Passages (AI-generated) | Browser session only | Cascade delete with session | Linked to session |
| Questions | Browser session only | Cascade delete with session | Linked to passage |
| Responses (answers) | Browser session only | Cascade delete with session | Linked to session |
| Timestamps | Browser session only | Cascade delete with session | Operational metadata |
| Cached passages | Indefinite | Manual cleanup | Pre-generated content; contains no user data |
| Country/region/city stats | Indefinite | Aggregated daily counts | Anonymous geo analytics from CDN headers; no PII |
| AI usage stats | Indefinite | Aggregated daily counts | Cost monitoring by call type; no PII |
| Feedback messages | Not stored | Email delivery only | Sent via Resend; not persisted in database |
| Sidebar cookie | Browser-managed | Browser cookie expiry | Functional UI preference |
| LocalStorage (name, tutorial) | Until cleared by user | User action or browser clear | Reading Buddy personalization |

---

## 3. Deletion Mechanisms

### 3.1 Automatic Session Cleanup

The `delete_session_data(session_uuid)` PostgreSQL function handles cascading deletion:

```
Session → Passages → Questions
       → Responses
```

All related data is removed when the parent session is deleted.

### 3.2 Cached Passages

Pre-generated reading passages in `cached_passages` table:
- Contain no user data (only AI-generated content)
- Retained for performance optimization
- May be periodically cleaned for freshness

### 3.3 Browser-Side Data

| Storage | Data | User Control |
|---------|------|-------------|
| localStorage | Reading Buddy name, tutorial status | Clear browser data |
| Cookie | Sidebar preference | Clear cookies |

---

## 4. Data Minimization

Our retention approach follows data minimization principles:

1. **Collect minimum necessary** — Only session-functional data
2. **Retain for minimum time** — Ephemeral by default
3. **Delete automatically** — No manual intervention needed
4. **No archives** — Deleted data is not backed up or archived

---

## 5. No Personal Data Retention

Because we do not collect personal information:
- No data subject deletion requests apply
- No retention conflicts with right to erasure
- No long-term storage of identifiable information

---

## 6. Policy Review

This policy is reviewed:
- When data practices change
- When new data categories are introduced
- Annually, at minimum

---

## Document Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 2026 | Initial retention policy |
| 1.1 | April 2026 | Added anonymous geo stats and AI usage stats retention; both are aggregated daily counts with no PII |
