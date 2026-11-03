---
description: "Copy an approved curriculum into a new draft version."
---

# revise

Copy an approved curriculum into a new draft version.

Run from the repository root:

```sh
npm run curriculum -- revise --version=NEW/v1 --number=2 --review-due=2028-01-15 --effective=2028-03-01 --rationale="Annual review" --actor="Casey"
```

Use only on an approved version. Mappings are copied with new ids, while old approval evidence stays on the old version. Review tasks and approval status do not carry over.

Accepted flags: --version, --number, --review-due, --effective, --rationale, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
