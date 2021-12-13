FROM node:12-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN apt update && apt install -y python build-essential curl
RUN curl -fL https://github.com/krallin/tini/releases/download/v0.19.0/tini-amd64 -o /sbin/tini && chmod +x /sbin/tini
RUN npm i --production
RUN cp -r node_modules node_modules_production
RUN npm i
COPY tsconfig*.json ./
COPY src src
RUN npm run build
FROM node:12-slim
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY --from=builder /sbin/tini /sbin/tini
RUN apt update && apt install -y curl
WORKDIR /usr/src/app
COPY package*.json ./
RUN chown -R node:node .
USER node
COPY --from=builder /usr/src/app/dist/ dist/
COPY --from=builder /usr/src/app/node_modules_production/ node_modules/

#tini allows node to properly handle SIGINT, SIGTERM etc.
ENTRYPOINT [ "/sbin/tini","--", "node", "dist/index.js" ]
