 FROM node:18-alpine 

 WORKDIR /app

 RUN apk update && apk add --no-cache g++ openjdk11 python3 gcc

 COPY . .

 RUN npm install

 EXPOSE 5000

 CMD ["node", "index.js"]


{/* 
PS C:\Users\Sumit\Desktop\dev-project\server>  docker run --env-file .env -d -p 5000:5000 --name cont1 28345a4fb978               
>> 
>>
4b0b32f58af6bee7d782f7d027e753d4a9bb5baa6eed1f57ad7c93c1554f2486
PS C:\Users\Sumit\Desktop\dev-project\server> docker ps
CONTAINER ID   IMAGE          COMMAND                  CREATED          STATUS          PORTS                    NAMES
4b0b32f58af6   28345a4fb978   "docker-entrypoint.s…"   30 seconds ago   Up 29 seconds   0.0.0.0:5000->5000/tcp   cont1
PS C:\Users\Sumit\Desktop\dev-project\server> docker exec -it 4b0b32f58af6 sh
/app # cd codes/
/app/codes # ls
/app/codes # 
after getting .cpp -> cd ..
then ls 
 */}