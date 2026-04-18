#!/bin/sh
# entrypoint.sh - runs before the Node process starts
# Ensures the Prisma schema is pushed to the database before service boot.
# Safe to run on every container start (idempotent).

set -e

echo "Running prisma db push..."
npx prisma db push --skip-generate

echo "Schema up to date. Starting service..."
exec node dist/index.js
