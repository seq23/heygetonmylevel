# HeyGetOnMyLevel — Trust & Security Summary

**For Prospective Customers & Enterprise Evaluation**  
**Last Updated:** April 2026  
**Contact:** privacy@time-2-read.com

---

## What Is HeyGetOnMyLevel?

HeyGetOnMyLevel is a browser-based reading practice application that helps users of all ages (5–85+) improve reading comprehension, phonics, and vocabulary through AI-generated educational content. No account or login is required. The application supports **English and Spanish**, with a structured **200-hour curriculum map** organized into 10-hour module blocks across grade levels K–College.

---

## Licensing

HeyGetOnMyLevel is **free for individual, personal, and educational use only**. This includes personal reading practice, home use by families, and supplemental use by individual educators in their classrooms.

**Commercial use, institutional deployment, white-labeling, embedding, redistribution, and integration into third-party platforms or products requires a written license agreement from Spry Labs.** Unauthorized commercial deployment constitutes a violation of the Terms of Service and applicable copyright law.

To inquire about commercial licensing, contact **privacy@time-2-read.com**.

---

## Privacy Architecture: Zero Personal Data

Our application is built on a **zero-PII architecture** — we do not collect, store, or process any personal information.

| What We Collect | What We Don't Collect |
|----------------|----------------------|
| Random session ID (UUID) — deleted on browser close | Names, emails, or contact information |
| Grade level selection | Age, birthdate, or demographics |
| Practice responses — ephemeral only | Location data or IP addresses for tracking |
| Language preference (English/Spanish) | Device identifiers or fingerprints |
| | Voice recordings (speech runs locally in-browser) |
| | Browsing history or cross-site behavior |

**All session data is automatically deleted when the browser closes.** There are no user profiles, no login credentials, and no persistent records of any individual's usage.

---

## Platform Capabilities

### Multilingual Support

The application currently supports **English** and **Spanish** across all features:
- AI-generated reading passages
- Assessment and vocabulary tools
- Phonics exercises
- AI Reading Buddy (tutor)
- All UI labels, navigation, and instructions

Language selection is stored only in-browser (localStorage) and is never transmitted to any server.

### Curriculum Structure

A structured **200-hour curriculum map** is available, organized into:
- **5 grade bands:** K–2, 3–5, 6–8, 9–12, College
- **4 modules per band** (10 hours each)
- **8 core reading skills:** Phonics, Decoding, Vocabulary, Inference, Cause & Effect, Reasoning, Critical Thinking, Comprehension
- Downloadable `.docx` curriculum document included with the application

### Progressive Web App (PWA) / Offline Support

The application is a **Progressive Web App (PWA)**, enabling:
- **Home screen installation** from mobile/tablet browsers (no app store required)
- **Offline access** to previously visited pages and cached assets
- **Standalone mode** for a native-app-like experience
- Network-first caching strategy with automatic offline fallback

### AI Content Safety

The AI Reading Buddy (tutor) includes **topic guardrails** that restrict responses to reading-related educational content only. The AI will not engage with off-topic requests, inappropriate content, or non-educational queries. All AI content generation is filtered through educational prompts with age-appropriate constraints.

---

## Tablet & Institutional Deployment

### SCORE 7c Compatibility (Correctional Facilities)

The application has been designed with compatibility for restricted tablet environments:
- **PWA installable** via the device browser — no app store access required
- **Offline caching** of previously visited content
- **No external CDN dependencies** at runtime for core functionality
- **Touch-optimized responsive UI** tested across tablet viewports

**Status:** Likely compatible; formal testing on SCORE 7c hardware pending. A commercial license from Spry Labs is required for institutional deployment.

### Section 508 Accessibility

Accessibility features include semantic HTML, ARIA labels, keyboard navigation support, and responsive design. Full Section 508 / WCAG 2.1 AA audit is planned as part of institutional deployment readiness.

---

## Security Controls

| Control | Implementation |
|---------|----------------|
| Encryption in transit | TLS/HTTPS enforced on all connections |
| Encryption at rest | Cloud provider encryption on database |
| Database access control | Row Level Security (RLS) on all tables |
| Secrets management | Platform-managed; never in source code |
| Input validation | Character limits, enumerated values, PII warnings |
| AI content guardrails | Topic-restricted to reading/education only |
| Service worker security | SW excluded from preview/iframe contexts; OAuth routes excluded from cache |
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
| **Section 508** | ⚠️ In Progress | Semantic HTML; full audit planned |
| **FISMA** | 🔴 Not Yet | Would require formal certification for federal deployment |
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
No personal data exists to delete. Sessions auto-delete on browser close. Browser-side data (optional Reading Buddy name and language preference in localStorage) can be cleared through standard browser settings. A data subject access request would confirm: no personal data held.

**What happens in a breach?**  
We maintain a formal Incident Response Plan with severity classification, 72-hour GDPR notification commitment, specific scenario playbooks, and escalation procedures. Because no personal data is collected, the impact of any breach is fundamentally limited — no identities, credentials, or financial data can be exposed. Zero incidents to date.

**Do you support DPAs?**  
Yes. We provide a Data Processing Agreement template covering GDPR Article 28 obligations, sub-processor management, breach notification, audit rights, and data return/deletion. We also accept customer-provided DPA templates for review.

**Is this safe for children?**  
Yes. No personal information is collected from any user, including children. No accounts, no age verification, no tracking. AI content is prompted for age-appropriate material and topic-restricted to reading education only. We maintain a dedicated Children's Safety Addendum documenting COPPA compliance.

**Does it work on restricted tablets (e.g., SCORE 7c)?**  
The application is a PWA installable via the device browser without app store access. Previously visited content is cached for offline use. Formal testing on SCORE 7c hardware is pending; a commercial license is required for institutional deployment.

**What languages are supported?**  
English and Spanish. All features — AI passages, assessments, vocabulary, phonics, UI — are fully translated. Additional languages can be added based on institutional demand.

---

## Available Documentation

The following documents are available upon request:

| Document | Description |
|----------|-------------|
| Privacy Policy | Full privacy policy (also at heygetonmylevel.lovable.app/privacy) |
| Terms of Service | Full terms (also at heygetonmylevel.lovable.app/terms) |
| Security Overview | Detailed security posture for enterprise evaluation |
| Curriculum Map | 200-hour structured curriculum (downloadable .docx) |
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
**Commercial Licensing:** privacy@time-2-read.com

---

*This document is maintained as part of the HeyGetOnMyLevel compliance documentation package. All claims are backed by corresponding detailed documents available upon request.*
