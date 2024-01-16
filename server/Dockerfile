FROM node:alpine
WORKDIR /usr/src/app

COPY package*.json /usr/src/app
RUN npm ci

COPY . /usr/src/app

EXPOSE 3001

CMD ["npm", "start", "server.js"]
