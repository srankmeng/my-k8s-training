FROM node:18.20.0-alpine

WORKDIR /app
RUN npm install -g json-server

COPY . .
EXPOSE 3000
ENTRYPOINT ["json-server"]
CMD ["db.json"]
# ENTRYPOINT ["json-server", "db.json"]
