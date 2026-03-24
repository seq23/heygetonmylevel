# Record of Processing Activities

**Document Version:** 1.0  
**Last Updated:** January 2026  
**GDPR Article 30 Compliance Record**

---

## 1. Controller Information

| Field | Value |
|-------|-------|
| **Organization Name** | Time-2-Read |
| **Contact Person** | Privacy Team |
| **Contact Email** | privacy@time-2-read.com |
| **Data Protection Officer** | Not required (see Section 8) |

---

## 2. Processing Activity Overview

### 2.1 Name of Processing Activity

**Educational Reading Practice Session Management**

### 2.2 Purpose of Processing

To provide a free, anonymous reading practice service that:
- Generates AI-powered educational content
- Tracks session progress for immediate feedback
- Delivers optional user feedback to operators

### 2.3 Lawful Basis

| Basis | Applicable | Justification |
|-------|------------|---------------|
| Consent | No | No personal data processed |
| Contract | No | No contractual relationship |
| Legal obligation | No | No legal requirement |
| Vital interests | No | Not applicable |
| Public task | No | Not a public authority |
| Legitimate interests | Yes | Providing free educational service |

**Note:** Because no personal data is collected, the lawful basis analysis is provided for completeness but GDPR obligations regarding personal data do not apply.

---

## 3. Categories of Data Subjects

| Category | Description | Special Category |
|----------|-------------|------------------|
| General users | All visitors to the application | No |
| Children | Users under 13/16 years | No personal data collected |
| Adult learners | Users practicing reading skills | No |

**Note:** Because no personal data is collected from any category, no special protections beyond the standard architecture are required.

---

## 4. Categories of Data

### 4.1 Data Processed

| Data Category | Examples | Personal Data? | Special Category? |
|---------------|----------|----------------|-------------------|
| Session identifiers | UUID (e.g., 550e8400-e29b-41d4-a716-446655440000) | No | No |
| Educational preferences | Grade level selection (K-8) | No | No |
| Learning activity | Question responses, assessment answers | No | No |
| Timestamps | Session start/end times | No | No |
| Feedback messages | User-submitted feedback text | Potentially* | No |

*Feedback messages could contain personal data if a user chooses to include it, despite warnings not to do so.

### 4.2 Data NOT Processed

The following data categories are explicitly NOT collected:

- Identity data (names, usernames)
- Contact data (email, phone, address)
- Demographic data (age, gender, nationality)
- Location data
- Technical identifiers (device IDs, advertising IDs)
- Biometric data
- Health data
- Financial data

---

## 5. Recipients of Data

### 5.1 Internal Recipients

| Recipient | Purpose | Access Level |
|-----------|---------|--------------|
| Application servers | Session management | Automated only |

### 5.2 External Recipients (Processors)

| Recipient | Category | Purpose | Location | Safeguards |
|-----------|----------|---------|----------|------------|
| Lovable Cloud | Hosting provider | Application hosting | Cloud infrastructure | Standard security |
| Lovable AI | AI service | Content generation | Cloud infrastructure | No personal data shared |
| Resend | Email service | Feedback delivery | United States | Privacy policy compliance |

### 5.3 Data Sharing

| Sharing Type | Occurs? | Details |
|--------------|---------|---------|
| Sale of data | No | Data is never sold |
| Marketing sharing | No | No marketing conducted |
| Third-party advertising | No | No advertising |
| Government requests | No* | No personal data to provide |

*No personal data is available to provide in response to any request.

---

## 6. International Transfers

### 6.1 Transfer Locations

| Destination | Transfer Mechanism | Safeguards |
|-------------|-------------------|------------|
| Cloud infrastructure | Standard hosting | No personal data transferred |

### 6.2 Transfer Safeguards

Because no personal data is collected or transferred, GDPR Chapter V requirements regarding international transfers do not apply. However, the following technical safeguards are in place:

- HTTPS encryption for all data in transit
- Secure cloud infrastructure
- Access controls on all systems

---

## 7. Retention Periods

| Data Category | Retention Period | Deletion Method |
|---------------|------------------|-----------------|
| Session data | Duration of browser session | Automatic database function |
| Feedback messages | Not stored in database | Email-only delivery |

### 7.1 Retention Justification

- **Session data:** Required only for active session functionality; no purpose served by retention
- **Feedback:** Delivered via email for operator review; no database storage

---

## 8. Technical and Organizational Measures

### 8.1 Technical Measures

| Measure | Implementation |
|---------|----------------|
| Encryption in transit | HTTPS/TLS for all connections |
| Encryption at rest | Cloud provider encryption |
| Access control | Row Level Security on database |
| Authentication | Not applicable (no user accounts) |
| Logging | Minimal operational logging only |

### 8.2 Organizational Measures

| Measure | Implementation |
|---------|----------------|
| Privacy by design | No personal data collection |
| Data minimization | Only session-essential data |
| Staff training | N/A (automated system) |
| Incident response | Standard cloud provider procedures |

### 8.3 Security Incident History

| Date | Incident | Impact | Resolution |
|------|----------|--------|------------|
| None | No incidents recorded | N/A | N/A |

---

## 9. Data Protection Impact Assessment

### 9.1 DPIA Requirement Analysis

| Criterion | Assessment | DPIA Required? |
|-----------|------------|----------------|
| Systematic monitoring | No | No |
| Large scale processing | No | No |
| Sensitive data | No | No |
| Automated decision-making | No | No |
| Vulnerable data subjects | Yes (children) | See below |
| New technologies | Yes (AI) | See below |

### 9.2 DPIA Conclusion

Despite processing involving children and AI technology, a formal DPIA is **not required** because:

1. No personal data is collected from any users, including children
2. AI is used only for content generation, not for decisions about individuals
3. No profiling or automated decision-making about users occurs
4. Data is ephemeral and not retained

### 9.3 Risk Assessment Summary

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PII in feedback | Low | Low | Warning displayed, not stored |
| Inappropriate AI content | Low | Low | Age-appropriate prompts |
| Data breach | Very Low | Very Low | No personal data to breach |

---

## 10. Data Protection Officer

### 10.1 DPO Designation

A Data Protection Officer is **not required** because:

- Processing is not core business activity of a public authority
- Processing does not involve large-scale monitoring
- Processing does not involve large-scale special category data

### 10.2 Privacy Contact

For privacy inquiries, users may contact **privacy@time-2-read.com**.

---

## 11. Data Subject Rights Procedures

| Right | Applicable? | Procedure |
|-------|-------------|-----------|
| Access (Art. 15) | No | No personal data held |
| Rectification (Art. 16) | No | No personal data held |
| Erasure (Art. 17) | No | Data auto-deleted |
| Restriction (Art. 18) | No | No personal data held |
| Portability (Art. 20) | No | No personal data held |
| Object (Art. 21) | No | No personal data held |
| Automated decisions (Art. 22) | No | No such decisions made |

---

## 12. Review and Updates

| Review Type | Frequency | Last Review |
|-------------|-----------|-------------|
| Processing activities | Annual | January 2026 |
| Technical measures | Annual | January 2026 |
| Third-party processors | Annual | January 2026 |
| Risk assessment | Annual | January 2026 |

---

## 13. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Privacy Team | Initial record |

---

## Appendices

### Appendix A: Database Schema

```
sessions
├── id (UUID, primary key)
├── created_at (timestamp)
├── start_time (timestamp)
├── end_time (timestamp, nullable)
├── selected_reading_level (integer, nullable)
└── assessment_taken (boolean, nullable)

passages
├── id (UUID, primary key)
├── session_id (UUID, foreign key → sessions)
├── text (text)
├── fk_grade_level (integer)
├── skill_focus (text, nullable)
└── created_at (timestamp)

questions
├── id (UUID, primary key)
├── passage_id (UUID, foreign key → passages)
├── text (text)
├── question_type (text)
├── correct_answer (text)
├── explanation (text)
├── options (JSON, nullable)
└── created_at (timestamp)

responses
├── id (UUID, primary key)
├── session_id (UUID, foreign key → sessions)
├── question_id (UUID, foreign key → questions)
├── user_answer (text)
├── is_correct (boolean)
└── created_at (timestamp)
```

### Appendix B: Third-Party Processor Agreements

| Processor | Agreement Type | Date |
|-----------|---------------|------|
| Lovable Cloud | Platform Terms | January 2026 |
| Resend | Service Terms | January 2026 |
