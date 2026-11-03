---
description: "Record an assessment, its criteria and weight."
---

# add-assessment

Record an assessment, its criteria and weight.

Run from the repository root:

```sh
npm run curriculum -- add-assessment --version=NEW/v1 --module=NEW101 --code=A1 --title="Evidence Portfolio" --method="Portfolio" --criteria="Explain source reliability" --weight=100 --actor="Casey"
```

Read the relevant records first. Use the operator's actual dates and evidence. The example is illustrative, not an instruction to create records.

Accepted flags: --version, --module, --code, --title, --method, --criteria, --weight, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
