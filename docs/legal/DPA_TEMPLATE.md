# Data Processing Agreement (DPA) Template

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Purpose:** Template for enterprise customers requiring a DPA

---

## IMPORTANT NOTE

This DPA template is provided for transparency and as a starting point for enterprise engagements. Because HeyGetOnMyLevel **does not collect personal information**, the practical scope of this DPA is minimal. However, we provide this document to satisfy procurement requirements.

**This template is ready for execution. We also accept customer-provided DPA templates for review.**

---

## DATA PROCESSING AGREEMENT

**Between:**

**Data Controller:** [Customer Name] ("Controller")  
**Data Processor:** HeyGetOnMyLevel, operated by Time-2-Read ("Processor")

**Effective Date:** _______________

---

### 1. Definitions

**Personal Data:** Any information relating to an identified or identifiable natural person, as defined by applicable data protection laws.

**Processing:** Any operation performed on personal data, including collection, recording, storage, retrieval, use, disclosure, and erasure.

**Sub-processor:** A third party engaged by the Processor to process personal data on behalf of the Controller.

---

### 2. Scope and Nature of Processing

#### 2.1 Processing Activities

The Processor provides a reading practice application. The nature of processing is:

| Attribute | Description |
|-----------|-------------|
| Subject Matter | Educational reading practice service |
| Duration | Duration of this agreement |
| Nature | Hosting and delivery of application |
| Purpose | Providing reading practice functionality |
| Type of Personal Data | None collected by design |
| Categories of Data Subjects | Application users (anonymous) |

#### 2.2 No Personal Data Collection

The Processor's application is architecturally designed to operate without collecting personal data. Specifically:
- No user registration or accounts
- No names, emails, or contact information
- No persistent identifiers
- Ephemeral session data only (auto-deleted)

---

### 3. Processor Obligations

The Processor shall:

a) Process data only on documented instructions from the Controller  
b) Ensure persons authorized to process data are bound by confidentiality  
c) Implement appropriate technical and organizational security measures  
d) Not engage sub-processors without prior authorization (see Section 6)  
e) Assist the Controller with data subject rights requests  
f) Delete or return all personal data at the end of the agreement  
g) Make available information necessary to demonstrate compliance  

---

### 4. Security Measures

The Processor implements the following technical and organizational measures:

| Measure | Implementation |
|---------|----------------|
| Encryption in transit | TLS/HTTPS on all connections |
| Encryption at rest | Cloud provider encryption |
| Access control | Row Level Security on database |
| Secrets management | Platform-managed environment variables |
| Data minimization | No personal data collected |
| Automatic deletion | Session data auto-deleted |

---

### 5. Data Breach Notification

The Processor shall:

a) Notify the Controller without undue delay (and within 72 hours) upon becoming aware of a personal data breach  
b) Provide sufficient information for the Controller to meet its notification obligations  
c) Cooperate with the Controller in investigating and remediating the breach  

**Note:** Given that no personal data is collected, the likelihood of a personal data breach is extremely low.

---

### 6. Sub-processors

#### 6.1 Current Sub-processors

| Sub-processor | Purpose | Location | Data Access |
|--------------|---------|----------|-------------|
| Lovable Cloud | Hosting + database | Cloud infrastructure | Anonymous session data |
| Lovable AI | Content generation | Cloud infrastructure | No user data |
| Resend | Email delivery | United States | Feedback messages only |

#### 6.2 Changes to Sub-processors

The Processor shall:
a) Inform the Controller of any intended addition or replacement of sub-processors  
b) Provide the Controller an opportunity to object to such changes  
c) Ensure sub-processors are bound by equivalent data protection obligations  

---

### 7. International Transfers

The Processor shall ensure that any transfer of personal data to a third country is subject to appropriate safeguards as required by applicable data protection law.

**Current status:** No personal data is transferred internationally because no personal data is collected.

---

### 8. Data Subject Rights

The Processor shall assist the Controller in responding to data subject requests, including:
- Right of access
- Right to rectification
- Right to erasure
- Right to data portability
- Right to object

**Current status:** No personal data exists to be subject to these rights.

---

### 9. Audit Rights

The Controller shall have the right to:
a) Request information demonstrating compliance with this DPA  
b) Conduct or commission audits, subject to reasonable notice  

---

### 10. Term and Termination

This DPA shall remain in effect for the duration of the processing activities. Upon termination:
a) The Processor shall cease all processing  
b) The Processor shall delete or return all personal data  
c) The Processor shall certify deletion in writing  

---

### 11. Governing Law

This DPA shall be governed by the laws of the State of Delaware, United States.

---

### SIGNATURES

**Controller:**

Name: _______________  
Title: _______________  
Date: _______________  
Signature: _______________

**Processor:**

Name: _______________  
Title: _______________  
Date: _______________  
Signature: _______________

---

## Document Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 2026 | Initial DPA template |
