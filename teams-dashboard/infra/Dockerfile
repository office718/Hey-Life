# Leadership dashboard. Build context is the teams-dashboard/ directory.
# TypeScript runs through tsx (no bundling).
FROM node:24-bookworm-slim AS deps
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable && corepack prepare pnpm@11.14.0 --activate
WORKDIR /app
COPY app/package.json app/pnpm-lock.yaml app/.npmrc app/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production PATH=/app/node_modules/.bin:$PATH TSX_TSCONFIG_PATH=/app/tsconfig.json
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd -r team && useradd -r -g team -d /app team
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --chown=team:team app/ ./
USER team
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD curl -fsS http://127.0.0.1:3000/health || exit 1
CMD ["node", "--import", "tsx", "src/server.ts"]
