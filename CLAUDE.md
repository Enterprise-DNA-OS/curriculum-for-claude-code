# Curriculum for Claude Code

A curriculum governance desk for an education provider. Programmes, versioned modules, outcome alignment, assessments and internal review decisions live in the database. It does not teach courses, enrol students, award qualifications or submit regulator applications.

## How to work

Read current records before answering or writing. Ask for the intended institution and actor if unknown. Use npm run curriculum -- help for flags. All commands support --json, dates use YYYY-MM-DD and the operational timezone is UTC. All example records are invented.

Never invent curriculum, approval evidence or consultation results. Never send, publish or delete business records. Drafts go to drafts/ and are handed over in chat. Internal approval must be instructed by the reviewer and supported by a record. Read docs/compliance.md before interpreting findings. Actor names are labels, not authentication.

## One route per job

| Command | Purpose |
|---|---|
| /help | Read the accepted commands and flags. |
| /programmes | Read the programme register and accountable owners. |
| /versions | Compare curriculum versions, review states and credit totals. |
| /modules | Read the components of one programme version. |
| /outcomes | Read programme and module learning outcomes. |
| /assessments | Read the assessment methods, criteria and weights. |
| /mapping-gaps | Find learning outcomes without a programme link or an assessment. |
| /credit-check | Compare compulsory module credits with the programme total. |
| /reviews-due | Prepare the academic review queue for the coming week. |
| /quiet-drafts | Find draft versions unchanged for more than fourteen days. |
| /overdue | Find review actions whose due date has passed. |
| /compliance | Check selected curriculum evidence requirements and local policies. |
| /activity | Read the actor and action history. |
| /approvals | Read the internal review decisions and evidence references. |
| /version | Read one version with modules, mappings, assessments and tasks. |
| /add-programme | Register a programme and its owner. |
| /add-version | Start a new draft curriculum version. |
| /add-module | Add a compulsory module and its learning hours. |
| /edit-version | Amend a draft version, dates, credits or rationale. |
| /edit-module | Amend a draft module descriptor. |
| /edit-outcome | Revise an outcome description in a draft. |
| /edit-assessment | Amend a draft assessment method, criteria or weight. |
| /add-outcome | Record a programme outcome or a module learning outcome. |
| /add-assessment | Record an assessment, its criteria and weight. |
| /align-outcome | Map a module outcome to a programme outcome with evidence. |
| /map-assessment | Map an assessment to a learning outcome in the same module. |
| /log-task | Record a committee action, owner and due date. |
| /close-task | Close a review action with its actual resolution. |
| /submit | Freeze a draft for academic review and capture its records. |
| /decide | Record a reviewer decision or return the version for changes. |
| /revise | Copy an approved curriculum into a new draft version. |
| /import | Validate and import an Akari curriculum report. |
| /export | Write a complete private snapshot to a new file. |
| /weekly-review | Draft the Monday review from the queue, mapping gaps and overdue actions. |
| /draft-review | Draft a committee briefing for one version. |
| /customise | Add a tested field or rule change. |
| /new-view | Add a branded read-only report. |
| /documents | Render programme specifications, matrices and committee packs. |
| /views | Render the review week, coverage and findings. |

Exact codes take precedence. Names match without case, ids accept prefixes. Ambiguity lists candidates and exits 1. Do not guess. Submit freezes content; changes returns it to draft; approved content is immutable and revise creates a separate draft.

## Files and access

scripts/curriculum.mjs is the only business CLI. supabase/migrations holds ordered SQL. npm run migrate applies each migration atomically. DATABASE_URL selects PostgreSQL; otherwise DATA_DIR selects local PGlite. Use a trusted database owner connection and restrict the operating-system account. Public access is revoked and row-level security has no public policies. This is not a multi-user identity system.

Read docs/replace-akari.md before importing. The supported input is a mapped report, not a universal Akari export schema. Keep imports, snapshots, generated reports and real evidence out of git. Never seed a working database. New schema changes use a new numbered migration. Run npm test after changes. brand.json controls documents and views.

Built and run through Omni by Enterprise DNA. https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=akari
