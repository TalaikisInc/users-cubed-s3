FROM keymetrics/pm2:latest-alpine

RUN npm i -g pm2

WORKDIR /opt
COPY ./package.json ./
RUN npm i
COPY ./ ./

ENV NODE_ENV production 
ENV PORT 3000

EXPOSE 3000

RUN npm run build

CMD ["pm2-runtime", "start.js", "i", "2"]
