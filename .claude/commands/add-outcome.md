---
description: "Record a programme outcome or a module learning outcome."
---

# add-outcome

Record a programme outcome or a module learning outcome.

Run from the repository root:

```sh
npm run curriculum -- add-outcome --version=NEW/v1 --code=GPO1 --description="Evaluate workplace evidence" --actor="Casey"
```

Omit --module for a programme outcome. Add --module=<module> for a module learning outcome. Codes must be unique within the version.

Accepted flags: --version, --module, --code, --description, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
