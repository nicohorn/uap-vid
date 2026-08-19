# Owner editing unlock (`ENABLE_OWNER_EDITING`)

Lets the Secretaría de Investigación (or an admin) hand a protocol back to its
owner for corrections **without changing the protocol state**, in every stage
where an evaluation is happening. Every unlock records _why_ and emails the
researcher; the owner closes the loop with **FINISH_OWNER_EDITING**, which
turns the flag off again and emails the secretary/admin who requested the
changes. User-facing guide: [`instructivos/habilitar-edicion-al-director.md`](instructivos/habilitar-edicion-al-director.md).

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
  (`Role_SCOPE` / `STATE_SCOPE`). `TEACHER_THESIS` protocols get it while
  `PUBLISHED` (the secretary reviews the thesis before accepting it).
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
- `Action.FINISH_OWNER_EDITING` — the owner's counterpart. Server action
  `finishOwnerEditing(protocolId, comment?)`
  (`src/app/actions/protocol/finish-owner-editing.ts`): owner-only
  (ownership check, `canExecute`, and the flag currently on), optional
  comment, clears the flag, logs it, and emails the user who made the latest
  ENABLE_OWNER_EDITING log — falling back to the academic units' secretaries
  if that can't be resolved. The dropdown option ("Finalizar correcciones")
  is only rendered for the owner while the unlock is active (filtered in
  `@actions/page.tsx`).
- Email: use cases `onOwnerEditingEnabled` ("Habilitación de edición") and
  `onOwnerEditingFinished` ("Correcciones del director finalizadas").
  `emailer()` accepts an optional `message` rendered (HTML-escaped) above the
  protocol link — templates in `EmailContentTemplate` are otherwise static.
  The template rows must exist per environment:
  `pnpm exec tsx src/migrations/seed-email-owner-editing-template.ts`
  (idempotent, seeds both; also in `scripts/emails_insert.js`). Without them
  the emails go out with the generic "Notificación del sistema" subject.

## Tests

- `src/utils/scopes.test.ts` — role × state matrix (both actions), TT
  PUBLISHED inclusion, `canOwnerEdit`.
- `src/app/actions/protocol/enable-owner-editing.test.ts` — happy path, admin
  in evaluation states, empty reason, no session, forbidden roles/states, TT,
  missing protocol, DB error.
- `src/app/actions/protocol/finish-owner-editing.test.ts` — happy path
  (recipient = unlock author), secretaries fallback, optional comment, not
  the owner, flag off, wrong state, TT, no session.
- `src/repositories/protocol.test.ts` — state transition clears the flag.

Smoke-tested end to end against a production snapshot (see
`local-development.md`), twice: (1) secretary enables → empty-reason
validation → flag set, log with reason, email to the researcher → researcher
sees "Editar" on a PUBLISHED protocol and reaches the form → flag off redirects
to `/protocols`; (2) **admin** enables (action present in the admin dropdown)
→ owner sees "Editar" + "Finalizar correcciones" → finishes with a comment →
flag off, FINISH log, email `onOwnerEditingFinished` to the admin who enabled
→ both options disappear from the owner's dropdown.

## Known gaps / follow-ups

- No visual indicator on the protocol header that editing is currently
  unlocked (only the "Editar" option for the owner and the admin log).
- Chat was deliberately not used for the reason (decision: log + email only).
- The secretary cannot manually revoke an unlock; it ends when the owner
  finishes or the protocol changes state.
