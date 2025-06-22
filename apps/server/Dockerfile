FROM node:22-alpine AS base
RUN npm install -g bun@latest

FROM base AS source

WORKDIR /app
COPY . .
RUN bunx turbo prune @kbnet/server --docker


FROM base AS installer
WORKDIR /app
COPY --from=source /app/out/json/ .
RUN bun install

FROM base AS builder
WORKDIR /app
COPY --from=source /app/out/full/ .
COPY --from=installer /app/node_modules ./node_modules
RUN bunx turbo run build


FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 kbnet
RUN adduser --system --uid 1001 bunuser
USER bunuser

COPY --from=builder --chown=bunuser:kbnet /app/apps/server/dist ./
COPY --from=builder --chown=bunuser:kbnet /app/packages/database/generated /app/generated
COPY --from=installer --chown=bunuser:kbnet /app/node_modules ./node_modules
COPY --from=builder --chown=bunuser:kbnet /app/package.json ./package.json
COPY --from=builder --chown=bunuser:kbnet /app/turbo.json ./turbo.json
COPY --from=builder --chown=bunuser:kbnet /app/package.json ./package.json


EXPOSE 8000
RUN chmod 700 ./bin

CMD ["./bin"]
