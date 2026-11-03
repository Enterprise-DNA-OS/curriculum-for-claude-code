---
description: "Record a committee action, owner and due date."
---

# log-task

Record a committee action, owner and due date.

Run from the repository root:

```sh
npm run curriculum -- log-task --version=NEW/v1 --owner="Mira" --note="File consultation minutes" --due=2027-01-10 --actor="Casey"
```

Read the relevant records first. Use the operator's actual dates and evidence. The example is illustrative, not an instruction to create records.

Accepted flags: --version, --owner, --note, --due, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
