# Security Overview

**Document Version:** 1.1  
**Last Updated:** April 2026  
**Purpose:** Security posture summary for enterprise evaluation

---

## 1. Executive Summary

HeyGetOnMyLevel is a free educational reading practice application with a **privacy-first, zero-PII architecture**. This document provides an overview of our security practices for enterprise buyers, procurement teams, and security reviewers.

**Key Security Differentiator:** Our application collects no personal information whatsoever. This fundamentally reduces our attack surface and eliminates entire categories of data breach risk.

---

## 2. Architecture Security

### 2.1 Data Architecture

| Principle | Implementation |
|-----------|----------------|
| **Zero PII Collection** | No names, emails, ages, or identifiers collected |
| **Ephemeral Sessions** | All session data deleted when browser closes |
| **No User Accounts** | No authentication, no credentials to breach |
| **Data Minimization** | Only session-functional data (UUID, grade level, timestamps) |
| **Anonymous Analytics** | Aggregated daily country/region/city counts from CDN headers; no IPs stored |
| **Usage Monitoring** | Aggregated daily AI call counts by type for cost management |

### 2.2 Technology Stack

| Layer | Technology | Security Posture |
|-------|-----------|-----------------|
| Frontend | React (TypeScript) | Client-side only; no sensitive operations |
| Hosting | Lovable Cloud | Enterprise-grade infrastructure with TLS |
| Database | PostgreSQL (via Lovable Cloud) | Row Level Security on all tables |
| Backend Functions | Edge Functions | Serverless; no persistent state |
| AI Services | Lovable AI | No user data in requests |
| Email | Resend | Feedback delivery + operator alerts; SOC 2 compliant |
| Monitoring | pg_cron + Edge Functions | Monthly automated traffic/cost spike detection |

---

## 3. Security Controls

### 3.1 Encryption

| Type | Implementation |
|------|----------------|
| In Transit | TLS/HTTPS enforced on all connections |
| At Rest | Cloud provider encryption on database storage |
| Secrets | Environment variable management via platform |

### 3.2 Access Control

| Control | Implementation |
|---------|----------------|
| Database | Row Level Security (RLS) policies on all tables |
| Edge Functions | JWT verification configurable per function |
| Secrets Management | Platform-managed; never in source code |
| Admin Access | Platform-level authentication required |

### 3.3 Input Validation & AI Safety

| Vector | Protection |
|--------|------------|
| Feedback form | 500-character limit; PII warnings displayed |
| Grade level selection | Enumerated values only (K-8) |
| Assessment responses | Validated against expected formats |
| API requests | Edge function input validation |
| AI Reading Buddy | Topic-restricted system prompt; only responds to reading/education queries |
| Language selection | Enumerated values (en/es); stored client-side only |

### 3.4 PWA / Service Worker Security

| Control | Implementation |
|---------|----------------|
| Preview/iframe guard | SW registration blocked in iframe and preview contexts |
| OAuth exclusion | `/~oauth` route excluded from SW cache via `navigateFallbackDenylist` |
| Cache strategy | Network-first for navigation; cache-first for static assets |
| API exclusion | Supabase/API calls never cached by service worker |
| Stale cache cleanup | Old cache versions auto-deleted on SW activation |

---

## 4. Risk Assessment

### 4.1 Risk Profile: LOW

Our risk profile is inherently low because:

1. **No personal data to breach** — Eliminates identity theft, credential stuffing, PII exposure
2. **No user accounts** — Eliminates authentication attacks, password reuse, account takeover
3. **No payment processing** — Eliminates financial fraud, PCI compliance scope
4. **Ephemeral data** — Eliminates long-term data exposure, historical data leaks
5. **No user-to-user communication** — Eliminates harassment, social engineering vectors

### 4.2 Residual Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI generates inappropriate content | Low | Low | Topic-restricted system prompt; age-appropriate content constraints |
| AI used for off-topic queries | Low | Low | AI Buddy rejects non-reading queries with guardrail response |
| User submits PII in feedback | Low | Low | Warnings displayed; 500-char limit; no storage |
| Service disruption | Low | Low | Cloud infrastructure redundancy; PWA offline fallback |
| Dependency vulnerability | Low | Medium | Regular dependency updates; security scanning |
| SW cache poisoning | Very Low | Low | Network-first strategy; OAuth/API routes excluded |

---

## 5. Compliance Status

| Framework | Status | Notes |
|-----------|--------|-------|
| GDPR | ✅ Compliant | No personal data collected; RoPA maintained |
| CCPA/CPRA | ✅ Compliant | No data sold; consumer rights satisfied by design |
| COPPA | ✅ Compliant | No children's PII collected |
| FERPA | ✅ N/A | No student records handled |
| Section 508 | ✅ Implemented | Skip nav, landmarks, ARIA labels, focus-visible, aria-live regions, aria-pressed states, type-to-answer fallback, semantic HTML |
| FISMA | 🔴 Not Yet | Formal certification deferred |
| SOC 2 | 🟡 Readiness | Controls in place; formal audit Phase 3 |
| ISO 27001 | 🔴 Not Yet | Planned at enterprise scale |

---

## 6. Vendor Security

All third-party vendors are documented in our [Subprocessor List](./VENDOR_SUBPROCESSORS.md).

| Vendor | Data Access | Risk Tier |
|--------|------------|-----------|
| Lovable Cloud | Anonymous session data | Tier 1 |
| Lovable AI | Content requests (no user data) | Tier 2 |
| Resend | Feedback messages only | Tier 2 |

---

## 7. Incident Response

A formal Incident Response Plan is maintained at [INCIDENT_RESPONSE_PLAN.md](./INCIDENT_RESPONSE_PLAN.md).

Key commitments:
- Critical incidents: < 1 hour response
- GDPR breach notification: Within 72 hours
- Post-incident review for all incidents
- No security incidents to date

---

## 8. Development Practices

| Practice | Implementation |
|----------|----------------|
| Source Control | Git-based version management |
| Secrets Management | Platform-managed; never committed to code |
| Dependency Management | Regular updates; vulnerability scanning |
| Code Review | Changes reviewed before deployment |
| Environment Separation | Development and production environments |

---

## 9. What We Don't Do (By Design)

Understanding what we deliberately avoid is as important as what we implement:

- ❌ No user authentication to attack
- ❌ No password storage to breach
- ❌ No PII database to exfiltrate
- ❌ No payment processing to compromise
- ❌ No third-party tracking scripts
- ❌ No advertising networks
- ❌ No analytics that track individuals
- ❌ No cross-site tracking
- ❌ No social media integrations

---

## 10. Security Contact

For security concerns or vulnerability reports, email **privacy@time-2-read.com** with "SECURITY" in the subject line for priority handling.

You may also use the in-app feedback mechanism for non-urgent matters.

---

## Document Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 2026 | Initial security overview |
| 1.1 | April 2026 | Added AI guardrails, PWA/SW security, Section 508/FISMA status, multilingual support |
