FROM alpine:3.20

RUN apk add --no-cache nodejs npm

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g pnpm
RUN npm install -g typescript 
RUN pnpm install

COPY . .
COPY /home/administrator/keys /keys


RUN pnpm build

EXPOSE 7079

CMD ["pnpm", "start"]