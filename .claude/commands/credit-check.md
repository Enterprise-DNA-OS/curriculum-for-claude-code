---
description: "Compare compulsory module credits with the programme total."
---

# credit-check

Compare compulsory module credits with the programme total.

Run from the repository root:

```sh
npm run curriculum -- credit-check
```

The free model represents one compulsory pathway. Do not add optional modules as compulsory credits. Separate elective pathways or add a reviewed pathway model before relying on totals.

Accepted flags: none, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Report the records returned, and say when none match.
