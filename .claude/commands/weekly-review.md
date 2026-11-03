---
description: "Draft the Monday review from the queue, mapping gaps and overdue actions."
---

# weekly-review

Draft the Monday review from the queue, mapping gaps and overdue actions.

Run from the repository root:

```sh
npm run curriculum -- weekly-review
```

The command reads reviews-due, mapping-gaps and overdue in one consistent snapshot. Read the resulting file, state the decision owners and unresolved evidence, and present it in chat. Nothing sends.

Accepted flags: none, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Report the records returned, and say when none match.
