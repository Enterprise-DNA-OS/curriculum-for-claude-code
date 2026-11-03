---
description: "Close a review action with its actual resolution."
---

# close-task

Close a review action with its actual resolution.

Run from the repository root:

```sh
npm run curriculum -- close-task --task=<id> --resolution="Consultation minutes filed" --actor="Casey"
```

Read the relevant records first. Use the operator's actual dates and evidence. The example is illustrative, not an instruction to create records.

Accepted flags: --task, --resolution, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
