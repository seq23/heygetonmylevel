# HeyGetOnMyLevel — Trust & Security Summary

**For Prospective Customers & Enterprise Evaluation**  
**Last Updated:** March 2026  
**Contact:** privacy@time-2-read.com

---

## What Is HeyGetOnMyLevel?

HeyGetOnMyLevel is a free, browser-based reading practice application that helps users of all ages (5–85+) improve reading comprehension, phonics, and vocabulary through AI-generated educational content. No account or login is required.

---

## Privacy Architecture: Zero Personal Data

Our application is built on a **zero-PII architecture** — we do not collect, store, or process any personal information.

| What We Collect | What We Don't Collect |
|----------------|----------------------|
| Random session ID (UUID) — deleted on browser close | Names, emails, or contact information |
| Grade level selection | Age, birthdate, or demographics |
| Practice responses — ephemeral only | Location data or IP addresses for tracking |
| | Device identifiers or fingerprints |
| | Voice recordings (speech runs locally in-browser) |
| | Browsing history or cross-site behavior |

**All session data is automatically deleted when the browser closes.** There are no user profiles, no login credentials, and no persistent records of any individual's usage.

---

## Security Controls

| Control | Implementation |
|---------|----------------|
| Encryption in transit | TLS/HTTPS enforced on all connections |
| Encryption at rest | Cloud provider encryption on database |
| Database access control | Row Level Security (RLS) on all tables |
| Secrets management | Platform-managed; never in source code |
| Input validation | Character limits, enumerated values, PII warnings |
| Incident response | Formal plan with severity tiers and 72-hour notification commitment |

---

## Compliance Status

| Framework | Status | Summary |
|-----------|--------|---------|
| **GDPR** (EU) | ✅ Compliant | No personal data collected; Records of Processing maintained |
| **CCPA/CPRA** (California) | ✅ Compliant | No data sold or shared; explicit "Do Not Sell" statement |
| **COPPA** (Children <13) | ✅ Compliant | No children's PII collected; no parental consent required |
| **FERPA** (Education) | ✅ N/A | No student records maintained |
| **U.S. State Laws** (VA, CO, CT, etc.) | ✅ Compliant | Covered by GDPR + CCPA compliance |
| **LGPD** (Brazil) / **PIPEDA** (Canada) | ✅ Compliant | No personal data processed |
| **PCI DSS** | ✅ N/A | No payment processing |
| **SOC 2** | 🟡 Controls in place | Formal audit planned at scale (Phase 3) |

---

## Subprocessors

We use three vendors. No personal data is shared with any of them.

| Vendor | Purpose | Data Access |
|--------|---------|-------------|
| Lovable Cloud | Hosting, database, serverless functions | Anonymous session data only |
| Lovable AI | AI-generated educational content | Grade level + content type requests only (no user data) |
| Resend | Feedback email delivery | User-submitted feedback text only (max 500 chars) |

Full subprocessor details with risk tiering available upon request.

---

## Frequently Asked Questions

**Do you have SOC 2?**  
Not yet. Our zero-PII architecture minimizes risk surface. Security controls (RLS, TLS, secrets management, incident response plan) are in place. Formal SOC 2 audit is planned for Phase 3 via Vanta/Drata. Full security overview available upon request.

**Where is data stored?**  
Lovable Cloud infrastructure. All session data is ephemeral — automatically deleted when the browser session ends. The only persistent data is pre-generated educational content containing zero user information.

**Do you sell data?**  
No. We do not sell, share, rent, license, or monetize any data of any kind. There is no advertising, no analytics tracking individuals, and no data broker relationships.

**How do you handle deletion requests?**  
No personal data exists to delete. Sessions auto-delete on browser close. Browser-side data (optional Reading Buddy name in localStorage) can be cleared through standard browser settings. A data subject access request would confirm: no personal data held.

**What happens in a breach?**  
We maintain a formal Incident Response Plan with severity classification, 72-hour GDPR notification commitment, specific scenario playbooks, and escalation procedures. Because no personal data is collected, the impact of any breach is fundamentally limited — no identities, credentials, or financial data can be exposed. Zero incidents to date.

**Do you support DPAs?**  
Yes. We provide a Data Processing Agreement template covering GDPR Article 28 obligations, sub-processor management, breach notification, audit rights, and data return/deletion. We also accept customer-provided DPA templates for review.

**Is this safe for children?**  
Yes. No personal information is collected from any user, including children. No accounts, no age verification, no tracking. AI content is prompted for age-appropriate material. We maintain a dedicated Children's Safety Addendum documenting COPPA compliance.

---

## Available Documentation

The following documents are available upon request:

| Document | Description |
|----------|-------------|
| Privacy Policy | Full privacy policy (also at heygetonmylevel.lovable.app/privacy) |
| Terms of Service | Full terms (also at heygetonmylevel.lovable.app/terms) |
| Security Overview | Detailed security posture for enterprise evaluation |
| Vendor & Subprocessor List | Complete vendor inventory with risk tiering and data flows |
| Incident Response Plan | Breach handling procedures with severity levels and playbooks |
| Data Processing Agreement | DPA template for enterprise counterparties |
| Data Retention Policy | Formal retention schedule with deletion mechanisms |
| Children's Safety Addendum | COPPA compliance documentation |
| Zero-PII Compliance Implications | Detailed breakdown of what our architecture excuses us from |
| Acceptable Use Policy | Permitted and prohibited uses |
| Enterprise Compliance Checklist | Full audit checklist mapped to architecture |
| Data Processing Record (RoPA) | GDPR Article 30 compliant record |

---

## Contact

**Privacy & Compliance Inquiries:** privacy@time-2-read.com  
**Security Reports:** privacy@time-2-read.com (include "SECURITY" in subject line)

---

*This document is maintained as part of the HeyGetOnMyLevel compliance documentation package. All claims are backed by corresponding detailed documents available upon request.*
