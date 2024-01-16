FROM node:alpine AS installer
WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

FROM node:alpine as release
WORKDIR /usr/src/app

COPY --from=installer /usr/src/app /usr/src/app

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
