# Curriculum record checks

Checked 3 November 2026. These checks identify selected missing or inconsistent records. They do not establish educational quality, award authority, professional accreditation or regulator approval. The institution owns those judgements and its external approval evidence.

## Source and jurisdiction

[NZQA programme approval guidelines](https://www2.nzqa.govt.nz/tertiary/approval-accreditation-and-registration/programme-approval-and-provider-accreditation/guidelines-programme-approval-and-accreditation/) cover New Zealand certificates at levels 1 to 6 and diplomas at levels 5 to 7. They relate credits to planned learning hours, require component descriptors and show the relationships between learning outcomes, graduate outcomes and assessment. One credit represents ten notional learning hours. This software checks only the records described below, not the whole guidance. The programme outcome layer represents the institution's recorded graduate profile mapping for this demo.

| Rule | What the implementation tests | Authority |
|---|---|---|
| nz-learning-hours | Module hours equal ten times module credits when jurisdiction is NZ | NZQA credit convention; applicability to a real qualification must be reviewed |
| programme-outcomes | At least one programme outcome exists | Record completeness supporting NZQA guidance |
| module-outcomes | Every module has learning outcomes | Record completeness supporting NZQA component guidance |
| uncovered-programme-outcome | Every programme outcome has a contributing module outcome | Record mapping check supporting NZQA guidance |
| unmapped-learning-outcome | Every module outcome contributes to a programme outcome | Record mapping check supporting NZQA guidance |
| unassessed-learning-outcome | Every module outcome has a mapped assessment | Record mapping check supporting NZQA assessment guidance |
| unmapped-assessment | Every assessment maps to a module outcome | Local evidence completeness policy |
| credit-total | Compulsory module credits equal programme credits | Local single-pathway policy, not a general rule for electives |
| assessment-weight | Weights total 100 per module | Local weighted-assessment policy, not an NZQA rule |

The evidence-completeness checks run for all jurisdictions as local policy. The ten-hours arithmetic runs only for NZ. No Australian credit-to-hours rule is inferred. This base does not model all NZQCF qualification types or enforce every level-specific credit requirement. It is not an Australian TEQSA or ASQA checker.

## Internal decision controls

Submitting freezes version content and records a snapshot. Requesting changes returns it to draft while preserving the prior snapshot. Approving requires a reviewer label different from the submitter, no open review tasks and no findings. These are local governance controls. They are not legal requirements or authenticated electronic signatures. Actor identities must be verified outside this trusted-operator tool.

Approved versions are immutable through the CLI and ordinary database triggers. Revise copies the curriculum to a new draft, with new ids for its modules and relationships. Review tasks and approvals do not carry over. The old version and review snapshots stay available. A database owner can bypass triggers and remains responsible for access and backups.

## Limits of evidence

An outcome mapping can exist and still be academically wrong. A reference can be entered without the source document being valid. Staff must read assessment methods, criteria, consultation records, qualification requirements and external approval evidence. Source documents remain in the institution's controlled document store. No command issues qualifications, certifies compliance or submits an application.

The fourteen-day quiet-draft threshold and seven-day review horizon are demo policies. Change them through a reviewed migration and tests. Do not invent statutory deadlines from either number. Review rules and source guidance before using the base on real curriculum.
