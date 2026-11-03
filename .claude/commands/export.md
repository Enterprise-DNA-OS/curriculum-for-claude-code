---
description: "Write a complete private snapshot to a new file."
---

# export

Write a complete private snapshot to a new file.

Run from the repository root:

```sh
npm run curriculum -- export --out=exports/curriculum-snapshot.json
```

Use a new path outside tracked files. Exports include all original CSV data and decision evidence. Never overwrite an existing snapshot or commit a private export.

Accepted flags: --out, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Report the records returned, and say when none match.
