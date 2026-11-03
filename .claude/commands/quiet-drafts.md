---
description: "Find draft versions unchanged for more than fourteen days."
---

# quiet-drafts

Find draft versions unchanged for more than fourteen days.

Run from the repository root:

```sh
npm run curriculum -- quiet-drafts
```

Fourteen days is the demo institution policy, not an NZQA rule. A curriculum content change updates the version timestamp. A new action alone does not imply the curriculum was revised.

Accepted flags: none, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Report the records returned, and say when none match.
