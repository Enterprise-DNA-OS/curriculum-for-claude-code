---
description: "Start a new draft curriculum version."
---

# add-version

Start a new draft curriculum version.

Run from the repository root:

```sh
npm run curriculum -- add-version --programme=NEW --number=1 --title="New Programme" --level=5 --credits=30 --review-due=2027-01-15 --effective=2027-03-01 --rationale="Initial design" --actor="Casey"
```

Read the relevant records first. Use the operator's actual dates and evidence. The example is illustrative, not an instruction to create records.

Accepted flags: --programme, --number, --title, --level, --credits, --review-due, --effective, --rationale, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
