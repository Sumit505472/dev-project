 FROM node:18-alpine 

 WORKDIR /app

 RUN apk update && apk add --no-cache  g++

 COPY . .

 RUN npm install

 EXPOSE 5000

 CMD ["node", "index.js"]


