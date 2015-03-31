FROM google/nodejs

ADD ./dist /app

WORKDIR /app

RUN npm install --production

ENV PORT 9000
ENV NODE_ENV production

expose 9000

CMD ["/nodejs/bin/npm", "start"]
