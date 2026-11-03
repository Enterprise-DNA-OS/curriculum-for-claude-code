---
description: "Amend a draft assessment method, criteria or weight."
---

# edit-assessment

Amend a draft assessment method, criteria or weight.

Run from the repository root:

```sh
npm run curriculum -- edit-assessment --version=NEW/v1 --assessment=A1 --criteria="Explain source reliability and limits" --actor="Casey"
```

Read the relevant records first. Use the operator's actual dates and evidence. The example is illustrative, not an instruction to create records.

Accepted flags: --version, --assessment, --title, --method, --criteria, --weight, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
