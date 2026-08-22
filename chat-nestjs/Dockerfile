# syntax=docker/dockerfile:1

# bookworm, not alpine: bcrypt 5.0.1 and sharp 0.31 predate Node 20, so neither
# ships a matching prebuilt binary and both fall back to compiling against glibc.
# procps: `nest start --watch` shells out to `ps` to kill the previous process
# tree on every reload, and the slim image ships without it.
FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 make g++ ca-certificates procps \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS development
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 8001
CMD ["yarn", "start:dev"]

FROM deps AS build
COPY . .
RUN yarn build

FROM base AS prod-deps
ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

FROM node:20-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 8001
CMD ["node", "dist/main"]
