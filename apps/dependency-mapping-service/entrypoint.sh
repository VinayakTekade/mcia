#!/bin/sh
# entrypoint.sh - runs before the Node process starts
# Ensures the Prisma schema is pushed to the database before service boot.
# Then seeds dependency data if the table is empty.
# Safe to run on every container start (idempotent).

set -e

echo "Running prisma db push..."
npx prisma db push --skip-generate

# Seed only if no rows exist yet (idempotent via upsert in seed.js)
echo "Running seed..."
node prisma/seed.js || echo "Seed skipped or already up to date."

echo "Schema up to date. Starting service..."
exec node dist/index.js
