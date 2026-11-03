# Curriculum for Claude Code

Keep programme versions, learning outcomes, assessment coverage and review decisions in a database you own. Ask what is missing before the next academic committee meeting.

## Three ways to own it

- **Do it yourself:** install the free MIT-licensed base and use Claude Code, Codex, OpenCode or Cursor. Hosting, agent subscriptions and your time are separate costs.
- **We customise it:** Enterprise DNA maps your Akari records, changes fields and academic rules, connects existing systems and builds a web front end or another stack when needed. One setup fee, then a retainer for ongoing work.
- **We run it for you:** Omni by Enterprise DNA installs it, manages access and backups, prepares reviews and keeps the system working. One setup fee, then a retainer.

[Book a 30-minute call with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=akari).

## Run the invented demo

Node 20 or newer. No cloud account needed.

```sh
npm install
npm test
npm run demo
npm run curriculum -- reviews-due
npm run curriculum -- mapping-gaps --json
npm run view
npm run docs
```

The synthetic demo includes three programmes, an overdue review, an unassessed outcome, a credit gap, inconsistent learning hours and an overdue committee action. Repeated seeding preserves existing demo programmes and edits. Never seed real data. Use a fresh DATA_DIR for real records. Set DATABASE_URL for PostgreSQL, or leave it empty for embedded PGlite in .data/db.

## What the base does

Programme versions hold compulsory modules, programme and module outcomes, assessment methods, weights and mapping evidence. Reviewers can find coverage gaps and prepare a programme specification, mapping matrix and committee pack. Revisions keep old approved curriculum intact.

Submitting captures a snapshot and freezes the version. A reviewer records changes or approval. Approval requires a different actor name, no unresolved record findings and no open review actions. It is an internal decision only. Actors are operator-supplied labels, not authenticated signatures. Database owners can bypass software controls. Accredited academic judgement stays with the institution.

The base models one compulsory pathway per version. Electives, shared modules, multiple award pathways and prerequisites need an agreed extension. Akari offers a broader curriculum suite, institutional identity, downstream connections and publication workflows. This base does not replace a learning platform, student administration, live catalogue, university-wide author permissions or accreditation process. Enterprise DNA scopes those connections and screens for a managed version.

## Recurring work

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

35 CLI commands support --json, with four additional agent recipes: 39 slash commands in total. Flags use --name=value.

## Ten questions your records answer

1. Which programme versions are due for review this week, and who owns each one? (`reviews-due`)
2. Which draft curricula have gone quiet for more than fourteen days? (`quiet-drafts`)
3. Where do compulsory module credits fall short of the programme total? (`credit-check`)
4. Which learning outcomes lack a link to a programme outcome? (`mapping-gaps`)
5. Which module outcomes have no assessment evidence mapped? (`mapping-gaps`)
6. Which programme outcomes have no contributing module outcomes? (`compliance`)
7. Which New Zealand modules have learning hours inconsistent with their credits? (`compliance`)
8. Which review actions are overdue, and who must resolve them? (`overdue`)
9. Who recorded each internal review decision, with what evidence? (`approvals`)
10. What exactly did the submitted curriculum contain before later revisions? (`version --version=<reference>`)

These are working analyses, not an unsupported claim that Akari cannot answer them. An owned database lets your institution change the questions and join its own evidence.

## Your first hour: ten things to ask for

1. Put our name, colours and logo in brand.json.
2. Show the review queue for the coming week.
3. Explain the difference between expected and recorded credits.
4. Find learning outcomes that are not assessed.
5. Draft the Monday curriculum review.
6. Render a programme specification and mapping matrix.
7. Test our mapped Akari report without saving it.
8. Reconcile imported module counts and credits.
9. Add our external approval reference with a tested migration.
10. Export a private snapshot before changing a rule.

## Bring your Akari records

Read [the replace guide](docs/replace-akari.md). Akari documents configurable CSV report exports. The importer accepts a complete joined curriculum report with a column map, validates relationships and preserves the original CSV and extra fields. Repeating the same file and mapping is a no-op. A changed import cannot overwrite an existing version. All imported versions start as drafts. The fixture is invented, not a captured vendor export. Validate a real institutional export before switching.

```sh
npm run curriculum -- import akari --file=imports/curriculum.csv --map=imports/columns.json --actor="Your name" --dry-run
npm run curriculum -- import akari --file=imports/curriculum.csv --map=imports/columns.json --actor="Your name"
npm run curriculum -- export --out=exports/curriculum-snapshot.json
```

## Documents and views

Edit brand.json, then npm run view renders the review week, coverage and findings. npm run docs renders programme specifications, learning-outcome matrices and committee working packs. Print the HTML to PDF if needed. Original attachments stay in your controlled document store; evidence fields hold references. Nothing sends or publishes. [Why no front end](docs/why-no-front-end.md) covers shared editing and mobile limits.

## Record checks and operations

[Compliance](docs/compliance.md) distinguishes selected NZQA checks from the demo institution's policies. A passing report never certifies approval or curriculum quality. [Research](docs/research.md) records the selection evidence and price limitations.

npm test uses a temporary database and output directory. It exercises every CLI command, draft freezes, review decisions, revisions, atomic imports, duplicate and conflicting input, private exports, ambiguity and HTML escaping. CI is configured for Windows and Ubuntu on Node 20 and 22, plus PostgreSQL 17. It is manually triggered. Only observed runs should be reported as passed. TEST_DATABASE_URL must point to an empty disposable database.

Domain tables have row-level security enabled, no public policies and PUBLIC privileges removed. Views run with the caller's permissions. Restrict OS and database access. This base uses a trusted owner connection, not tenant identity. export writes a new full JSON snapshot, including import originals and decision snapshots. Native database backups remain necessary; snapshot restore is a reviewed maintenance operation.

## Licence

MIT. Copyright 2026 Enterprise DNA. Akari belongs to its owner. This independent implementation contains no vendor code or assets.
