FROM node
MAINTAINER Alexandre Maciel

RUN mkdir -p /usr/src/app
RUN npm install --global gulp-cli
WORKDIR /usr/src/app

COPY . /usr/src/app

EXPOSE 3000

CMD 'gulp'
