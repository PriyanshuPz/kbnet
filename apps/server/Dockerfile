FROM oven/bun:alpine AS base


FROM base AS builder

WORKDIR /app
COPY . .
RUN bunx turbo prune @kbnet/server --docker


# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN bun install


# Build the project
COPY --from=builder /app/out/full/ .
RUN bunx turbo run build


FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 node
RUN adduser --system --uid 1001 bunuser
USER bunuser

COPY --from=installer --chown=bunuser:node /app/apps/server/dist ./
COPY --from=installer --chown=bunuser:node /app/packages/database/generated /app/generated
COPY --from=installer --chown=bunuser:node /app/node_modules ./node_modules
COPY --from=installer --chown=bunuser:node /app/package.json ./package.json
COPY --from=installer --chown=bunuser:node /app/turbo.json ./turbo.json
COPY --from=installer --chown=bunuser:node /app/package.json ./package.json


EXPOSE 8000
RUN chmod 700 ./bin

CMD ["./bin"]
