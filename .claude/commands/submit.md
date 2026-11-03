---
description: "Freeze a draft for academic review and capture its records."
---

# submit

Freeze a draft for academic review and capture its records.

Run from the repository root:

```sh
npm run curriculum -- submit --version=NEW/v1 --evidence="Committee pack reference" --actor="Casey"
```

Read the version and compliance results first. Submission captures a snapshot and freezes content, including versions with unresolved findings so a committee can review them. It does not approve the programme.

Accepted flags: --version, --evidence, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
