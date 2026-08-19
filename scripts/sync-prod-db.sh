#!/usr/bin/env bash
# Pull a dump of the production MongoDB (docker container on the VPS) and
# restore it into the local docker Mongo used for development / smoke tests.
#
# How it works (nothing runs or gets written on the VPS, and no docker access
# is needed there — only SSH):
#   1. opens an SSH tunnel  localhost:$TUNNEL_PORT → VPS localhost:27017
#   2. runs `mongodump` inside the LOCAL mongo container against the tunnel
#      (host.docker.internal), writing a gzip archive that is copied to ./.dumps/
#   3. `mongorestore --drop` of that archive into the local database
#
# Usage:
#   VPS_SSH=nodo@200.45.249.153 VPS_SSH_PORT=10022 scripts/sync-prod-db.sh
#
# Prod credentials: PROD_MONGO_USER / PROD_MONGO_PASSWORD env vars, or — by
# default — parsed from the commented `#DATABASE_URL=mongodb://user:pass@...`
# line kept in .env. Auth is against PROD_AUTH_SOURCE (default: main).
#
# Optional overrides (defaults match the current infra):
#   PROD_DB               database to dump                  (main)
#   LOCAL_MONGO_CONTAINER local docker mongo container name (mongo)
#   LOCAL_DB              database to restore into          (main)
#   TUNNEL_PORT           local port for the SSH tunnel     (27018)
#   DUMP_FILE             reuse an existing archive instead of dumping again
set -euo pipefail
# Git Bash (MSYS) rewrites POSIX-looking args such as /tmp/... into Windows
# paths before docker.exe sees them; the container needs the literal paths.
export MSYS_NO_PATHCONV=1
# ...which means host-side paths handed to `docker cp` must be converted by us.
host_path() { command -v cygpath >/dev/null 2>&1 && cygpath -w "$1" || echo "$1"; }

VPS_SSH_PORT="${VPS_SSH_PORT:-22}"
PROD_DB="${PROD_DB:-main}"
PROD_AUTH_SOURCE="${PROD_AUTH_SOURCE:-main}"
LOCAL_MONGO_CONTAINER="${LOCAL_MONGO_CONTAINER:-mongo}"
LOCAL_DB="${LOCAL_DB:-main}"
TUNNEL_PORT="${TUNNEL_PORT:-27018}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DUMP_DIR="$ROOT/.dumps"
mkdir -p "$DUMP_DIR"

if [[ -z "${DUMP_FILE:-}" ]]; then
  : "${VPS_SSH:?Set VPS_SSH=user@host (SSH target of the VPS)}"

  if [[ -z "${PROD_MONGO_USER:-}" || -z "${PROD_MONGO_PASSWORD:-}" ]]; then
    CRED=$(grep -m1 '^#DATABASE_URL=mongodb://' "$ROOT/.env" |
      sed -E 's#^\#DATABASE_URL=mongodb://([^@]+)@.*#\1#')
    [[ -n "$CRED" && "$CRED" == *:* ]] ||
      { echo "✖ Prod credentials not found: set PROD_MONGO_USER/PROD_MONGO_PASSWORD" >&2; exit 1; }
    PROD_MONGO_USER="${CRED%%:*}"
    PROD_MONGO_PASSWORD="${CRED#*:}"
  fi

  echo "▶ Opening SSH tunnel localhost:$TUNNEL_PORT → $VPS_SSH:27017"
  ssh -o BatchMode=yes -o ExitOnForwardFailure=yes -N \
    -L "$TUNNEL_PORT:localhost:27017" -p "$VPS_SSH_PORT" "$VPS_SSH" &
  TUNNEL_PID=$!
  trap 'kill "$TUNNEL_PID" 2>/dev/null || true' EXIT
  for _ in $(seq 1 30); do
    (echo >"/dev/tcp/127.0.0.1/$TUNNEL_PORT") 2>/dev/null && break
    sleep 0.5
  done
  kill -0 "$TUNNEL_PID" 2>/dev/null || { echo "✖ SSH tunnel failed" >&2; exit 1; }

  STAMP="$(date +%Y%m%d-%H%M%S)"
  ARCHIVE_NAME="${PROD_DB}-${STAMP}.archive.gz"
  DUMP_FILE="$DUMP_DIR/$ARCHIVE_NAME"
  echo "▶ Dumping '$PROD_DB' → $DUMP_FILE"
  # The URI is expanded inside the container (sh -c) so the password never
  # appears in the local process list.
  docker exec \
    -e MONGO_URI="mongodb://$PROD_MONGO_USER:$PROD_MONGO_PASSWORD@host.docker.internal:$TUNNEL_PORT/?authSource=$PROD_AUTH_SOURCE&directConnection=true" \
    -e PROD_DB="$PROD_DB" -e ARCHIVE="/tmp/$ARCHIVE_NAME" \
    "$LOCAL_MONGO_CONTAINER" \
    sh -c 'mongodump --quiet --uri="$MONGO_URI" --db="$PROD_DB" --archive="$ARCHIVE" --gzip'
  docker cp "$LOCAL_MONGO_CONTAINER:/tmp/$ARCHIVE_NAME" "$(host_path "$DUMP_FILE")"
  echo "  $(du -h "$DUMP_FILE" | cut -f1) downloaded"
  kill "$TUNNEL_PID" 2>/dev/null || true
  trap - EXIT
else
  echo "▶ Reusing $DUMP_FILE"
  ARCHIVE_NAME="$(basename "$DUMP_FILE")"
  docker cp "$(host_path "$DUMP_FILE")" "$LOCAL_MONGO_CONTAINER:/tmp/$ARCHIVE_NAME"
fi

echo "▶ Restoring into local container '$LOCAL_MONGO_CONTAINER' db '$LOCAL_DB' (replaces the whole database)"
# Drop the DB first: mongorestore --drop only replaces collections present in
# the archive, and stale local-only collections would otherwise survive.
docker exec "$LOCAL_MONGO_CONTAINER" mongosh --quiet "$LOCAL_DB" --eval 'db.dropDatabase()' >/dev/null
docker exec -e ARCHIVE="/tmp/$ARCHIVE_NAME" -e PROD_DB="$PROD_DB" -e LOCAL_DB="$LOCAL_DB" \
  "$LOCAL_MONGO_CONTAINER" \
  sh -c 'mongorestore --quiet --archive="$ARCHIVE" --gzip --drop \
           --nsInclude="$PROD_DB.*" --nsFrom="$PROD_DB.*" --nsTo="$LOCAL_DB.*" \
         && rm -f "$ARCHIVE"'

echo "▶ Local '$LOCAL_DB' now has:"
docker exec "$LOCAL_MONGO_CONTAINER" mongosh --quiet "$LOCAL_DB" --eval '
  db.getCollectionNames().sort().forEach(c => print("  " + c.padEnd(28) + db.getCollection(c).countDocuments()))
'
echo "✔ Done. .env DATABASE_URL should be mongodb://localhost:27017/$LOCAL_DB?replicaSet=rs0&directConnection=true"
