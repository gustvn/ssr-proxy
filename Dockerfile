FROM node:14-alpine

ARG ENV

ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true" \
    NODE_ENV=$ENV

WORKDIR /app

COPY . /app

RUN echo environment=$ENV && apk update && apk add --no-cache chromium \
  && node -v && npm -v && npm install

EXPOSE 8888

CMD ./node_modules/.bin/forever index.mjs 