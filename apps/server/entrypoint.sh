#!/bin/sh

# Change to the database package directory
cd /app/packages/database || exit 1

# Run Prisma database migration
echo "Running Prisma database migration..."
npx prisma db push --skip-generate

# Return to the app root directory
cd /app || exit 1

# Start the application
echo "Starting application..."
exec ./bin