FROM node:22-bookworm-slim

WORKDIR /workspace/wallet

RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ make python3 \
    && rm -rf /var/lib/apt/lists/*

ENV CI=true \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=wallet-pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store \
    && pnpm fetch --frozen-lockfile

COPY . .

RUN --mount=type=cache,id=wallet-pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store \
    && pnpm install --frozen-lockfile --offline

RUN pnpm nx build @canton-network/wallet-gateway-remote

EXPOSE 3030

ENTRYPOINT ["pnpm", "--dir", "/workspace/wallet", "--filter", "@canton-network/wallet-gateway-remote", "exec", "node", "dist/index.js"]
CMD ["-c", "/app/config.json"]
