# Ayekta v2 Migration Inventory

## Purpose
This document is the migration inventory extracted from the current `ayekta-pwa-main/index.html` prototype. It is intended to reduce guesswork during the Ayekta v2 rebuild by inventorying the current UI controls, dynamic groups, export wiring, and likely ownership boundaries.

## Key extraction findings
- Static ID-bound controls discovered: **153**
- Dynamic repeating groups discovered in JavaScript: **4**
- Current implementation style: **single monolithic HTML file with inline CSS/JS**
- Current login/auth pattern: **hardcoded provider picker + localStorage session gate**, not real authentication
- Current authorization/RBAC: **none**; once logged in, all fields are visible to all users
- Duplicate DOM IDs detected: **`to_abx` x2, `panel-discharge` x2**

## Source artifacts in current repo
- `index.html` — monolithic UI, inline styles, inline scripts
- `manifest.json` — basic PWA manifest
- `service-worker.js` — thin static asset caching only
- JSON import/export flow exists in-browser

## Migration rules this inventory implies
1. Preserve **clinical module content** and field intent, not the one-page layout.
2. Replace current fake login/provider picker with real auth and role separation.
3. Convert free-form or partially wired sections into explicit domain objects.
4. Split current export payload into internal domain model + FHIR import/export mapper.
5. Treat rows/cards created dynamically in JavaScript as first-class repeatable collections in v2.

## Panel summary

| Panel ID | Panel name | Static controls | Notes |
|---|---:|---:|---|
| `login-or-global` | Login / Global | 1 | Provider selector and JSON-load control live outside the main form. |
| `panel-encounter` | Encounter (H&P) | 59 |  |
| `panel-surgneed` | Surgical Need | 13 |  |
| `panel-or` | OR Record | 29 |  |
| `panel-opnote` | Op Note | 15 |  |
| `panel-nursing` | Nursing Orders | 10 |  |
| `panel-pacu` | PACU Flowsheet | 7 | Includes dynamic repeatable rows/cards created in JS. |
| `panel-floor` | Floor Flowsheet | 0 | Includes dynamic repeatable rows/cards created in JS. |
| `panel-progress` | Progress Notes | 0 | Includes dynamic repeatable rows/cards created in JS. |
| `panel-labs` | Labs | 8 |  |
| `panel-meds` | Medications (New / Dispensed) | 0 | Includes dynamic repeatable rows/cards created in JS. |
| `panel-discharge` | Discharge | 10 | Duplicate empty `panel-discharge` section also exists in DOM. |
| `panel-followup` | Follow-Up | 1 |  |

## Dynamic repeatable groups

### PACU Flowsheet — PACU table rows
- Panel ID: `panel-pacu`
- Source selector: `#pacu_table tbody tr`
- Current export path: `payload.pacu[]`
- Notes: Created with `#pacu_add` button.

| Key/Class | Label | Input type |
|---|---|---|
| `time` | Time | time |
| `bp` | BP | text |
| `hr` | HR | number |
| `rr` | RR | number |
| `spo2` | SpO₂ | number |
| `temp` | Temp | text |
| `pain` | Pain (0–10) | number |
| `interventions` | Interventions / Meds | text |

### Floor Flowsheet — Floor table rows
- Panel ID: `panel-floor`
- Source selector: `#floor_table tbody tr`
- Current export path: `payload.floor[]`
- Notes: Created with `#floor_add` button.

| Key/Class | Label | Input type |
|---|---|---|
| `dt` | Date/Time | datetime-local |
| `bp` | BP | text |
| `hr` | HR | number |
| `rr` | RR | number |
| `spo2` | SpO₂ | number |
| `temp` | Temp | text |
| `notes` | Notes | text |

### Progress Notes — Progress note cards
- Panel ID: `panel-progress`
- Source selector: `#pn_list .card`
- Current export path: `payload.progress_notes[]`
- Notes: Created with `#pn_add` button.

| Key/Class | Label | Input type |
|---|---|---|
| `pn_dt` | Date/Time | datetime-local |
| `pn_pod` | POD# | number |
| `pn_s` | Subjective | textarea |
| `pn_o` | Objective | textarea |
| `pn_a` | Assessment | textarea |
| `pn_p` | Plan | textarea |

### Medications (New / Dispensed) — Prescription cards
- Panel ID: `panel-meds`
- Source selector: `#rx_list .med`
- Current export path: `payload.prescriptions[]`
- Notes: Created with `#rx_add` button.

| Key/Class | Label | Input type |
|---|---|---|
| `rx_drug` | Drug | text |
| `rx_dose` | Dose | text |
| `rx_route` | Route | text |
| `rx_freq` | Frequency | text |
| `rx_duration` | Duration | text |
| `rx_dispensed` | Dispensed at Mission? | select |
| `rx_qty` | Quantity | text |
| `rx_notes` | Notes | textarea |

## Static control inventory

**Important:** `Target ownership / role` below is a **v2 migration recommendation**, not the current runtime behavior. The current app has no real RBAC; every field is visible after login.

### Login / Global (`login-or-global`)

| Field ID | Label | Control | Required | Readonly | Placeholder / options | Current export path guess | Target ownership / role | Conditional logic / migration note |
|---|---|---|---:|---:|---|---|---|---|
| `providerSelect` |  | select / select | no | no | Options: Select Provider, Kristina Lucente, M.D., Ziad Sifri, M.D., Aakash Patel, Konstantin Khariton, DO, Latha Pasupuleti, MD, Ed Lee, MD, Alaine Sharpe, MD, … | UI-only provider picker; current provider stored in localStorage.currentProvider | Shared |  |

### Encounter (H&P) (`panel-encounter`)

| Field ID | Label | Control | Required | Readonly | Placeholder / options | Current export path guess | Target ownership / role | Conditional logic / migration note |
|---|---|---|---:|---:|---|---|---|---|
| `age` | Age | input / text | no | yes |  | payload.patient.age | Shared |  |
| `allergies` | Allergies | textarea / textarea | no | no | Placeholder: NKDA or list drug/food/environmental | payload.preop.allergies | Nurse primary / Shared |  |
| `asa` | ASA Class | select / select | no | no | Options: —, I, II, III, IV, V, I-E, II-E, … | payload.preop.asa | Nurse primary / Shared |  |
| `assessment` | Assessment | textarea / textarea | no | no |  | payload.encounter.assessment | Shared |  |
| `cc` | CC | select / select | no | no | Options: —, Abdominal pain, Groin swelling, Breast lump, Burn injury, Other | payload.encounter.cc | Shared |  |
| `cc_other` | If Other, specify | input / text | no | no |  | Unmapped or UI-only in current export; needs explicit mapping in v2 | Shared | Shown or relevant when Chief Complaint = Other |
| `consent_status` | Consent Obtained? | select / select | no | no | Options: —, yes, no, pending | payload.preop.consent_status | Nurse primary / Shared |  |
| `current_meds` | Current Medications | textarea / textarea | no | no | Placeholder: Patient-reported meds already taking | payload.preop.current_meds | Nurse primary / Shared |  |
| `dob` | Date of Birth | input / date | no | no |  | payload.patient.dob | Shared |  |
| `fhx_cancer` | Cancer | input / checkbox | no | no |  | Inferred: payload.encounter.history.fhx_structured.cancer (current export only stores `payload.encounter.history.fhx`) | Shared |  |
| `fhx_diabetes` | Diabetes | input / checkbox | no | no |  | Inferred: payload.encounter.history.fhx_structured.diabetes (current export only stores `payload.encounter.history.fhx`) | Shared |  |
| `fhx_heart_disease` | Heart disease | input / checkbox | no | no |  | Inferred: payload.encounter.history.fhx_structured.heart_disease (current export only stores `payload.encounter.history.fhx`) | Shared |  |
| `fhx_hypertension` | Hypertension | input / checkbox | no | no |  | Inferred: payload.encounter.history.fhx_structured.hypertension (current export only stores `payload.encounter.history.fhx`) | Shared |  |
| `fhx_notes` | Details | textarea / textarea | no | no |  | Inferred: payload.encounter.history.fhx_structured.notes (current export only stores `payload.encounter.history.fhx`) | Shared |  |
| `fhx_other` | Other | input / checkbox | no | no |  | Inferred: payload.encounter.history.fhx_structured.other (current export only stores `payload.encounter.history.fhx`) | Shared | Relevant when corresponding select/checkbox set includes Other |
| `first_name` | First Name | input / text | yes | no |  | payload.patient.first_name | Shared |  |
| `hpi_course` | Course | select / select | no | no | Options: —, improving, stable, worsening | Inferred: payload.encounter.hpi_structured.course (current export only stores free-text `payload.encounter.hpi`) | Shared |  |
| `hpi_duration` | Duration | input / number | no | no | Placeholder: e.g., 3 | Inferred: payload.encounter.hpi_structured.duration (current export only stores free-text `payload.encounter.hpi`) | Shared |  |
| `hpi_duration_unit` | Duration Unit | select / select | no | no | Options: —, days, weeks, months | Inferred: payload.encounter.hpi_structured.duration_unit (current export only stores free-text `payload.encounter.hpi`) | Shared |  |
| `hpi_notes` | Notes | textarea / textarea | no | no |  | Inferred: payload.encounter.hpi_structured.notes (current export only stores free-text `payload.encounter.hpi`) | Shared |  |
| `hpi_pain` | Pain Score (0–10) | input / number | no | no |  | Inferred: payload.encounter.hpi_structured.pain (current export only stores free-text `payload.encounter.hpi`) | Shared |  |
| `ishi_id` | ISHI ID | input / text | no | yes |  | payload.patient.ishi_id | Shared |  |
| `last_name` | Last Name | input / text | yes | no |  | payload.patient.last_name | Shared |  |
| `physical_exam` | PE | textarea / textarea | no | no |  | payload.encounter.physical_exam | Shared |  |
| `plan` | Plan | textarea / textarea | no | no |  | payload.encounter.plan | Shared |  |
| `pmhx_asthma` | Asthma | input / checkbox | no | no |  | Inferred: payload.encounter.history.pmhx_structured.asthma (current export only stores `payload.encounter.history.pmhx`) | Shared |  |
| `pmhx_diabetes` | Diabetes | input / checkbox | no | no |  | Inferred: payload.encounter.history.pmhx_structured.diabetes (current export only stores `payload.encounter.history.pmhx`) | Shared |  |
| `pmhx_hypertension` | Hypertension | input / checkbox | no | no |  | Inferred: payload.encounter.history.pmhx_structured.hypertension (current export only stores `payload.encounter.history.pmhx`) | Shared |  |
| `pmhx_notes` | Details | textarea / textarea | no | no |  | Inferred: payload.encounter.history.pmhx_structured.notes (current export only stores `payload.encounter.history.pmhx`) | Shared |  |
| `pmhx_other` | Other | input / checkbox | no | no |  | Inferred: payload.encounter.history.pmhx_structured.other (current export only stores `payload.encounter.history.pmhx`) | Shared | Relevant when corresponding select/checkbox set includes Other |
| `pmhx_tuberculosis` | Tuberculosis | input / checkbox | no | no |  | Inferred: payload.encounter.history.pmhx_structured.tuberculosis (current export only stores `payload.encounter.history.pmhx`) | Shared |  |
| `pshx_appendectomy` | Appendectomy | input / checkbox | no | no |  | Inferred: payload.encounter.history.pshx_structured.appendectomy (current export only stores `payload.encounter.history.pshx`) | Shared |  |
| `pshx_cesarean_section` | Cesarean section | input / checkbox | no | no |  | Inferred: payload.encounter.history.pshx_structured.cesarean_section (current export only stores `payload.encounter.history.pshx`) | Shared |  |
| `pshx_cholecystectomy` | Cholecystectomy | input / checkbox | no | no |  | Inferred: payload.encounter.history.pshx_structured.cholecystectomy (current export only stores `payload.encounter.history.pshx`) | Shared |  |
| `pshx_hernia_repair` | Hernia repair | input / checkbox | no | no |  | Inferred: payload.encounter.history.pshx_structured.hernia_repair (current export only stores `payload.encounter.history.pshx`) | Shared |  |
| `pshx_notes` | Details | textarea / textarea | no | no |  | Inferred: payload.encounter.history.pshx_structured.notes (current export only stores `payload.encounter.history.pshx`) | Shared |  |
| `pshx_other` | Other | input / checkbox | no | no |  | Inferred: payload.encounter.history.pshx_structured.other (current export only stores `payload.encounter.history.pshx`) | Shared | Relevant when corresponding select/checkbox set includes Other |
| `ros_abdominal_pain` | Abdominal pain | input / checkbox | no | no |  | Inferred: payload.encounter.history.ros_structured.abdominal_pain (current export only stores `payload.encounter.history.ros`) | Shared |  |
| `ros_chest_pain` | Chest pain | input / checkbox | no | no |  | Inferred: payload.encounter.history.ros_structured.chest_pain (current export only stores `payload.encounter.history.ros`) | Shared |  |
| `ros_cough` | Cough | input / checkbox | no | no |  | Inferred: payload.encounter.history.ros_structured.cough (current export only stores `payload.encounter.history.ros`) | Shared |  |
| `ros_fever` | Fever | input / checkbox | no | no |  | Inferred: payload.encounter.history.ros_structured.fever (current export only stores `payload.encounter.history.ros`) | Shared |  |
| `ros_notes` | Details | textarea / textarea | no | no |  | Inferred: payload.encounter.history.ros_structured.notes (current export only stores `payload.encounter.history.ros`) | Shared |  |
| `ros_other` | Other | input / checkbox | no | no |  | Inferred: payload.encounter.history.ros_structured.other (current export only stores `payload.encounter.history.ros`) | Shared | Relevant when corresponding select/checkbox set includes Other |
| `ros_weight_loss` | Weight loss | input / checkbox | no | no |  | Inferred: payload.encounter.history.ros_structured.weight_loss (current export only stores `payload.encounter.history.ros`) | Shared |  |
| `sex` | Sex | select / select | no | no | Options: —, male, female, other, unknown | payload.patient.sex | Shared |  |
| `shx_alcohol_use` | Alcohol use | input / checkbox | no | no |  | Inferred: payload.encounter.history.shx_structured.alcohol_use (current export only stores `payload.encounter.history.shx`) | Shared |  |
| `shx_illicit_drugs` | Illicit drugs | input / checkbox | no | no |  | Inferred: payload.encounter.history.shx_structured.illicit_drugs (current export only stores `payload.encounter.history.shx`) | Shared |  |
| `shx_none` | None | input / checkbox | no | no |  | Inferred: payload.encounter.history.shx_structured.none (current export only stores `payload.encounter.history.shx`) | Shared |  |
| `shx_notes` | Details | textarea / textarea | no | no |  | Inferred: payload.encounter.history.shx_structured.notes (current export only stores `payload.encounter.history.shx`) | Shared |  |
| `shx_other` | Other | input / checkbox | no | no |  | Inferred: payload.encounter.history.shx_structured.other (current export only stores `payload.encounter.history.shx`) | Shared | Relevant when corresponding select/checkbox set includes Other |
| `shx_tobacco_use` | Tobacco use | input / checkbox | no | no |  | Inferred: payload.encounter.history.shx_structured.tobacco_use (current export only stores `payload.encounter.history.shx`) | Shared |  |
| `triage_bp` | BP (mmHg) | input / text | no | no | Placeholder: 120/80 | payload.triage.bp | Nurse primary / Shared |  |
| `triage_hr` | HR (/min) | input / number | no | no |  | payload.triage.hr | Nurse primary / Shared |  |
| `triage_ht` | Height (cm) | input / number | no | no |  | payload.triage.height | Nurse primary / Shared |  |
| `triage_pain` | Pain (0–10) | input / number | no | no |  | payload.triage.pain | Nurse primary / Shared |  |
| `triage_rr` | RR (/min) | input / number | no | no |  | payload.triage.rr | Nurse primary / Shared |  |
| `triage_spo2` | SpO₂ (%) | input / number | no | no |  | payload.triage.spo2 | Nurse primary / Shared |  |
| `triage_temp` | Temp (°C) | input / text | no | no | Placeholder: 37.0 | payload.triage.temp | Nurse primary / Shared |  |
| `triage_wt` | Weight (kg) | input / number | no | no |  | payload.triage.weight | Nurse primary / Shared |  |

### Surgical Need (`panel-surgneed`)

| Field ID | Label | Control | Required | Readonly | Placeholder / options | Current export path guess | Target ownership / role | Conditional logic / migration note |
|---|---|---|---:|---:|---|---|---|---|
| `anesthesia_planned` | Anesthesia Planned | select / select | no | no | Options: —, local, regional, general | payload.surgical_need.anesthesia_planned | Surgeon primary |  |
| `ind_bleeding` | Bleeding | input / checkbox | no | no |  | Inferred: payload.surgical_need.indications_structured.bleeding (current export only stores `payload.surgical_need.indications`) | Surgeon primary |  |
| `ind_functional` | Functional limitation | input / checkbox | no | no |  | Inferred: payload.surgical_need.indications_structured.functional (current export only stores `payload.surgical_need.indications`) | Surgeon primary |  |
| `ind_infection` | Infection | input / checkbox | no | no |  | Inferred: payload.surgical_need.indications_structured.infection (current export only stores `payload.surgical_need.indications`) | Surgeon primary |  |
| `ind_mass` | Mass/swelling | input / checkbox | no | no |  | Inferred: payload.surgical_need.indications_structured.mass (current export only stores `payload.surgical_need.indications`) | Surgeon primary |  |
| `ind_other` | Other | input / text | no | no |  | Inferred: payload.surgical_need.indications_structured.other (current export only stores `payload.surgical_need.indications`) | Surgeon primary | Relevant when corresponding select/checkbox set includes Other |
| `ind_pain` | Pain | input / checkbox | no | no |  | Inferred: payload.surgical_need.indications_structured.pain (current export only stores `payload.surgical_need.indications`) | Surgeon primary |  |
| `surg_laterality` | Laterality | select / select | no | no | Options: —, left, right, bilateral, midline/NA | payload.surgical_need.laterality | Surgeon primary |  |
| `surg_notes` | Notes | textarea / textarea | no | no |  | payload.surgical_need.notes | Surgeon primary |  |
| `surg_priority` | Urgency | select / select | no | no | Options: —, elective, urgent, emergent | payload.surgical_need.urgency | Surgeon primary |  |
| `surg_procedure` | Required Procedure | select / select | no | no | Options: —, Hernia Repair, Mass Excision, Hysterectomy, Other | payload.surgical_need.procedure | Surgeon primary |  |
| `surg_procedure_details` | Procedure Details | textarea / textarea | no | no | Placeholder: Enter specifics of planned surgery or details if &#x27;Other&#x27; selected | Inferred adjunct to payload.surgical_need.procedure or payload.surgical_need.notes | Surgeon primary | Relevant when Required Procedure = Other or when procedure details are needed |
| `surg_procedure_other` | If Other, specify | input / text | no | no |  | Inferred adjunct to payload.surgical_need.procedure or payload.surgical_need.notes | Surgeon primary | Relevant when Required Procedure = Other or when procedure details are needed |

### OR Record (`panel-or`)

| Field ID | Label | Control | Required | Readonly | Placeholder / options | Current export path guess | Target ownership / role | Conditional logic / migration note |
|---|---|---|---:|---:|---|---|---|---|
| `an_end` | Anesthesia End | input / time | no | no |  | payload.or_record.an_end | Surgeon primary |  |
| `an_start` | Anesthesia Start | input / time | no | no |  | payload.or_record.an_start | Surgeon primary |  |
| `consent_checkbox` | Informed consent obtained | input / checkbox | no | no |  | payload.or_record.consent_obtained | Surgeon primary |  |
| `count_instruments` | Counts | input / checkbox | no | no |  | payload.or_record.counts.instruments | Surgeon primary |  |
| `count_needles` | Counts | input / checkbox | no | no |  | payload.or_record.counts.needles | Surgeon primary |  |
| `count_sponges` | Counts | input / checkbox | no | no |  | payload.or_record.counts.sponges | Surgeon primary |  |
| `or_an_type` | Anesthesia Type | select / select | no | no | Options: —, local, regional, general | payload.or_record.anesthesia_type | Surgeon primary |  |
| `or_anesth` | Anesthesiologist | select / select | no | no | Options: — | payload.or_record.staff.anesth | Surgeon primary |  |
| `or_assistant` | Assistant | select / select | no | no | Options: —, Kristina Lucente, MD, Keenan Gibson, Aakash Patel, Varoon Phondge, Laura Jao, MD | payload.or_record.staff.assistant | Surgeon primary |  |
| `or_in` | OR In | input / time | no | no |  | payload.or_record.or_in | Surgeon primary |  |
| `or_notes` | Notes | textarea / textarea | no | no |  | payload.or_record.notes | Surgeon primary |  |
| `or_other_staff` | Other Staff | select / select | no | no | Options: —, Ziad Sifri, MD, Konstantin Khariton, DO, Latha Pasupuleti, MD, Ed Lee, MD, Alaine Sharpe, MD, Kristina Lucente, MD, Keenan Gibson, … | payload.or_record.staff.other_staff | Surgeon primary |  |
| `or_out` | OR Out | input / time | no | no |  | payload.or_record.or_out | Surgeon primary |  |
| `or_position` | Positioning | input / text | no | no | Placeholder: supine, prone, lithotomy, etc. | payload.or_record.position | Surgeon primary |  |
| `or_prep` | Skin Prep | select / select | no | no | Options: —, Chlorhexidine, Povidone-iodine, Alcohol-based, Other | payload.or_record.prep | Surgeon primary |  |
| `or_site_notes` | Operative site / Incision notes | textarea / textarea | no | no |  | payload.or_record.site_notes | Surgeon primary |  |
| `or_surgeon` | Surgeon | select / select | no | no | Options: —, Ziad Sifri, MD, Konstantin Khariton, DO, Latha Pasupuleti, MD, Ed Lee, MD, Alaine Sharpe, MD | payload.or_record.staff.surgeon | Surgeon primary |  |
| `proc_end` | Procedure End | input / time | no | no |  | payload.or_record.proc_end | Surgeon primary |  |
| `proc_start` | Procedure Start | input / time | no | no |  | payload.or_record.proc_start | Surgeon primary |  |
| `safety_an_machine` | Safety Checks | input / checkbox | no | no |  | payload.or_record.safety.an_machine | Surgeon primary |  |
| `safety_fire_risk` | Safety Checks | input / checkbox | no | no |  | payload.or_record.safety.fire_risk | Surgeon primary |  |
| `to_abx` | Timeout Checklist | input / checkbox | no | no |  | payload.or_record.timeout.abx | Surgeon primary |  |
| `to_abx` | Timeout Checklist | select / select | no | no | Options: —, None, Ceftriaxone, Ampicillin, Metronidazole, Other | payload.or_record.timeout.abx | Surgeon primary |  |
| `to_abx_dose` | Timeout Checklist | input / text | no | no | Placeholder: Dose/Notes | Inferred adjunct to payload.or_record.timeout.abx details | Surgeon primary | Relevant when timeout antibiotic checkbox is checked |
| `to_abx_time` | Timeout Checklist | input / time | no | no |  | Inferred adjunct to payload.or_record.timeout.abx details | Surgeon primary | Relevant when timeout antibiotic checkbox is checked |
| `to_allergies` | Timeout Checklist | input / checkbox | no | no |  | payload.or_record.timeout.allergies | Surgeon primary |  |
| `to_consent` | Timeout Checklist | input / checkbox | no | no |  | payload.or_record.timeout.consent | Surgeon primary |  |
| `to_id` | Timeout Checklist | input / checkbox | no | no |  | payload.or_record.timeout.id | Surgeon primary |  |
| `to_site` | Timeout Checklist | input / checkbox | no | no |  | payload.or_record.timeout.site | Surgeon primary |  |

### Op Note (`panel-opnote`)

| Field ID | Label | Control | Required | Readonly | Placeholder / options | Current export path guess | Target ownership / role | Conditional logic / migration note |
|---|---|---|---:|---:|---|---|---|---|
| `hernia_F` | F Score | select / select | no | no | Options: —, F1 - Normal, F2 - Reducible with difficulty / painful, F3 - Irreducible, F4 - Complicated (strangulated/obstructed/recurrent) | Inferred: structured hernia score block under payload.op_note.hernia_score or payload.surgical_need.hernia_score | Surgeon primary |  |
| `hernia_H` | H Score | select / select | no | no | Options: —, H1 - Indirect &lt;1.5 cm, H2 - Indirect &gt;1.5 cm, H3 - Direct, H4 - Femoral | Inferred: structured hernia score block under payload.op_note.hernia_score or payload.surgical_need.hernia_score | Surgeon primary |  |
| `hernia_score_details` | Details | textarea / textarea | no | no | Placeholder: Additional notes (e.g., recurrence, mesh, defect size) | Inferred: structured hernia score block under payload.op_note.hernia_score or payload.surgical_need.hernia_score | Surgeon primary |  |
| `op_closure` | Closure | select / select | no | no | Options: —, Primary, Delayed primary, Secondary intention, Mesh, Other | payload.op_note.closure | Surgeon primary |  |
| `op_complications` | Complications | select / select | no | no | Options: —, None, Bleeding, Infection, Nerve injury, Other | payload.op_note.complications | Surgeon primary |  |
| `op_drains` | Drains | select / select | no | no | Options: —, None, JP drain, Penrose, Chest tube, Other | payload.op_note.drains | Surgeon primary |  |
| `op_ebl` | Estimated Blood Loss (mL) | input / number | no | no |  | payload.op_note.ebl | Surgeon primary |  |
| `op_findings` | Findings | textarea / textarea | no | no |  | payload.op_note.findings | Surgeon primary |  |
| `op_media` | Post-Op Media available | input / checkbox | no | no |  | Inferred adjunct to payload.op_note.procedure / payload.op_note.notes | Surgeon primary |  |
| `op_outcome` | Outcome | textarea / textarea | no | no |  | payload.op_note.outcome | Surgeon primary |  |
| `op_procedure` | Procedure Performed | select / select | no | no | Options: —, Hernia Repair, Mass Excision, Hysterectomy, Other | payload.op_note.procedure | Surgeon primary |  |
| `op_procedure_details` | Procedure Details | textarea / textarea | no | no | Placeholder: Enter specifics of surgery or details if &#x27;Other&#x27; selected | Inferred adjunct to payload.op_note.procedure / payload.op_note.notes | Surgeon primary | Relevant when Procedure Performed = Other or when extra details are needed |
| `op_procedure_other` | If Other, specify | input / text | no | no |  | Inferred adjunct to payload.op_note.procedure / payload.op_note.notes | Surgeon primary | Relevant when Procedure Performed = Other or when extra details are needed |
| `op_specimen` | Specimen | select / select | no | no | Options: —, None, Biopsy, Mass, Hysterectomy, Other | payload.op_note.specimen | Surgeon primary |  |
| `op_steps` | Steps/Description | textarea / textarea | no | no |  | payload.op_note.steps | Surgeon primary |  |

### Nursing Orders (`panel-nursing`)

| Field ID | Label | Control | Required | Readonly | Placeholder / options | Current export path guess | Target ownership / role | Conditional logic / migration note |
|---|---|---|---:|---:|---|---|---|---|
| `n_activity` | Activity | input / text | no | no | Placeholder: as tolerated, bedrest, etc. | payload.nursing_orders.activity | Nurse primary / Surgeon review |  |
| `n_condition` | Condition | select / select | no | no | Options: —, good, fair, poor | payload.nursing_orders.condition | Nurse primary / Surgeon review |  |
| `n_diet` | Diet | input / text | no | no | Placeholder: NPO, clear liquids, regular | payload.nursing_orders.diet | Nurse primary / Surgeon review |  |
| `n_dx` | Admit Diagnosis | input / text | no | no |  | payload.nursing_orders.dx | Nurse primary / Surgeon review |  |
| `n_interventions` | Nursing Interventions | textarea / textarea | no | no |  | payload.nursing_orders.interventions | Nurse primary / Surgeon review |  |
| `n_ivfluids` | IV Fluids | input / text | no | no |  | payload.nursing_orders.iv_fluids | Nurse primary / Surgeon review |  |
| `n_notes` | Notes | textarea / textarea | no | no |  | payload.nursing_orders.notes | Nurse primary / Surgeon review |  |
| `n_pain` | Pain Regimen | input / text | no | no |  | payload.nursing_orders.pain | Nurse primary / Surgeon review |  |
| `n_vitals` | Vitals Frequency | input / text | no | no | Placeholder: e.g., q4h | payload.nursing_orders.vitals_freq | Nurse primary / Surgeon review |  |
| `n_ward` | Ward | input / text | no | no |  | payload.nursing_orders.ward | Nurse primary / Surgeon review |  |

### PACU Flowsheet (`panel-pacu`)

| Field ID | Label | Control | Required | Readonly | Placeholder / options | Current export path guess | Target ownership / role | Conditional logic / migration note |
|---|---|---|---:|---:|---|---|---|---|
| `pacu_pain_location` | Pain Location | select / select | no | no | Options: —, Surgical site, Generalized, Other | Inferred: payload.pacu_summary.pain_location or payload.pacu[] adjunct (currently not wired except table rows) | Nurse primary / Surgeon review |  |
| `pacu_pain_notes` | Pain Notes | textarea / textarea | no | no |  | Inferred: payload.pacu_summary.pain_notes or payload.pacu[] adjunct (currently not wired except table rows) | Nurse primary / Surgeon review |  |
| `pacu_pain_score` | Pain Score (0–10) | input / number | no | no |  | Inferred: payload.pacu_summary.pain_score or payload.pacu[] adjunct (currently not wired except table rows) | Nurse primary / Surgeon review |  |
| `pacu_tap` | TAP block performed | input / checkbox | no | no |  | Inferred: payload.pacu_summary.tap or payload.pacu[] adjunct (currently not wired except table rows) | Nurse primary / Surgeon review | Controls visibility of TAP block subsection |
| `pacu_tap_anesthetic` | Local Anesthetic | select / select | no | no | Options: —, Bupivacaine, Ropivacaine, Lidocaine, Other | Inferred: payload.pacu_summary.tap_anesthetic or payload.pacu[] adjunct (currently not wired except table rows) | Nurse primary / Surgeon review | Shown only when `pacu_tap` checkbox is checked |
| `pacu_tap_dose` | Dose | input / text | no | no |  | Inferred: payload.pacu_summary.tap_dose or payload.pacu[] adjunct (currently not wired except table rows) | Nurse primary / Surgeon review | Shown only when `pacu_tap` checkbox is checked |
| `pacu_tap_time` | Time Given | input / time | no | no |  | Inferred: payload.pacu_summary.tap_time or payload.pacu[] adjunct (currently not wired except table rows) | Nurse primary / Surgeon review | Shown only when `pacu_tap` checkbox is checked |

### Labs (`panel-labs`)

| Field ID | Label | Control | Required | Readonly | Placeholder / options | Current export path guess | Target ownership / role | Conditional logic / migration note |
|---|---|---|---:|---:|---|---|---|---|
| `lab_cr` | Creatinine (mg/dL) | input / text | no | no |  | Inferred: payload.labs.core.cr (currently not wired into export payload) | Shared |  |
| `lab_hb` | Hemoglobin (g/dL) | input / text | no | no |  | Inferred: payload.labs.core.hb (currently not wired into export payload) | Shared |  |
| `lab_hiv` | HIV Status | select / select | no | no | Options: —, negative, positive, unknown | Inferred: payload.labs.core.hiv (currently not wired into export payload) | Shared |  |
| `lab_k` | Potassium (K) | input / text | no | no |  | Inferred: payload.labs.core.k (currently not wired into export payload) | Shared |  |
| `lab_na` | Sodium (Na) | input / text | no | no |  | Inferred: payload.labs.core.na (currently not wired into export payload) | Shared |  |
| `lab_other` | Other | textarea / textarea | no | no |  | Inferred: payload.labs.core.other (currently not wired into export payload) | Shared | Relevant when corresponding select/checkbox set includes Other |
| `lab_platelets` | Platelets | input / text | no | no |  | Inferred: payload.labs.core.platelets (currently not wired into export payload) | Shared |  |
| `lab_wbc` | WBC | input / text | no | no |  | Inferred: payload.labs.core.wbc (currently not wired into export payload) | Shared |  |

### Discharge (`panel-discharge`)

| Field ID | Label | Control | Required | Readonly | Placeholder / options | Current export path guess | Target ownership / role | Conditional logic / migration note |
|---|---|---|---:|---:|---|---|---|---|
| `dc_ambulation` | Criteria Met | input / checkbox | no | no |  | payload.discharge.criteria.ambulation | Shared |  |
| `dc_diet` | Criteria Met | input / checkbox | no | no |  | payload.discharge.criteria.diet | Shared |  |
| `dc_followup_date` | Follow-up Date | input / date | no | no |  | payload.discharge.followup.date | Shared |  |
| `dc_followup_location` | Follow-up Location | input / text | no | no |  | payload.discharge.followup.location | Shared |  |
| `dc_instructions` | Discharge Instructions | textarea / textarea | no | no | Placeholder: Diet, activity, wound care, restrictions, return precautions | payload.discharge.instructions | Shared |  |
| `dc_md` | MD Signoff | input / text | no | no |  | payload.discharge.signoff.md | Surgeon |  |
| `dc_rn` | RN Signoff | input / text | no | no |  | payload.discharge.signoff.rn | Nurse |  |
| `dc_voiding` | Criteria Met | input / checkbox | no | no |  | payload.discharge.criteria.voiding | Shared |  |
| `dc_wound` | Criteria Met | input / checkbox | no | no |  | payload.discharge.criteria.wound | Shared |  |
| `loadJsonInput` |  | input / file | no | no |  | UI-only file input for loading prior JSON | Shared | Triggered only by &#x27;Existing Patient&#x27; / JSON load flow |

### Follow-Up (`panel-followup`)

| Field ID | Label | Control | Required | Readonly | Placeholder / options | Current export path guess | Target ownership / role | Conditional logic / migration note |
|---|---|---|---:|---:|---|---|---|---|
| `followup_notes` | Notes | textarea / textarea | no | no | Placeholder: Enter follow-up notes here | payload.followup_notes[] (currently empty array in export; textarea not wired into payload) | Shared |  |

## Explicit migration gaps discovered

These controls exist in the UI but are not cleanly or fully wired into the current export payload and therefore need explicit treatment in v2:

- `cc_other`
- `hpi_duration`
- `hpi_duration_unit`
- `hpi_pain`
- `hpi_course`
- `hpi_notes`
- `pmhx_*`
- `pshx_*`
- `fhx_*`
- `shx_*`
- `ros_*`
- `ind_*`
- `surg_procedure_other`
- `surg_procedure_details`
- `lab_*`
- `op_procedure_other`
- `op_procedure_details`
- `op_media`
- `hernia_H`
- `hernia_F`
- `hernia_score_details`
- `pacu_pain_score`
- `pacu_pain_location`
- `pacu_pain_notes`
- `pacu_tap`
- `pacu_tap_anesthetic`
- `pacu_tap_dose`
- `pacu_tap_time`
- `to_abx_time`
- `to_abx_dose`
- `followup_notes`

## Migration recommendations by category

### 1. Authentication / provider identity
- `providerSelect` should be retired as a hardcoded login mechanism.
- Replace with tenant-admin-created users, real usernames/passwords, role assignment, and offline cached session unlock on trusted devices.

### 2. Patient identity
- Preserve current patient core fields.
- Replace generated `ISHI ID` logic with stable patient identity model: **Ayekta UUID + facility-local MRN + tenant-specific external ID if needed**.

### 3. Encounter and history
- Convert checkbox-heavy PMHx/PSHx/FHx/SHx/ROS blocks into structured domain sub-objects.
- Preserve narrative summaries where useful, but do not rely on only free-text aggregate fields in v2.

### 4. Surgical modules
- Preserve `Surgical Need`, `OR Record`, `Op Note`, `Nursing Orders`, `PACU`, `Floor`, `Progress Notes`, `Discharge`, and `Follow-Up` as distinct encounter submodules.
- Convert current table/card JS patterns into proper repeatable collections with IDs and versioning.

### 5. Labs and outcomes
- `lab_*`, hernia score fields, wound/pain/TAP fields, and follow-up notes need explicit domain objects and analytics hooks in v2.

### 6. Documents and import/export
- Current JSON import/export behavior should be preserved only as a migration utility, not as the primary persistence model.
- Binary attachments and scanned reports should move to object storage + metadata records.

## Build-blocking issues to account for during migration

- Duplicate DOM IDs (`to_abx`, `panel-discharge`) create ambiguity and must not be carried forward.
- Several UI controls are present but not exported, meaning a naive rebuild could silently lose data fidelity.
- Current provider/session state relies on `localStorage`, which should not be used for PHI-bearing chart data or trust-critical session behavior in v2.
- The current export payload is form-shaped rather than domain-shaped; v2 must not preserve that architecture.

## Recommended immediate next step for Claude Code

Before implementation begins, use this inventory to generate:
1. a **field-to-domain mapping table**
2. a **field-to-FHIR mapping table**
3. a **screen/component decomposition plan**
4. a **role-visibility matrix**

This inventory is sufficient to stop the rebuild from guessing at module boundaries and field intent.
