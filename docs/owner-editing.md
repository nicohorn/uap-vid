# Owner editing unlock (`ENABLE_OWNER_EDITING`)

Lets the Secretaría de Investigación (or an admin) hand a protocol back to its
owner for corrections **without changing the protocol state**, in every stage
where an evaluation is happening. Every unlock records _why_ and emails the
researcher. User-facing guide: [`instructivos/habilitar-edicion-al-director.md`](instructivos/habilitar-edicion-al-director.md).

## Why a flag and not a state transition

The original request was "return the protocol to the director before it goes
to the methodologist". Options weighed:

|                         | Return to `DRAFT`                                 | Flag (chosen)                                               |
| ----------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| Owner can edit          | via existing DRAFT scope                          | via `ownerEditingEnabled`                                   |
| Available in            | PUBLISHED only                                    | PUBLISHED, METHODOLOGICAL_EVALUATION, SCIENTIFIC_EVALUATION |
| Evaluations / checklist | untouched, but the SI queue "loses" the protocol  | untouched, protocol stays where it is                       |
| "Done" signal           | re-publish (re-validates + re-emails secretaries) | none built in — chat / direct check                         |

The owner already had `EDIT_BY_OWNER` in both evaluation states
(`STATE_SCOPE` in `src/utils/scopes.ts`); only `PUBLISHED` was locked. A flag
generalises "ask for changes" to all evaluation stages uniformly and keeps the
state machine intact.

## Behaviour

- `Protocol.ownerEditingEnabled: Boolean @default(false)` (`prisma/schema.prisma`).
- `Action.ENABLE_OWNER_EDITING`, allowed for `SECRETARY` and `ADMIN` in
  `PUBLISHED`, `METHODOLOGICAL_EVALUATION`, `SCIENTIFIC_EVALUATION`
  (`Role_SCOPE` / `STATE_SCOPE`). Not offered for `TEACHER_THESIS` protocols
  (no evaluation stage in `TT_STATE_SCOPE`).
- Owner edit gate: `canOwnerEdit(role, protocol)` = role may `EDIT_BY_OWNER`
  **and** (`ownerEditingEnabled` **or** state scope allows it). Used by
  `protocols/[id]/[section]/page.tsx` (route guard) and
  `protocols/[id]/@actions/page.tsx` (shows "Editar" and computes
  `checkResults.edit`). Callers still check ownership themselves.
- **Reset**: `updateProtocolStateById` sets `ownerEditingEnabled: false` on
  every transition, so an unlock is scoped to the stage it was granted in.
  Repeating the action while already enabled is allowed (new log + email).
- Server action `enableOwnerEditing(protocolId, reason)`
  (`src/app/actions/protocol/enable-owner-editing.ts`): session required,
  reason mandatory (zod, trimmed), `canExecute` re-checked against the DB state
  and protocol type, then `update` → `logEvent` (with `message = reason`) →
  `emailer`. Returns the usual `{ status, notification }`.
- UI: option "Habilitar edición al director" in the Acciones dropdown opens
  `EnableOwnerEditingDialog` (mantine form, required "Motivo"), which calls the
  action and `router.refresh()`.
- Audit: `LogCard` (`src/modules/logs/view-logs-dialog.tsx`) now renders
  `Motivo: …` under any action log that carries a message. Logs are admin-only.
- Email: use case `onOwnerEditingEnabled` ("Habilitación de edición").
  `emailer()` accepts an optional `message` rendered (HTML-escaped) above the
  protocol link — templates in `EmailContentTemplate` are otherwise static.
  The template row must exist per environment:
  `pnpm exec tsx src/migrations/seed-email-owner-editing-template.ts`
  (idempotent; also in `scripts/emails_insert.js`). Without it the email goes
  out with the generic "Notificación del sistema" subject.

## Tests

- `src/utils/scopes.test.ts` — role × state matrix, TT exclusion, `canOwnerEdit`.
- `src/app/actions/protocol/enable-owner-editing.test.ts` — happy path, admin
  in evaluation states, empty reason, no session, forbidden roles/states, TT,
  missing protocol, DB error.
- `src/repositories/protocol.test.ts` — state transition clears the flag.

Smoke-tested against a production snapshot (see `local-development.md`):
secretary sees the action → validation on empty reason → success notification,
flag set, log with reason, emailer called with the right template → researcher
sees "Editar" on a PUBLISHED protocol and reaches the form → with the flag off
the route redirects to `/protocols`.

## Known gaps / follow-ups

- No manual "disable" — the unlock ends at the next state transition. A
  `DISABLE_OWNER_EDITING` action would follow the exact same pattern.
- No visual indicator on the protocol header that editing is currently
  unlocked (only the "Editar" option for the owner and the admin log).
- No in-app "I'm done" signal from the researcher; the SI checks the protocol
  or agrees via chat/email.
- Chat was deliberately not used for the reason (decision: log + email only).
