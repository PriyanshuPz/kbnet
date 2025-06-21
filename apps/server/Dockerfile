FROM node:22-alpine AS base


FROM base AS builder

WORKDIR /app
COPY . .
RUN npx turbo prune @kbnet/server --docker


# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
# First install the dependencies (as they change less often)
RUN npm install -g bun@latest
COPY --from=builder /app/out/json/ .
RUN bun install


# Build the project
RUN npm install -g bun@latest
COPY --from=builder /app/out/full/ .
RUN bunx turbo run build


FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 kbnet
RUN adduser --system --uid 1001 bunuser
USER bunuser

COPY --from=installer --chown=bunuser:kbnet /app/apps/server/dist ./
COPY --from=installer --chown=bunuser:kbnet /app/packages/database/generated /app/generated
COPY --from=installer --chown=bunuser:kbnet /app/node_modules ./node_modules
COPY --from=installer --chown=bunuser:kbnet /app/package.json ./package.json
COPY --from=installer --chown=bunuser:kbnet /app/turbo.json ./turbo.json
COPY --from=installer --chown=bunuser:kbnet /app/package.json ./package.json


EXPOSE 8000
RUN chmod 700 ./bin

CMD ["./bin"]
