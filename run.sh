#!/usr/bin/with-contenv bashio
set +u

bashio::log.info "Starting bibliohome backend."
npm start server/server.js

cd client
npm run start