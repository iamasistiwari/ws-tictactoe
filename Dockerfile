FROM alpine:3.20

RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm
RUN npm install -g typescript 
RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 7079

CMD ["pnpm", "start"]