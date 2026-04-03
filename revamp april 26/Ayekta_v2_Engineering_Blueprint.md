# Ayekta v2 Engineering Blueprint

## Document purpose
This document defines the implementation architecture for **Ayekta v2**. It is intended to be used by Claude Code and engineers as a build-driving blueprint, not just a high-level architecture essay.

Ayekta v2 should be implemented as a **controlled rebuild** of the existing monolithic HTML prototype.

---

## 1. Build objective

Ayekta v2 should be built as a:

**Single-tenant-ready, multi-tenant-capable, offline-first surgical outpatient EMR** with:
- desktop / tablet-first UX
- local-first persistence
- cloud sync when connectivity returns
- surgeon and nurse role separation
- versioned, signed clinical records
- FHIR import/export mapping
- structured analytics for NGO mission reporting

This is not a generic EMR build.

---

## 2. Locked architecture decisions

These should be treated as non-negotiable unless explicitly changed.

### Frontend stack
Use:
- React
- TypeScript
- Vite
- React Router
- React Hook Form
- Zod
- Dexie for IndexedDB
- TanStack Query for server sync / network orchestration only
- Zustand for app and UI state
- Vite PWA plugin / Workbox

### Backend stack
Recommended:
- **FastAPI (Python)**

Alternative:
- NestJS (TypeScript)

FastAPI is preferred because it is well suited for:
- typed API design
- healthcare data transforms
- later analytics pipelines
- background job handling

### Data stores
Use:
- Postgres for operational data
- S3-compatible object storage for attachments
- Redis optional later for queueing / caching, not required in v1

### Deployment model
Reference deployment:
- frontend on static hosting / CDN
- backend API on containers
- Postgres managed
- S3-compatible attachment storage

Hosting should remain modular enough that tenants can later choose their own compliant environment.

---

## 3. Core engineering principles

### 3.1 Local-first, not cloud-first
All charting writes happen locally first. Cloud is for reconciliation and distribution, not the primary source of truth during active use.

### 3.2 Structured domain model, not form-shaped JSON
Canonical order:
1. UI form state
2. internal domain entity
3. signed / versioned record
4. sync event
5. FHIR import / export mapping

### 3.3 Signed records are immutable
Any post-sign edit creates a new version. The original signed version remains immutable.

### 3.4 Offline support is real
Offline must support:
- cached authenticated session on trusted device
- patient search on locally available records
- full charting offline
- queued attachments where feasible
- visible sync state

### 3.5 Multi-tenancy exists in architecture
Even if ISHI is the first tenant, every table and API boundary should understand:
- tenant
- facility
- user
- role

### 3.6 Nurse-heavy documentation is first-class
Nurse workflows must be built intentionally, not bolted on after surgeon flows.

---

## 4. Repo structure

Lock the repo structure before generation.

```text
ayekta-v2/
  apps/
    web/
      src/
        app/
          router/
          providers/
          layouts/
        features/
          auth/
          dashboard/
          patients/
          encounters/
          vitals/
          allergies/
          meds/
          labs/
          imaging/
          procedures/
          preop/
          postop/
          wound/
          complications/
          outcomes/
          attachments/
          analytics/
          admin/
        components/
          ui/
          forms/
          charts/
          navigation/
          status/
        db/
          dexie/
          migrations/
          repositories/
        services/
          api/
          sync/
          fhir/
          auth/
          storage/
        state/
        schemas/
        utils/
        styles/
      public/
        manifest.webmanifest
        icons/
        offline.html
      vite.config.ts
      workbox/
    api/
      app/
        api/
          auth/
          tenants/
          users/
          patients/
          encounters/
          attachments/
          sync/
          analytics/
          fhir/
        domain/
          models/
          services/
          policies/
        infra/
          db/
          storage/
          auth/
          audit/
          queues/
        schemas/
        tests/
      migrations/
      pyproject.toml
  packages/
    shared-types/
    shared-constants/
    fhir-mappers/
    design-tokens/
  docs/
    product-spec/
    engineering-blueprint/
    api-contracts/
    migration-maps/
```

Do not let the implementation agent improvise this.

---

## 5. UI information architecture

The current HTML prototype is over-concentrated in one page. Ayekta v2 should be chart-centered and route-based.

### Top-level routes
- `/login`
- `/dashboard`
- `/patients`
- `/patients/:id`
- `/encounters/:id`
- `/analytics`
- `/admin`

### Role-aware navigation

#### Surgeon
- Dashboard
- Patients
- New Encounter
- Analytics

#### Nurse
- Dashboard
- Patients
- Intake Queue
- Documents

#### Admin
- Dashboard
- Users
- Facilities
- Audit
- Config

### Patient chart tabs
- Summary
- Encounters
- Vitals
- Medications
- Allergies
- Labs
- Imaging
- Procedures
- Wound Follow-up
- Documents

### Encounter sections
1. Intake
2. Encounter / H&P
3. Surgical Need
4. OR Record
5. Op Note
6. Nursing Orders
7. PACU
8. Floor
9. Discharge
10. Follow-up
11. Attachments
12. Review & Sign

This preserves current module intent while replacing the monolithic layout.

---

## 6. Permission matrix

### Surgeon permissions
Can:
- create / edit patients
- create / edit encounters
- review all chart data
- finalize diagnoses
- create / sign orders
- create / sign procedure and op notes
- sign encounters
- amend signed encounters
- export records
- view analytics

Cannot:
- bypass audit/versioning
- destructively overwrite signed records

### Nurse permissions
Can:
- register patient
- update allowed demographics
- enter vitals
- update allergies
- update medication reconciliation
- upload PDFs, scans, reports, and consent forms
- draft encounter notes
- enter pre-op / post-op nursing sections
- enter wound follow-up observations
- enter discharge education documentation
- create pending orders for surgeon review if tenant policy allows

Cannot:
- sign surgeon-authored note sections
- sign final encounter
- finalize operative note
- independently finalize orders
- amend locked surgeon-signed records

### Admin permissions
Can:
- create users
- assign roles
- assign facilities
- reset credentials
- view audit summaries
- manage tenant configuration

Cannot:
- act as clinician by default unless dual-role is explicitly enabled

---

## 7. Domain model

The internal domain model is canonical. The UI and FHIR layers must map to and from it.

### Core entities
- Tenant
- Facility
- User
- Role
- DeviceRegistration
- Patient
- PatientIdentifier
- Encounter
- EncounterVersion
- VitalsPanel
- AllergyRecord
- MedicationListItem
- MedicationOrder
- LabOrder
- LabResult
- ImagingOrder
- ProcedureRecord
- PreOpChecklist
- AnesthesiaPlan
- PostOpOrderSet
- WoundFollowUp
- ComplicationEvent
- SurgicalOutcome
- Attachment
- AuditEvent
- SyncEvent
- MissionAnalyticsSnapshot

### Identity model
- `Patient.id` = Ayekta UUID
- `PatientIdentifier` stores:
  - facility_local_mrn
  - ayekta_id
  - optional external IDs later

Do not overload one generic identifier field.

---

## 8. Postgres schema blueprint

The following tables should exist early in implementation.

### tenants
- id
- name
- slug
- status
- created_at

### facilities
- id
- tenant_id
- name
- type
- timezone
- is_active

### users
- id
- tenant_id
- facility_id
- username
- password_hash
- full_name
- role
- is_active
- last_login_at

### device_registrations
- id
- user_id
- device_fingerprint
- refresh_token_hash
- trusted_until
- revoked_at

### patients
- id
- tenant_id
- facility_id
- ayekta_id
- first_name
- last_name
- dob
- sex
- phone
- address_json
- created_by
- updated_at

### patient_identifiers
- id
- patient_id
- type
- value
- facility_id
- is_primary

### encounters
- id
- tenant_id
- facility_id
- patient_id
- encounter_type
- status
- current_version_id
- created_by
- created_at

### encounter_versions
- id
- encounter_id
- version_number
- authored_by
- role
- status
- data_json
- signed_at
- signed_by
- amendment_reason
- supersedes_version_id
- created_at

### attachments
- id
- tenant_id
- patient_id
- encounter_id nullable
- type
- mime_type
- filename
- storage_key
- uploaded_by
- uploaded_at
- checksum

### audit_events
- id
- tenant_id
- facility_id
- user_id
- entity_type
- entity_id
- action
- metadata_json
- occurred_at

### sync_events
- id
- tenant_id
- device_id
- entity_type
- entity_id
- entity_version
- operation
- status
- error_message
- created_at
- synced_at

### analytics fact tables
Prefer structured fact tables later rather than deriving everything from blobs.

Examples:
- fact_procedures
- fact_complications
- fact_followups
- fact_wound_outcomes

---

## 9. IndexedDB / Dexie schema blueprint

This is the local offline engine.

### Dexie tables
- sessionCache
- referenceData
- patients
- patientIdentifiers
- encounters
- encounterVersions
- attachmentsMeta
- pendingAttachments
- syncQueue
- auditEventsLocal

### Requirements
- every write path needs error handling
- every startup needs schema / version migration checks
- every screen must tolerate missing or partially synced local data
- never assume local data is pristine
- no PHI-bearing chart data in localStorage

---

## 10. Sync architecture

### v1 sync topology
**Device → cloud only**

Clinic node is a future design consideration, not a v1 deliverable.

### Sync pattern
- user action writes to IndexedDB immediately
- app appends a syncQueue item
- background sync worker flushes when online
- success updates local state and marks queue item synced
- failure leaves queue item pending or errored
- user sees status badge at all times

### Sync queue item shape
- id
- entity_type
- entity_id
- version_id
- operation
- payload_hash
- created_at
- retry_count
- status
- last_error

### Conflict rules

#### Patient demographics
- field-level merge if safe
- otherwise newest verified change wins
- create audit conflict record

#### Encounters
- if current server version differs from local base version and local record is unsigned draft:
  - mark conflict
  - require manual review
- if local change is to a signed record:
  - server creates amendment version, never overwrite

#### Attachments
- immutable content
- metadata changes create update record, not blob overwrite

### Sync API routes
- `POST /sync/pull`
- `POST /sync/push`
- `POST /sync/ack`

Do not rely on ad hoc REST calls per table for reconciliation.

---

## 11. Auth and session architecture

### Auth model
- users created by tenant admin
- user logs in online first with username/password
- server returns short-lived access token and refresh token
- device registration established
- encrypted session envelope cached locally
- offline unlock allowed only on registered device and within policy window

### Offline login rules

Allowed:
- previously authenticated user on trusted device
- unlock with cached credential/session envelope
- re-auth prompt for signing or amending if session is stale

Not allowed:
- first-ever login offline
- untrusted device offline access
- role escalation offline

### Security rules
- access token in memory where feasible
- refresh token in secure cookie or equivalent secure storage pattern
- no casual localStorage-based auth model
- signing / amendment can require re-authentication

---

## 12. Audit and versioning blueprint

### Clinical record lifecycle
- draft
- signed
- amended
- superseded

### Signing flow
- clinician clicks Sign
- app forces re-auth if required by policy
- record version frozen
- signature metadata saved
- new edits must fork a new version

### Audit events to log in v1
- login success / failure
- logout
- patient create / update
- encounter create / edit / sign / amend
- order create / update / sign
- attachment upload
- export / import
- sync failure / success
- user / role changes

### Audit payload minimum
- actor
- tenant
- facility
- device
- entity
- action
- before / after version refs
- timestamp
- amendment reason if applicable

### Concession
Full view-audit logging may be deferred in the first lean build, but create/edit/sign/export must be tracked.

---

## 13. FHIR mapping layer

FHIR is an interoperability layer, not the internal persistence model.

### Resource mapping matrix

#### Patient
Internal:
- Patient
- PatientIdentifier

FHIR:
- Patient

#### Encounter
Internal:
- Encounter
- EncounterVersion

FHIR:
- Encounter

#### Vitals / wound observations / discrete measurements
Internal:
- VitalsPanel
- WoundFollowUp

FHIR:
- Observation

#### Diagnoses / assessments
Internal:
- diagnosis fields in encounter version

FHIR:
- Condition

#### Medication orders
Internal:
- MedicationOrder

FHIR:
- MedicationRequest

#### Procedures / op notes
Internal:
- ProcedureRecord

FHIR:
- Procedure
- DocumentReference for rendered note/document if needed

#### Labs / imaging reports
Internal:
- LabResult
- ImagingOrder

FHIR:
- DiagnosticReport
- linked Observation entries where structured values exist

#### Attachments
Internal:
- Attachment

FHIR:
- DocumentReference

### FHIR support policy
v1 supports:
- import of selected resources
- export of selected resources
- bundle export for encounter/package handoff

v1 does not support:
- fully general FHIR server behavior
- arbitrary profile support
- raw FHIR-native CRUD UI

---

## 14. Attachments architecture

### v1 supported attachment types
- PDF
- JPG / PNG scans
- scanned referrals
- lab reports
- imaging reports
- consent forms

### v1 explicitly not supported
- PACS behavior
- DICOM archive management
- large imaging study viewer stack

### Storage approach
- object storage for binary documents
- metadata stored in relational DB
- signed URLs for retrieval
- no public bucket access

---

## 15. Hosting blueprint

### Reference deployment
- frontend: static host / CDN
- API: containerized FastAPI service
- DB: managed Postgres
- object storage: S3-compatible bucket
- secrets: managed secret store
- logging: centralized structured logs

### Compliance-conscious minimum
- TLS everywhere
- encryption at rest
- least-privilege IAM
- access logs
- backup policy
- tenant scoping in all DB tables
- no PHI in localStorage
- no public attachment links

### Multi-tenant abstraction interfaces
Keep these interfaces explicit:
- StorageProvider
- AuthProvider
- AuditSink
- ExportProvider

This allows future tenant-level infra choices without a core app rewrite.

---

## 16. Analytics architecture

### Principle
Capture structured fields now. Do not rely on reconstructing mission analytics later from unstructured notes.

### Priority metrics
1. Procedure counts
2. Complication rates
3. Wound healing outcomes
4. Follow-up adherence
5. Diagnosis trends
6. NGO population reporting
7. Site quality metrics
8. Patient demographics
9. Medication usage
10. Surgeon productivity

### Analytics pipeline
- structured data captured in workflow
- nightly or on-demand aggregation jobs
- fact tables or materialized views
- provider-facing mission dashboard

### Dashboard modules
- total encounters by mission / date / site
- consult vs follow-up
- procedure mix
- complications by type
- wound recovery trend
- follow-up completion
- patient demographics
- exportable report views

---

## 17. PWA and service worker blueprint

The current service worker is too thin and should be replaced.

### Service worker responsibilities
- app-shell caching
- offline fallback page
- static asset version management
- deferred sync hooks where supported
- cache cleanup on upgrade

### Rules
- versioned cache names
- explicit cache migration / cleanup
- do not blindly cache sensitive API JSON
- only cache static assets and safe reference data
- clinical data belongs in IndexedDB

### Offline startup behavior
- if app shell exists, app opens
- if local session is valid, unlock screen is shown
- if no valid local session and offline, show constrained access message
- if session valid, load last-synced patient/index data from IndexedDB

---

## 18. Migration plan from current HTML prototype

Claude Code must not rebuild from vague interpretation. A migration inventory is mandatory.

### Step 1: extract field inventory
From the current `index.html`, generate a machine-readable inventory:
- panel name
- field id
- label
- input type
- options
- conditional logic
- required / optional
- role visibility
- output mapping guess

### Step 2: classify fields
Every field becomes one of:
- core reusable clinical field
- surgery-specific field
- tenant-specific custom field
- derived / calculated field
- deprecated field

### Step 3: map fields to domain objects
Examples:
- vitals fields → VitalsPanel
- op note fields → ProcedureRecord
- discharge instructions → encounter version or discharge subobject
- wound checkboxes / measurements → WoundFollowUp

### Step 4: map to screens
Preserve content, not the one-page layout.

### Step 5: define signing/version ownership by section
Some sections are nurse-authored, some surgeon-authored, some mixed.

Without this migration map, buildout remains underdetermined.

---

## 19. Build sequence for Claude Code

### Phase 1 — extraction and schema lock
Deliverables:
- field inventory from current HTML
- final domain model
- final role matrix
- final route map
- Dexie schema
- Postgres schema draft
- FHIR mapping matrix

### Phase 2 — app shell and auth
Deliverables:
- Vite React app
- design tokens
- login route
- role-aware shell
- online auth
- offline cached session unlock
- service worker baseline

### Phase 3 — local persistence
Deliverables:
- Dexie repositories
- patient store
- encounter store
- attachment metadata store
- sync queue
- migration support

### Phase 4 — patient and encounter UX
Deliverables:
- patient registration / search
- patient chart tabs
- encounter composer
- nurse intake workflow
- surgeon workflow

### Phase 5 — surgery modules
Deliverables:
- pre-op
- procedure / op note
- anesthesia fields
- post-op
- wound
- complications
- outcomes

### Phase 6 — versioning and audit
Deliverables:
- sign flow
- amendment flow
- encounter version viewer
- audit event writer

### Phase 7 — sync
Deliverables:
- push / pull sync API
- local queue processor
- status badges
- conflict handling UI

### Phase 8 — attachments and FHIR
Deliverables:
- attachment upload / download
- FHIR import / export mapper
- bundle export
- DocumentReference / DiagnosticReport handling

### Phase 9 — analytics
Deliverables:
- metrics aggregation
- mission dashboard
- exportable reports

---

## 20. Acceptance criteria

### Product acceptance criteria
- surgeon can complete full outpatient surgical encounter offline
- nurse can do intake-heavy documentation without surgeon permissions
- signed encounter becomes immutable
- amendment creates new version
- sync status is always visible
- patient chart loads from local store when offline
- attachments are referenced and retrievable when online
- FHIR export works for supported resources
- analytics dashboard shows real structured counts

### Engineering acceptance criteria
- no PHI stored in localStorage
- all clinical data persisted in IndexedDB locally
- all server entities tenant-scoped
- all write operations audited
- service worker uses versioned caches with cleanup
- IndexedDB migrations are versioned and tested
- sync retries are idempotent
- role checks enforced both client and server side

---

## 21. Handoff package required for buildout

The package given to Claude Code should contain:

1. Product spec  
2. Existing codebase zip  
3. Engineering blueprint  
4. Mandatory migration inventory extracted from the current HTML prototype

Without the migration inventory, the build is still underdetermined and the agent will guess.

---

## 22. Implementation warning

Do not ask Claude Code to “rebuild the whole app” in one undifferentiated pass.

The correct sequence is:
1. lock architecture
2. lock schema
3. extract field inventory
4. implement by phase

If this discipline is skipped, the likely result is:
- a plausible frontend shell
- loss of clinical content fidelity
- arbitrary model decisions
- a weaker product than intended

---

## 23. Final implementation summary

Ayekta v2 should be:
- local-first
- route-based
- componentized
- versioned
- auditable
- FHIR-capable via mapper layer
- analytics-ready
- surgery-scoped
- desktop/tablet-first

Ayekta v2 should not be:
- a refactor-in-place of the monolithic HTML file
- a raw FHIR-native UI
- a cloud-only app
- a billing or scheduling platform
- a PACS replacement

The strongest implementation path is a **controlled rebuild that preserves module intent while replacing the architecture completely**.
