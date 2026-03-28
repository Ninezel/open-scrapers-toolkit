FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json tsconfig.test.json ./
COPY src ./src
COPY examples ./examples

RUN npm run build

FROM node:20-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/examples ./examples
COPY .env.example ./.env.example

ENTRYPOINT ["node", "dist/cli.js"]
CMD ["list"]
