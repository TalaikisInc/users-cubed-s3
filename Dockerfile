FROM ubuntu:18.04

RUN apt-get update && apt-get upgrade -y
RUN apt-get install git python2.7 xz-utils build-essential wget bash -y
RUN wget https://nodejs.org/dist/v11.12.0/node-v11.12.0-linux-x64.tar.xz
RUN tar -C /usr/local --strip-components 1 -xJf node-v11.12.0-linux-x64.tar.xz
RUN ls -l /usr/local/bin/node
RUN ls -l /usr/local/bin/npm
RUN rm node-v11.12.0-linux-x64.tar.xz
RUN ln -s /usr/bin/python2.7 /usr/bin/python

WORKDIR /opt
COPY ./package.json ./
RUN npm i
COPY ./ ./

ENV NODE_ENV production 
ENV PORT 3000

EXPOSE 3000

CMD ["node", "start.js"]
