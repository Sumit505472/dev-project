 FROM  node:24-alpine 

 WORKDIR /app

 RUN apk update && apk add --no-cache g++ openjdk11 python3 gcc

 COPY . .

 RUN npm install

 EXPOSE 5000

 CMD ["node", "index.js"]


