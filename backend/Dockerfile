FROM node:18-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN mkdir -p src/uploads logs

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
