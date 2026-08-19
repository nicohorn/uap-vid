# Local development, tests and smoke testing with production data

## Local MongoDB

The app needs a **replica set** (Prisma uses transactions). Locally it runs in a
Docker Desktop container named `mongo` (image `mongo:8.0`, `--replSet rs0`,
port 27017), and `.env` points at it:

```
DATABASE_URL=mongodb://localhost:27017/main?replicaSet=rs0&directConnection=true
```

Notes:

- After Docker Desktop restarts the container may report
  `Our replica set config is invalid or we are not a member of it`. That happens
  when the single member is registered under a hostname the daemon can no longer
  map to itself (it used to be `host.docker.internal:27017`). Fix once with:
  ```bash
  docker exec mongo mongosh --quiet --eval \
    'var c = rs.conf(); c.members[0].host = "localhost:27017"; rs.reconfig(c, {force: true})'
  ```
  `directConnection=true` in `DATABASE_URL` means the app never resolves the
  member hostname, so `localhost:27017` is fine.
- Prisma + MongoDB needs no migrations: adding a scalar with `@default(...)`
  to `schema.prisma` and running `pnpm prisma generate` is enough — Prisma
  returns the default for documents that don't have the field yet
  (`protocolType`, `ownerEditingEnabled` were added this way).

## Bringing production data locally

Production runs on the VPS in the docker container `uap-vid-mongodb-1`
(MongoDB 6.0.6, database `main`). Port 27017 is bound on the VPS host but
filtered from the internet, so everything goes through SSH.

`scripts/sync-prod-db.sh` does the whole round trip:

```bash
VPS_SSH=nodo@200.45.249.153 VPS_SSH_PORT=10022 bash scripts/sync-prod-db.sh
```

1. opens an SSH tunnel `localhost:27018 → VPS localhost:27017`;
2. runs `mongodump` **inside the local `mongo` container** against the tunnel
   (`host.docker.internal:27018`) — nothing is executed or written on the VPS
   and no docker/root access is needed there, only SSH;
3. copies the gzip archive to `./.dumps/` (git-ignored);
4. drops the local `main` database and `mongorestore`s the archive.

Requirements / gotchas:

- SSH key auth for `nodo` (password prompts don't work from scripts). The
  `nodo` user is **not** in the `docker` group and `~nodo/.ssh` is root-owned,
  so `ssh-copy-id` from the VPS side fails; append the key as root instead.
- Prod Mongo credentials are read from the commented
  `#DATABASE_URL=mongodb://user:pass@uap-vid-mongodb-1:27017/main...` line in
  `.env`, or from `PROD_MONGO_USER` / `PROD_MONGO_PASSWORD`. Auth source is
  `main` (not `admin`).
- Re-restore an already downloaded archive without touching the VPS:
  `DUMP_FILE=.dumps/main-<stamp>.archive.gz bash scripts/sync-prod-db.sh`.
- The script sets `MSYS_NO_PATHCONV=1`: Git Bash rewrites `/tmp/...` arguments
  into Windows paths before `docker.exe` sees them, which breaks paths meant for
  the container. Host paths passed to `docker cp` are converted with `cygpath`.
- The dump contains real personal data (users, emails, DNI, hashed passwords).
  Keep it local; `.dumps/` is git-ignored on purpose.

## Logging in locally with production users

Credentials login uses scrypt hashes (`src/utils/hash.ts`), so production
passwords are unknown. Set a known password **in the local DB only** with the
app's own helper (run from the repo root so tsconfig aliases resolve):

```ts
// set-local-passwords.ts (temporary, don't commit)
import { PrismaClient } from '@prisma/client'
import { createHashScrypt } from '@utils/hash'
const prisma = new PrismaClient()
const hash = await createHashScrypt('SmokeTest2026!')
await prisma.user.update({
  where: { email: 'test@uap.edu.ar' },
  data: { password: hash },
})
```

```bash
pnpm exec tsx --tsconfig tsconfig.json ./set-local-passwords.ts
```

Handy accounts in the prod snapshot: `test@uap.edu.ar` (SECRETARY, "Usuario
Test"); pick a RESEARCHER who owns a protocol in the state you need with
`db.Protocol.find({state: 'PUBLISHED'}, {researcherId: 1})`.

First login of a user without DNI goes through `/verify_user_data`, which
**signs the session out** after saving — log in again afterwards.

Emails in development (`NODE_ENV=development`) are always redirected to the
ghost address hard-coded in `src/utils/emailer/index.ts`
(`nicolas.horn@uap.edu.ar`), so nothing reaches real users. Actual delivery
still needs valid `GMAIL_USER` / `GMAIL_PASSWORD`; without them the emailer
logs `Invalid login: 535` and the action still succeeds.

## Running the app and smoke testing

```bash
pnpm dev                       # http://localhost:3000
pnpm exec tsx src/migrations/seed-email-owner-editing-template.ts  # once per DB
```

The Playwright MCP was used for the smoke tests; its scratch output lands in
`.playwright-mcp/` (untracked). Known console noise that is **not** related to
new work: React "cannot be a descendant of" HTML nesting warnings, and the chat
websocket (`wss://futuristic-neon-punishment.glitch.me`) failing with 410 —
that Glitch endpoint is dead.

## Unit tests

```bash
pnpm test            # vitest run
pnpm test:watch
```

- Config: `vitest.config.mts` (`resolve.tsconfigPaths: true` resolves the
  tsconfig `paths` and `baseUrl: ./src` bare imports) and `vitest.setup.ts`,
  which mocks `react.cache` as a pass-through — `cache` only exists in Next's
  bundled React, and repositories wrap queries with it.
- Server actions / repositories are tested with `vi.mock` on `next-auth`,
  `app/api/auth/[...nextauth]/auth`, `@utils/bd`, `@repositories/log`,
  `@utils/emailer` (see `src/app/actions/protocol/enable-owner-editing.test.ts`
  and `src/repositories/protocol.test.ts` for the pattern).
- Pure permission logic lives in `src/utils/scopes.ts` and is the cheapest thing
  to test (`src/utils/scopes.test.ts`).

## Tooling caveats

- `pnpm` is not on PATH on the Windows dev machine; use `corepack pnpm ...`.
- `pnpm lint` / `eslint` currently fails to start: `.eslintrc.json` has an
  invalid top-level `"include"` property. Pre-existing, unrelated to any
  feature work.
- Many existing files fail `prettier --check` (line endings / drift). Format
  only files you create; don't reformat touched files wholesale.
- `tsc --noEmit -p tsconfig.json` is the reliable typecheck.

## Security observations (production) — to be addressed

- The production `mongod` accepts **unauthenticated** connections: through the
  SSH tunnel it was possible to list collections without credentials, so the
  server runs without `--auth` (the `uap` user exists but isn't enforced).
  Not reachable from the internet, but any process on the VPS has full access.
- The prod DB password lives (commented) in the developers' `.env`. It should
  move to `.env.local` / a secret store, and be rotated once auth is enforced.
- The prod mongo container has reported `unhealthy` for months while working
  fine (`docker ps` on the VPS). The compose healthcheck
  (`rs.initiate().ok || rs.status().ok` via `mongosh`) is what fails; cause not
  investigated. Cosmetic today, but it would hide a real outage.
