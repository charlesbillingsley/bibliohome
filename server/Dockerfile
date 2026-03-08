FROM node:18-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production

# copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# copy source
COPY . .

EXPOSE 3001

# start the server
CMD ["node", "server.js"]
