FROM node:18.20.0-alpine

RUN npm install -g newman newman-reporter-htmlextra
WORKDIR /etc/newman

COPY . .
ENTRYPOINT ["newman"]