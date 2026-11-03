---
description: "Map an assessment to a learning outcome in the same module."
---

# map-assessment

Map an assessment to a learning outcome in the same module.

Run from the repository root:

```sh
npm run curriculum -- map-assessment --version=NEW/v1 --assessment=A1 --outcome=LO1 --actor="Casey"
```

Read the relevant records first. Use the operator's actual dates and evidence. The example is illustrative, not an instruction to create records.

Accepted flags: --version, --assessment, --outcome, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
