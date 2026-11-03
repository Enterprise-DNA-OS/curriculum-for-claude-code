# Replace Akari Curriculum records

## Obtain a complete report

Akari's [supplier-authored service listing](https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/392409189737101) documents user-specified reports exported as CSV. It also describes JSON API output and a data dictionary supplied during disengagement. The listing was available through search during this run; direct retrieval returned 404. [The vendor service definition](https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-14/documents/709676/392409189737101-service-definition-document-2024-05-07-0934.pdf) provides the broader product context. Confirm the available export with your institution's Akari administrator before scheduling a switch.

There is no public universal export layout. Ask the administrator for a joined curriculum report with one row per module outcome, programme outcome and assessment relationship. Include the fields below for a complete compulsory programme pathway. Do not substitute a public course catalogue, incomplete mapping report or PDF for the required records. Incomplete mappings must be reconciled in the source export or entered explicitly through the CLI before review; the importer does not invent missing evidence.

| Internal mapping key | Default CSV column |
|---|---|
| programme_code | Programme Code |
| programme_title | Programme Title |
| owner | Owner |
| jurisdiction | Jurisdiction |
| number | Version |
| title | Version Title |
| level | Level |
| credits | Programme Credits |
| review_due | Review Due |
| effective_date | Effective Date |
| rationale | Rationale |
| module_code | Module Code |
| module_title | Module Title |
| module_level | Module Level |
| module_credits | Module Credits |
| hours | Learning Hours |
| aim | Aim |
| content | Content |
| delivery | Delivery |
| programme_outcome_code | Programme Outcome Code |
| programme_outcome | Programme Outcome |
| learning_outcome_code | Learning Outcome Code |
| learning_outcome | Learning Outcome |
| assessment_code | Assessment Code |
| assessment_title | Assessment Title |
| method | Assessment Method |
| criteria | Assessment Criteria |
| weight | Assessment Weight |
| evidence | Mapping Evidence |

All mapped fields are required. Jurisdiction is NZ, AU or OTHER. Dates use YYYY-MM-DD. Credits and hours are positive numbers with at most two decimal places. Assessment weights are positive and no greater than 100. Levels are integers from 1 to 10. Version numbers are positive integers. Outcome codes and assessment codes are unique within a version.

## One import command

Save the export under imports/. If the institution's columns differ, create a private mapping file. For example, {"programme_code":"Course Code","module_code":"Unit Code"} overrides those two defaults. Mapping keys must be documented keys and each must name a distinct column. The map is header mapping only; transform incompatible date formats or structures in a reviewed preparation step first.

```sh
npm run curriculum -- import akari --file=imports/curriculum.csv --map=imports/columns.json --actor="Your name" --dry-run
npm run curriculum -- import akari --file=imports/curriculum.csv --map=imports/columns.json --actor="Your name"
```

Omit --map when the report uses the default headers. The first run validates every row inside a transaction and rolls it back. The second saves the complete batch atomically. Repeated shared modules, outcomes and assessment mappings are deduplicated if their fields agree. Conflicting rows fail the whole import. Exact repeated file and mapping is a no-op. A changed import cannot overwrite an existing programme version. Reconcile the records, or use an agreed new version after checking the business meaning.

The importer keeps original CSV text, column mapping, source row number and all extra columns in the private import ledger. Extra columns are preserved as evidence but do not become operational fields. Programme records must agree with existing owner, title and jurisdiction. Imported curriculum always starts as draft; exported approval labels never confer approval here.

## Reconcile before relying on it

Compare programme and version counts, module counts, compulsory credit totals, outcome counts, assessment counts and mapping pairs against Akari. Run credit-check, mapping-gaps and compliance. Review each programme specification and matrix with the academic owner. Keep a full vendor export and your evidence attachments outside git. Test on a fresh database first. The fixture is an invented example of the supported report shape, not a captured Akari account export.

## What needs separate work

The base does not import student records, enrolments, marks, elective choice rules, shared-module publishing, prerequisites, files, historical workflow events, authenticated signatures, external accreditation, publication schedules or LMS connections. It preserves additional CSV columns without pretending to implement those features. Historical approvals require their own verified evidence migration; do not recreate them by approving an imported draft.

One command can import a prepared report in a day. Getting export access, mapping an institution's report and verifying its completeness determines the actual switching time. Keep Akari available until the owner confirms the migration and any required institutional connections. No command cancels a contract or publishes a catalogue.

## Export and recovery

```sh
npm run curriculum -- export --out=exports/curriculum-snapshot.json
```

This creates a new full JSON snapshot with records, import originals, activity and review snapshots. It refuses to overwrite a file. Store it privately and use native database backups. Restoring a snapshot is a reviewed maintenance operation, not a built-in command.
