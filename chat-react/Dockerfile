# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS development
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3100
CMD ["yarn", "dev"]

# VITE_* values are inlined at build time, so the production image is pinned to
# whatever host the browser will use to reach the API.
FROM deps AS build
ARG VITE_API_URL=http://localhost:8001/api
ARG VITE_WEBSOCKET_URL=http://localhost:8001
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL
COPY . .
RUN yarn build

FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
