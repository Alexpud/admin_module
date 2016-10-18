FROM ubuntu
MAINTAINER Alexandre Maciel <alexandre.maciele@gmail.com>

RUN apt-get update && \
    apt-get -y install nodejs && \
    apt-get -y install npm && \
    npm install -g gulp-cli && \
    ln -s /usr/bin/nodejs /usr/bin/node && \
    mkdir -p /usr/src/app

RUN apt-get install -y docker.io
COPY docker.list /etc/apt/sources.list.d/docker

WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

EXPOSE 3000

CMD 'gulp'
