FROM node:22-alpine AS base
RUN npm install -g bun@latest

FROM base AS source

WORKDIR /app
COPY . .
RUN bunx turbo prune @kbnet/platform --docker


FROM base AS installer
COPY --from=source /app/out/json/ .
RUN bun install

FROM base AS builder
WORKDIR /app
COPY --from=source /app/node_modules ./node_modules
COPY --from=source /app/out/full/ .
RUN bunx turbo run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 kbnet
RUN adduser --system --uid 1001 bunuser
USER bunuser

# Copy build output
COPY --from=builder --chown=bunuser:kbnet /app/apps/platform/.next/standalone ./
COPY --from=builder --chown=bunuser:kbnet /app/apps/platform/public ./apps/platform/public
COPY --from=builder --chown=bunuser:kbnet /app/apps/platform/.next/static ./.next/static

EXPOSE 3000
ENV HOSTNAME=0.0.0.0

CMD ["export", "HOSTNAME=0.0.0.0","&&", "node","apps/platform/server.js" ]
