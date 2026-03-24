# Zero-PII Architecture: Compliance Implications

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Purpose:** Clearly document what compliance obligations are eliminated or reduced by our no-account, no-PII architecture

---

## 1. Architecture Summary

HeyGetOnMyLevel operates on a **zero-PII, zero-account architecture**:

- ❌ No user accounts or login
- ❌ No names, emails, phone numbers, or addresses collected
- ❌ No age, birthdate, or demographic data
- ❌ No persistent identifiers (device IDs, advertising IDs, fingerprints)
- ❌ No behavioral tracking or profiling
- ❌ No payment processing
- ❌ No location tracking
- ❌ No cookies beyond a single functional UI preference
- ❌ No voice data transmitted (speech recognition runs locally in-browser)

**What we do store:** Ephemeral session data (random UUID, grade level selection, AI-generated passages, question responses) — all auto-deleted when the browser session ends.

---

## 2. What This Architecture Excuses Us From

### 2.1 GDPR (EU)

| Obligation | Required? | Why Not |
|-----------|-----------|---------|
| Consent banners / cookie popups | **No** | Only one strictly functional cookie — exempt under ePrivacy Directive Art. 5(3) |
| Data Protection Officer (DPO) | **No** | Not a public authority; no large-scale monitoring; no special category data (GDPR Art. 37) |
| Data Protection Impact Assessment (DPIA) | **No** | No systematic monitoring, no large-scale processing of sensitive data (GDPR Art. 35) |
| Data Subject Access Requests (DSARs) | **No** | No personal data held to provide (GDPR Art. 15) |
| Right to rectification workflow | **No** | No personal data to correct (GDPR Art. 16) |
| Right to erasure workflow | **No** | No personal data stored — auto-deleted by design (GDPR Art. 17) |
| Right to data portability | **No** | No personal data to export (GDPR Art. 20) |
| Data breach notification to individuals | **No** | No personal data to breach — no identity theft risk (GDPR Art. 34) |
| Data breach notification to authority | **Unlikely** | No personal data means breach wouldn't trigger Art. 33 threshold |
| International data transfer safeguards (SCCs, adequacy) | **No** | No personal data transferred (GDPR Chapter V) |
| Records of consent | **No** | No consent collected or required |
| Legitimate interest balancing test | **Minimal** | Only anonymous session management — trivial legitimate interest |
| Appointing an EU representative | **No** | No personal data processing triggers Art. 27 |

### 2.2 CCPA / CPRA (California)

| Obligation | Required? | Why Not |
|-----------|-----------|---------|
| "Do Not Sell My Personal Information" link | **No** | No personal information collected or sold — but we include the statement anyway for goodwill |
| Consumer deletion request workflow | **No** | Nothing to delete |
| Consumer access request workflow | **No** | Nothing to disclose |
| Right to opt out of automated decision-making | **No** | No decisions made about individuals |
| Annual data practice disclosures | **Minimal** | Privacy Policy suffices |
| Data inventory to California AG | **No** | No personal information categories to report |

### 2.3 COPPA (Children Under 13)

| Obligation | Required? | Why Not |
|-----------|-----------|---------|
| Verifiable parental consent | **No** | No personal information collected from children (16 CFR §312.5) |
| Direct notice to parents | **No** | No personal information collected |
| Parent right to review child's data | **No** | No child data exists |
| Parent right to delete child's data | **No** | No child data exists |
| Parent right to refuse further collection | **No** | No collection occurring |
| Age gate / age verification | **No** | No PII means COPPA obligations aren't triggered regardless of age |
| FTC Safe Harbor participation | **No** | Optional program; not required |

### 2.4 FERPA (Student Records)

| Obligation | Required? | Why Not |
|-----------|-----------|---------|
| Written consent for data disclosure | **No** | No student records maintained |
| School district data agreements | **No** | No student data collected |
| Annual notification to parents | **No** | Not an educational institution |
| Student data access controls | **No** | No student data exists |

### 2.5 U.S. State Privacy Laws (VCDPA, CPA, CTDPA, etc.)

| Obligation | Required? | Why Not |
|-----------|-----------|---------|
| Consumer rights request system | **No** | No personal data to act on |
| Privacy impact assessments | **No** | No targeted advertising, profiling, or sensitive data |
| Opt-out of targeted advertising | **No** | No advertising at all |
| Universal opt-out mechanism (GPC) | **No** | Nothing to opt out of |

### 2.6 LGPD (Brazil) / PIPEDA (Canada)

| Obligation | Required? | Why Not |
|-----------|-----------|---------|
| Consent management | **No** | No personal data processed |
| Data subject rights portal | **No** | No personal data to access |
| Cross-border transfer mechanisms | **No** | No personal data transferred |

### 2.7 PCI DSS (Payment Card Industry)

| Obligation | Required? | Why Not |
|-----------|-----------|---------|
| Entire PCI DSS framework | **No** | No payment processing whatsoever |

### 2.8 SOC 2 (Voluntary)

| Obligation | Required? | Why Not |
|-----------|-----------|---------|
| Formal certification | **No** | SOC 2 is voluntary; our zero-PII posture means the scope of any future audit is minimal |

---

## 3. What We Still Do (Even Though We Don't Have To)

Despite being excused from most obligations, we voluntarily maintain:

| Practice | Why We Do It Anyway |
|----------|-------------------|
| Full Privacy Policy | Transparency and user trust |
| Terms of Service | Legal protection and AI content disclaimer |
| "Do not sell" statement | Preemptive CCPA goodwill |
| Multi-jurisdiction rights section | Future-proofing |
| Data Processing Record (RoPA) | GDPR best practice; demonstrates diligence |
| Children's Safety Addendum | Demonstrates commitment to child safety |
| Vendor/Subprocessor list | Enterprise buyer readiness |
| Incident Response Plan | Professional preparedness |
| Security Overview | Enterprise procurement readiness |
| DPA template | Ready for B2B engagements |
| Acceptable Use Policy | Sets behavioral expectations |
| Feedback PII warnings | Risk mitigation on only user-input vector |
| HTTPS / TLS encryption | Security baseline |
| Row Level Security on database | Defense in depth |
| Ephemeral auto-deletion | Data minimization beyond what's required |

---

## 4. The Bottom Line

### What triggers compliance obligations?

**Collecting personal information.** That's the key that unlocks GDPR, CCPA, COPPA, FERPA, and virtually every privacy regulation worldwide.

### Our position:

**We don't turn that key.** By architecturally eliminating personal data collection, we sidestep the vast majority of compliance obligations — not through loopholes, but through genuine privacy-by-design.

### What could change this?

If we ever add any of the following, this document must be revisited and compliance obligations reassessed:

| Change | Compliance Impact |
|--------|------------------|
| User accounts / login | Triggers GDPR consent, CCPA rights, data retention obligations |
| Email collection | Triggers COPPA parental consent, GDPR/CCPA access rights |
| Analytics tracking individuals | Triggers cookie consent, GDPR profiling rules |
| Payment processing | Triggers PCI DSS, financial data regulations |
| Persistent user profiles | Triggers data portability, deletion workflows, breach notification |
| Advertising / ad networks | Triggers cookie consent, "Do Not Sell" mechanisms, opt-out requirements |
| Location tracking | Triggers GDPR special category protections |

**Until any of those changes occur, our compliance posture remains: fully excused from PII-dependent obligations by architecture.**

---

## 5. Contact

For questions about our compliance posture: **privacy@time-2-read.com**

---

## Document Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 2026 | Initial document |
