FROM node:20-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

RUN pnpm run build
RUN ls -la dist/

EXPOSE 4000

CMD ["node", "dist/main.mjs"]