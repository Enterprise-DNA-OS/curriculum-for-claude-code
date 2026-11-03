---
description: "Record a reviewer decision or return the version for changes."
---

# decide

Record a reviewer decision or return the version for changes.

Run from the repository root:

```sh
npm run curriculum -- decide --version=NEW/v1 --decision=changes --evidence="Committee minute reference" --actor="Mira"
```

Read the version, compliance and outstanding tasks. Use --decision=approved only for a real internal decision instructed by the reviewer, with its evidence reference. The reviewer must differ from the submitter. Use changes to return the content to draft. These are actor labels, not authenticated signatures or regulatory decisions.

Accepted flags: --version, --decision, --evidence, --actor, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Record the instructed actor and report the saved record. Do not invent evidence or approvals.
