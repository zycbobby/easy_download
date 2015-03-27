FROM google/nodejs


ADD ./dist /app

WORKDIR /app/dist

RUN npm install --production

ENV PORT 9000
ENV NODE_ENV production

expose 9000

ENTRYPOINT ["/nodejs/bin/npm", "start"]
