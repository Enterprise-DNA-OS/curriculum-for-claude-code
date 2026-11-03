---
description: "Validate and import an Akari curriculum report."
---

# import

Validate and import an Akari curriculum report.

Run from the repository root:

```sh
npm run curriculum -- import akari --file=fixtures/akari-curriculum-report.csv --actor="Casey" --dry-run
```

Read docs/replace-akari.md. Confirm the CSV covers a complete compulsory pathway and inspect the column map. First run --dry-run, reconcile all counts and credits, then repeat without --dry-run on the operator instruction. Imported versions remain drafts. Never use the synthetic fixture as real curriculum.

Accepted flags: --file, --map, --dry-run, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
