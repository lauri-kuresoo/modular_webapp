# Node 22 matches .nvmrc / engines.node; pnpm 10.34.5 matches packageManager.
FROM mcr.microsoft.com/devcontainers/javascript-node:22-bookworm

# Base image puts a newer npm-global pnpm ahead of Corepack on PATH; remove it
# so `pnpm` resolves to the packageManager pin.
RUN npm uninstall -g pnpm \
  && corepack enable \
  && corepack prepare pnpm@10.34.5 --activate
