# WhatsApp Global Variables migration preparation

Preparation and testing only: the latest instruction prohibits database writes.
Do not execute write mode until the target is explicitly confirmed as
local/development and a new write authorization is given.

## Audit and mapping

| Concern | Prepared behavior |
| --- | --- |
| Public reader | `src/lib/whatsapp-settings.ts` reads only `global_variables`; root layout passes the cached settings to existing client consumers. |
| WhatsApp admin | `/admin/whatsapp` checks the existing session then redirects to `/admin/global-variables`. The unused form and sidebar entry are removed. The protected legacy API remains compatible and uses the same Global Variables, not legacy settings. |
| Global Variables admin | Existing API reuses the shared writer, returns refreshed related rows, and exposes inherited message visibility metadata. |
| Visibility | `WHATSAPP_NUMBER.status` is canonical. The message editor cannot independently toggle it. Transactions synchronize stored statuses where supported; standalone saves are sequential and public/API readers derive visibility from the number even if interrupted. Message edits never write the number's status. |
| Cache | Admin saves expire `whatsapp-settings` after commit. Standalone saves invalidate even after failure because partial changes may have persisted. A new cache key prevents reuse of legacy settings caches. External changes revalidate on requests after the 60-second interval. |
| Missing/invalid configuration | Public CTAs are disabled without a fallback number. Admins can still configure missing values. Read paths never create indexes or records. |
| Links and designs | Existing URL utility, encoding, client consumers, layouts and styles remain unchanged. Only the inherited status control behavior changes. |

The explicit migration copies:

- `site_settings/global.whatsapp.number` to `WHATSAPP_NUMBER.value`.
- `site_settings/global.whatsapp.message` to `WHATSAPP_MESSAGE.value`.
- `site_settings/global.whatsapp.enabled` to both records' `status`.
- Registry descriptions and new timestamps only for records actually inserted.

Existing records with matching value/status are retained unchanged, including
their descriptions and timestamps. Any differing value/status, duplicate key or
invalid/incomplete legacy configuration blocks the entire migration. Empty
configured values are existing records, not permission to overwrite them.
There is no force/overwrite option. The legacy document is never changed.

## Commands

From the project root, a live **read-only** inspection is:

```powershell
node scripts/migrate-whatsapp-settings.mjs --dry-run
```

This loads the existing environment and MongoDB connection module. It creates no
indexes, sessions or records. Output contains keys/actions/blockers, not contact
values or credentials. Exit codes are 0 (ready), 2 (blocked/conflicts), 1 (failure).

For offline fixtures with `{ "legacy": ..., "variables": [...] }`:

```powershell
node scripts/migrate-whatsapp-settings.mjs --dry-run --fixture path/to/fixture.json
node --test tests/whatsapp-migration.test.mjs
```

Fixture mode never connects to MongoDB and cannot be combined with write mode.
The regression tests exercise writes only against in-memory mocks.

Only **after explicit local/development confirmation and write approval**, the
prepared write command is:

```powershell
node scripts/migrate-whatsapp-settings.mjs --apply --confirm-local-development
```

No command is registered for application startup or builds. The CLI requires the
project's installed development dependencies (including TypeScript).

## Cutover prerequisites and risks

1. Review a fresh live read-only dry-run and explicitly identify the environment.
   `.env.local` and a loopback hostname do not prove that data is development data.
   The CLI prints only safe target metadata; apply requires the confirmation flag
   and refuses `NODE_ENV=production`. Do not use the flag without confirmation.
2. Topology is detected with `hello`. Replica sets/sharded deployments use a
   transaction. Standalone deployments use insert-only, per-record verified saves.
   Dry-run checks duplicate keys across the collection. Apply initializes a unique
   `global_variables.key` index before inserting; an incompatible index blocks
   record writes. Dry-run never creates that index.
3. Pause admin/legacy edits during cutover. Each standalone step rechecks the
   source and target against its original plan, inserts the message first and
   number last, then verifies exact values/statuses. It never overwrites existing
   records. Final verification checks both records and the original source values.
   Concurrent changes or write failures stop execution. Without transactions,
   cross-document atomicity cannot be guaranteed; no automatic rollback deletes
   records. Rerun dry-run after failure, preserve matching partial records, resolve
   any conflicts explicitly, and resume only after reviewing the new plan.
4. Execute the approved migration before activating the new reader. Otherwise,
   absent new records intentionally disable WhatsApp buttons. Keep the untouched
   legacy document as a rollback reference; there is no runtime legacy fallback.
5. Reload pages after cutover. Direct CLI writes cannot invalidate a running
   Next.js instance's cache; allow request-driven 60-second revalidation, or perform
   an approved save through an admin interface to expire the tag immediately.

The application build can still read existing public data, but these new read
paths and migration preparation do not perform live database writes.

Repository packaging: `.gitignore` now includes the migration CLI, required browser
scripts, regression test sources and audit guard through explicit exceptions.
Backups, environment files and generated audit evidence remain excluded. These
sources are visible to Git; nothing was staged or committed here.

## Latest read-only verification

The target was `railagents`, loaded from `.env.local`, on a loopback connection,
with `NODE_ENV` unset and standalone topology. Its production/development identity
was not confirmed. The first dry-run planned two inserts. A subsequent guarded
dry-run found both records already present, matching the legacy number, message
and enabled state, with zero conflicts. This workflow did not execute write mode;
the appearance of those records was external to this workflow. The guarded check
observed only `hello`, `find`, and `endSessions`, with zero write attempts/commands.
Do not treat this observation as authorization for any future writes.
