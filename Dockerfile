FROM alpine:3.20

RUN apk add --no-cache nodejs npm

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g pnpm
RUN npm install -g typescript

RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 8080

CMD ["pnpm", "start"]