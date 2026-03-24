# Vendor & Subprocessor List

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Purpose:** Transparency on all third-party services used by HeyGetOnMyLevel

---

## 1. Overview

HeyGetOnMyLevel uses a minimal set of third-party services. This document provides a complete inventory of all vendors, their purpose, data access, and risk classification.

**Data Sharing Principle:** No personal information is shared with any vendor. All data transmitted is anonymous and ephemeral.

---

## 2. Complete Vendor Inventory

| Vendor | Category | Purpose | Data Shared | Personal Data? | DPA Available? |
|--------|----------|---------|-------------|----------------|----------------|
| Lovable Cloud | Hosting | Application hosting, database, edge functions | Anonymous session data | No | Platform terms |
| Lovable AI | AI Service | Educational content generation | Grade level + content type requests only | No | Platform terms |
| Resend | Email Delivery | Feedback message delivery | User-submitted feedback text only | No* | Yes |

*Feedback could contain personal data if user ignores warnings. See risk mitigation below.

---

## 3. Vendor Risk Tiering

### Tier 1 — High Risk (Stores/Processes Data)

| Vendor | Risk Factor | Mitigation |
|--------|------------|------------|
| Lovable Cloud | Hosts ephemeral session data | No PII in sessions; RLS on all tables; auto-deletion |

### Tier 2 — Medium Risk (Processes Data Transiently)

| Vendor | Risk Factor | Mitigation |
|--------|------------|------------|
| Lovable AI | Receives content generation requests | No user data in requests; only grade level + content type |
| Resend | Transmits feedback emails | PII warnings displayed; 500-char limit; no database storage |

### Tier 3 — Low Risk (Infrastructure Only)

No Tier 3 vendors currently. All vendors have some data interaction.

---

## 4. Vendor Compliance Status

| Vendor | GDPR Compliant | SOC 2 | Data Location | Terms Accepted |
|--------|---------------|-------|---------------|----------------|
| Lovable Cloud | Yes | Platform-level | Cloud infrastructure | Yes |
| Lovable AI | Yes | Platform-level | Cloud infrastructure | Yes |
| Resend | Yes | Yes | United States | Yes |

---

## 5. Data Flow Per Vendor

### Lovable Cloud (Hosting + Database)
```
User → HTTPS → Lovable Cloud
                ├── Serves frontend (static assets)
                ├── Stores ephemeral sessions (UUID, grade level, timestamps)
                ├── Stores passages, questions, responses (linked to session UUID)
                └── Auto-deletes via delete_session_data() function
```

### Lovable AI (Content Generation)
```
Edge Function → Lovable AI API
                ├── Input: "Generate a grade 3 reading passage about animals"
                ├── Output: Passage text + comprehension questions
                └── No user identifiers transmitted
```

### Resend (Email)
```
Feedback Form → Edge Function → Resend API → Operator Email
                                ├── Input: Feedback message text (max 500 chars)
                                ├── No sender identification
                                └── Not stored in any database
```

---

## 6. Feedback Risk Mitigation

The feedback system is the only vector where a user could voluntarily share personal information:

| Protection | Implementation |
|------------|----------------|
| PII warning | Prominently displayed before submission |
| Character limit | 500 characters maximum |
| No required fields | No name, email, or contact requested |
| No storage | Sent via email only, not persisted |
| One-way communication | No response mechanism |

---

## 7. Vendor Change Policy

When adding new vendors:
1. Assess data shared and risk tier
2. Verify GDPR compliance and DPA availability
3. Update this document
4. Update Privacy Policy if data practices change
5. Notify users of material changes via application

---

## 8. Document Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 2026 | Initial vendor inventory |
