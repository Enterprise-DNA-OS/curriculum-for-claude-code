---
description: "Map a module outcome to a programme outcome with evidence."
---

# align-outcome

Map a module outcome to a programme outcome with evidence.

Run from the repository root:

```sh
npm run curriculum -- align-outcome --version=NEW/v1 --learning=LO1 --programme-outcome=GPO1 --evidence="Mapping panel record" --actor="Casey"
```

Read the relevant records first. Use the operator's actual dates and evidence. The example is illustrative, not an instruction to create records.

Accepted flags: --version, --learning, --programme-outcome, --evidence, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
