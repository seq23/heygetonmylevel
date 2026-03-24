# HeyGetOnMyLevel — Legal Summary

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Prepared For:** Internal Reference

---

## 1. Executive Summary

| Attribute | Details |
|-----------|---------|
| **Application Name** | HeyGetOnMyLevel |
| **Website** | heygetonmylevel.lovable.app |
| **Purpose** | Free educational reading practice tool |
| **Target Audience** | Users of all ages, including children |
| **Business Model** | Free, no monetization, no advertising |
| **User Accounts** | None required |
| **Data Collection** | Ephemeral, anonymous session data only |
| **PII Collected** | None |

### Application Description

HeyGetOnMyLevel is a web-based reading practice application that helps users improve their reading comprehension skills. The application generates AI-powered reading passages and comprehension questions appropriate for different grade levels (K-8).

Key features:
- No user registration or login required
- No personal information collected
- Session data is ephemeral (deleted when browser closes)
- AI-generated educational content only
- Free to use with no advertisements

---

## 2. Technical Architecture

### 2.1 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React (TypeScript) | User interface |
| Hosting | Lovable Cloud | Application hosting |
| Backend | Lovable Cloud (Supabase) | Session management |
| AI Services | Lovable AI | Content generation |
| Email | Resend | Feedback delivery only |

### 2.2 Data Flow

```
User → Browser → Application → Lovable Cloud Backend
                     ↓
              AI Content Generation
              (No user data sent)
```

### 2.3 Session Lifecycle

1. User visits application
2. Anonymous session ID generated (UUID)
3. User selects reading level
4. AI generates reading passage (no user data included in request)
5. User practices reading and answers questions
6. Session ends when browser closes
7. Session data deleted via database function

---

## 3. Data Inventory

### 3.1 Data Collected

| Data Element | Type | PII? | Storage Duration | Purpose |
|--------------|------|------|------------------|---------|
| Session ID | UUID | No | Session only | Link user's activity |
| Reading Level | Integer (K-8) | No | Session only | Content difficulty |
| Assessment Flag | Boolean | No | Session only | Track if assessment taken |
| Practice Answers | Text | No | Session only | Comprehension practice |
| Timestamps | DateTime | No | Session only | Session tracking |

### 3.2 Data NOT Collected

The following data is explicitly NOT collected:

- ❌ Names
- ❌ Email addresses
- ❌ Phone numbers
- ❌ Physical addresses
- ❌ Age or birthdate
- ❌ Device identifiers
- ❌ IP addresses (for tracking)
- ❌ Location data
- ❌ Browsing history
- ❌ Cross-site behavior
- ❌ Biometric data
- ❌ Voice recordings (speech recognition runs locally in browser)

### 3.3 Cookies

| Cookie | Type | Purpose | Contains PII |
|--------|------|---------|--------------|
| Sidebar preference | Functional | Remember UI state | No |

No tracking cookies, analytics cookies, or advertising cookies are used.

---

## 4. Third-Party Services

### 4.1 Service Providers

| Service | Provider | Purpose | Data Shared |
|---------|----------|---------|-------------|
| Hosting | Lovable Cloud | Application hosting | None (anonymous sessions) |
| AI | Lovable AI | Content generation | None (only content requests) |
| Email | Resend | Feedback delivery | Feedback message only |

### 4.2 AI Content Generation

- AI is used ONLY to generate educational reading passages and questions
- NO user data is sent to AI services
- Requests contain only: grade level and content type requested
- AI-generated content disclaimer displayed in Terms of Service

---

## 5. Regulatory Compliance Assessment

### 5.1 COPPA (Children's Online Privacy Protection Act)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Verifiable parental consent | ✅ Not Required | No PII collected |
| Direct notice to parents | ✅ Not Required | No PII collected |
| Privacy policy accessible | ✅ Compliant | /privacy route |
| Data minimization | ✅ Compliant | Only session data |
| Data security | ✅ Compliant | No PII to secure |
| Data retention limits | ✅ Compliant | Ephemeral only |

**COPPA Assessment:** Because the application does not collect personal information from anyone (including children), COPPA's consent requirements do not apply. The application follows data minimization best practices.

### 5.2 GDPR (General Data Protection Regulation)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Lawful basis | ✅ Compliant | Legitimate interest (anonymous) |
| Transparency | ✅ Compliant | Privacy policy provided |
| Purpose limitation | ✅ Compliant | Session management only |
| Data minimization | ✅ Compliant | Minimal anonymous data |
| Storage limitation | ✅ Compliant | Ephemeral sessions |
| Integrity & confidentiality | ✅ Compliant | Standard security measures |
| Data subject rights | ✅ N/A | No personal data to access/delete |

**GDPR Assessment:** Because no personal data is collected, most GDPR requirements regarding data subject rights do not apply. The application follows privacy-by-design principles.

### 5.3 CCPA (California Consumer Privacy Act)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Right to know | ✅ Compliant | Privacy policy provided |
| Right to delete | ✅ N/A | No personal data stored |
| Right to opt-out | ✅ N/A | No data sold |
| Non-discrimination | ✅ Compliant | Free service for all |

**CCPA Assessment:** Because no personal information is collected or sold, CCPA requirements are minimal and satisfied through the privacy policy.

---

## 6. Risk Assessment

### 6.1 Risk Profile: LOW

The application presents a low privacy risk profile due to:
- No collection of personal information
- No user accounts or authentication
- Ephemeral data storage
- No monetization or advertising
- No third-party tracking

### 6.2 Identified Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| User enters PII in feedback form | Low | Warning displayed, 500 char limit |
| AI generates inappropriate content | Low | Age-appropriate prompts, disclaimer in ToS |
| Session data breach | Very Low | No PII in sessions, data is ephemeral |

---

## 7. Security Measures

### 7.1 Technical Security

- HTTPS encryption for all traffic
- Secure hosting on Lovable Cloud platform
- Row Level Security (RLS) on all database tables
- No sensitive data stored

### 7.2 Organizational Security

- Privacy-by-design architecture
- Data minimization as core principle
- Regular review of data practices

---

## 8. Feedback Form Safeguards

The application includes a feedback feature with the following protections:

1. **PII Warning**: "Please don't include personal info" displayed prominently
2. **Character Limit**: 500 character maximum with visual counter
3. **No Storage**: Feedback sent via email only, not stored in database
4. **No Required Fields**: No contact information requested

---

## 9. Legal Documents

The following legal documents are implemented in the application:

| Document | Location | Implementation |
|----------|----------|----------------|
| Privacy Policy | /privacy | Full in-app display |
| Terms of Service | /terms | Full in-app display |
| Footer Links | All pages | Persistent navigation |

---

## 10. Future Considerations

### Low-Priority Items

- Accessibility statement (ADA/WCAG compliance) — recommended if pursuing public sector contracts
- DMCA takedown procedure — only needed if user-generated content is added in future
- Cookie banner — not legally required for functional-only cookies
- Age verification — not required given no PII collection

---

## 11. Document Maintenance

This legal documentation package should be reviewed:
- When application features change
- When data collection practices change
- When new third-party services are added
- Annually, at minimum

---

## Appendices

- **Appendix A**: [Full Privacy Policy](./PRIVACY_POLICY.md)
- **Appendix B**: [Full Terms of Service](./TERMS_OF_SERVICE.md)
- **Appendix C**: [Data Processing Record](./DATA_PROCESSING_RECORD.md)
- **Appendix D**: [Children's Safety Addendum](./CHILDRENS_SAFETY_ADDENDUM.md)
