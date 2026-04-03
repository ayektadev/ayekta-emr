# Ayekta v2 Product Spec

## Document purpose
This document defines the product scope, positioning, workflows, and non-negotiables for **Ayekta v2**. It is intended to give Claude Code and human engineers a stable product source of truth before implementation begins.

---

## 1. Product definition

### One-line thesis
**Ayekta v2 is an offline-first, surgery-scoped, FHIR-capable EMR for outpatient NGO and constrained-care environments, optimized for documentation quality, data integrity, and later analytics.**

### Primary deployment target
**Single outpatient clinic** first.

This is intentionally narrower than a small hospital rollout. The goal is to avoid premature inpatient complexity and keep the first serious build operationally realistic.

### True wedge
Ayekta is **not** a generic EMR.

Its wedge is:

**A surgery-oriented outpatient record system that works reliably offline, structures mission-grade documentation well, and produces clean interoperable data for later sync, review, and analytics.**

---

## 2. Strategic positioning

### What Ayekta should be
- outpatient surgical documentation system
- NGO / constrained-care friendly
- usable with unstable or intermittent connectivity
- strong at operative-adjacent documentation
- strong at wound follow-up and outcomes capture
- strong at structured data capture for later reporting
- modular enough to grow into a broader clinical platform

### What Ayekta should not be
- full hospital ERP
- billing system
- scheduling system
- patient portal in v1
- PACS / radiology archive replacement
- all-specialty EMR from day one
- raw FHIR persistence project

---

## 3. Surgical scope

### Ranked surgical wedge for v1
1. Outpatient surgical consults and follow-ups
2. Post-op wound and recovery tracking
3. Peri-operative documentation
4. Operative case documentation
5. Complications and outcomes logging
6. Surgical NGO camp encounters
7. Trauma / acute field documentation later, not primary

### Interpretation
Ayekta should be clearly surgical in workflow, not merely in branding. Surgery must show up in the sections, documentation patterns, structured data capture, and reporting.

---

## 4. v1 users and roles

### Included roles
- Surgeon
- Nurse
- Admin / Tenant Admin
- Super Admin only if platform-level management is required

### Excluded for now
- Medical student role
- Pharmacist role unless later required by tenant workflow

---

## 5. Role expectations

### Surgeon
Surgeons should be able to:
- create and edit patients
- open and manage encounters
- review prior records
- enter diagnoses, procedures, plans
- create and sign orders
- prescribe medications
- review labs and attachments
- sign and lock records
- unlock via amendment workflow that creates a new version
- export records according to tenant policy
- view mission-level dashboards if authorized

### Nurse
Nurses should be able to:
- register patients
- update allowed demographic fields
- enter vitals
- update allergies
- update medication reconciliation lists
- upload labs, referrals, scanned docs, and consent forms
- draft encounter notes
- complete structured pre-op and post-op nursing fields
- enter wound follow-up observations
- document administered medications if tenant workflow requires it
- provide discharge education documentation
- create pending orders for surgeon review where tenant policy allows
- mark workflow task completion states

Nurses should **not** be able to:
- independently sign or close physician encounters
- finalize diagnoses
- finalize operative notes as surgeon-authored notes
- finalize orders without surgeon authorization
- unlock previously signed surgeon records

### Nurse sign-off model
- nursing documentation sign-off for nurse-authored sections
- surgeon signature for physician sections, orders, and final encounter sign-off

---

## 6. Core workflow Ayekta must do exceptionally well

### Primary workflow
**A surgical outpatient encounter from intake to follow-up, with structured documentation, operative-adjacent fields, attachments, and locked signed versions suitable for later sync and analytics.**

### v1 workflow chain
1. Provider login
2. Patient search or registration
3. Encounter creation
4. Nurse intake
   - vitals
   - allergies
   - meds
   - preliminary notes
   - uploaded docs
5. Surgeon documentation
   - consult
   - history
   - exam
   - assessment / plan
   - procedure / proposed surgery
   - pre-op or post-op modules as needed
6. Orders / attachments / wound fields / outcomes
7. Review + sign
8. Record lock
9. Offline queue and sync status
10. Mission analytics roll-up

---

## 7. Required v1 modules

### In scope immediately
- patient registration
- patient search / open
- encounters
- vitals
- medications
- allergies
- labs
- imaging orders
- attachments / documents
- pre-op checklist
- procedure note
- anesthesia-related fields
- post-op orders
- wound follow-up
- complications log
- surgical outcomes fields

### Explicitly out of scope
- billing
- insurance
- scheduling
- patient self-service portal
- messaging platform
- PACS / full imaging archive
- generalized inpatient ward management
- inventory management unless later essential
- staff rostering
- claims workflows

### Preservation requirement
The **current content of Ayekta’s modules is considered robust** and should be preserved in spirit. The rebuild should strengthen, beautify, structure, and harden them rather than subtract major clinical content.

---

## 8. Identity model

### Patient identification
Use:
- **Facility-local MRN** as operational ID
- **Ayekta ID** as stable internal system ID

Do not rely on name / DOB as the true identifier.

---

## 9. FHIR posture

### Chosen approach
**Internal domain model + FHIR import/export mapper**

### Why
Ayekta should be **FHIR-capable**, not **FHIR-enslaved**. The clinical UX and internal model should not be forced to think in raw FHIR resources at every layer.

---

## 10. Record versioning and signing

### Encounter lifecycle
- draft
- in_review
- signed
- amended
- superseded

### Locking model
- encounter begins as draft
- signer authenticates to sign
- signed encounter becomes locked
- any edit after signing creates a new version
- original signed version remains immutable
- amended version must be re-signed
- audit trail records who amended, when, and why

### Section-level signing
Where appropriate:
- nurse signs nurse-authored sections
- surgeon signs surgeon-authored sections and final encounter

---

## 11. Offline-first product behavior

### What offline-first means for Ayekta
Offline-first is not just cached pages. It means:
- provider can log in with cached session when offline on a trusted device
- patient records already synced to the device can be opened offline
- new registrations can be created offline
- full encounter charting works offline
- attachments can be queued offline
- signed records can be queued offline
- all changes persist locally first
- sync occurs automatically when connectivity returns
- sync state is visible and trustworthy

### v1 sync topology
**Device → cloud first**

### Future consideration
**Clinic node → cloud** is future design consideration only, not a v1 implementation requirement.

---

## 12. Analytics and mission dashboard

### Dashboard audience
The dashboard is **provider-facing**, not patient-facing.

### Purpose
Providers should be able to see mission-level and site-level status at a glance.

### Analytics priorities
1. Procedure counts
2. Complication rates
3. Wound healing outcomes
4. Follow-up adherence
5. Diagnosis trends
6. NGO population reporting
7. Site-level quality metrics
8. Patient demographics
9. Medication usage
10. Surgeon productivity

### Dashboard modules
- encounter volume by day / site
- consult vs follow-up counts
- procedures by type
- wound outcome trends
- complication registry summary
- follow-up completion rates
- patient demographic breakdowns
- exportable reporting views for research and operations

---

## 13. Device priority and UX direction

### Device priority
1. Desktop
2. Tablet
3. Mobile later / limited

### Aesthetic direction
Blend:
- cleaner modern clinical SaaS
- austere institutional

### UX principles
- dense enough for real work
- clear information hierarchy
- readable typography
- explicit save / sync / sign states
- strong left navigation on desktop
- coherent sectioned flow on tablet
- role-aware surfaces
- no giant wall-of-form design
- no stitched prototype feel

---

## 14. Competitive benchmarks

Ayekta should benchmark most heavily against:
- OpenMRS
- OpenEMR
- Bahmni

### What to learn
**From OpenMRS**
- modularity
- configurable platform mindset
- separation of model and workflow

**From OpenEMR**
- seriousness of chart/accountability expectations
- breadth awareness of real EMR surface area
- role discipline

**From Bahmni**
- suitability for constrained settings
- integration mindset
- pragmatic multi-role flow

### What not to become
Ayekta should not become:
- generic
- bloated
- operationally sprawling
- a patchwork of forms with no thesis

---

## 15. Hosting and business posture

### Hosting posture
- production-lean NGO deployment
- compliance-conscious architecture
- modular enough that tenants can later choose their hosting posture
- default reference deployment can be on AWS or another credible cloud
- compliance claims must be disciplined and backed by actual controls

### Business motion
- NGO / public-health pilot is the real product path
- university / research framing can exist as a narrative wrapper and secondary value path

---

## 16. Non-negotiables

The v2 build must preserve:
1. Modularity
2. Offline-first behavior
3. Strong surgery-specific orientation
4. Rich patient data gathering for later analytics
5. Expandability toward a future provider-facing dashboard layer

Additionally:
- preserve the current robust clinical module content in spirit
- replace the architecture, not the clinical intent

---

## 17. Product acceptance criteria

Ayekta v2 is acceptable when:
- a surgeon can complete a full outpatient surgical encounter offline
- a nurse can perform intake-heavy documentation without surgeon permissions
- signed encounters become immutable
- amendments create new versions
- sync status is always visible
- patient charts load from local store when offline
- attachments are referenced and retrievable when online
- FHIR import/export works for supported resources
- the mission dashboard shows real structured counts

---

## 18. Summary

Ayekta v2 should be:
- outpatient first
- surgery scoped
- offline first
- desktop / tablet optimized
- nurse-heavy documentation capable
- versioned and auditable
- FHIR-capable through mappers
- useful for NGO operations and later research analytics

Ayekta v2 should **not** be:
- a patched HTML demo
- a billing system
- a hospital ERP
- a PACS replacement
- a raw FHIR persistence experiment

The strongest form of Ayekta is a **disciplined, surgery-aware, offline-first documentation platform for constrained real-world care environments**.
