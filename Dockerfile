FROM node:alpine as dependencies
RUN apk add --no-cache --virtual .gyp python make g++

### Install build toolchain, install node deps and compile native add-ons
WORKDIR /var/build
COPY package.json .
RUN npm install

### copy in application source
FROM dependencies as builder
COPY . .
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
RUN npm run build

FROM nginx:alpine as release
COPY default.conf /etc/nginx/conf.d/

WORKDIR /usr/share/nginx/html

### Copy static files to final stage image
COPY --from=builder /var/build/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
