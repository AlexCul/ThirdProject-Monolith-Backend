FROM node:23-alpine3.20 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY tsconfig.json ./
COPY src/ src/
RUN npm run build

FROM node:23-alpine3.20
WORKDIR /app

COPY package.json package-lock.json ./
run npm i
COPY --from=builder /app/dist/ dist/
COPY .env ./

CMD ["node", "dist/index.js"]
