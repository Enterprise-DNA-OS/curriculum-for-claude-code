---
description: "Revise an outcome description in a draft."
---

# edit-outcome

Revise an outcome description in a draft.

Run from the repository root:

```sh
npm run curriculum -- edit-outcome --version=NEW/v1 --outcome=GPO1 --description="Evaluate evidence for workplace decisions" --actor="Casey"
```

Read the relevant records first. Use the operator's actual dates and evidence. The example is illustrative, not an instruction to create records.

Accepted flags: --version, --outcome, --description, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
