---
description: "Draft a committee briefing for one version."
---

# draft-review

Draft a committee briefing for one version.

Run from the repository root:

```sh
npm run curriculum -- draft-review --version=OPS/v1
```

Read the full version first. The generated briefing is a draft for an internal committee. Read it and hand it over in chat, without sending or submitting it.

Accepted flags: --version, plus --json. Dates use YYYY-MM-DD. Resolve ambiguous matches by listing the candidates and getting an exact id. Report the records returned, and say when none match.
