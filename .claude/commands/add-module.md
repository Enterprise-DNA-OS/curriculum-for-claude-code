---
description: "Add a compulsory module and its learning hours."
---

# add-module

Add a compulsory module and its learning hours.

Run from the repository root:

```sh
npm run curriculum -- add-module --version=NEW/v1 --code=NEW101 --title="Evidence in Practice" --level=5 --credits=15 --hours=150 --aim="Evaluate evidence" --content="Source evaluation" --delivery="Guided workshops" --actor="Casey"
```

Read the relevant records first. Use the operator's actual dates and evidence. The example is illustrative, not an instruction to create records.

Accepted flags: --version, --code, --title, --level, --credits, --hours, --aim, --content, --delivery, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
