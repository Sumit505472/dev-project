FROM node:24-alpine

WORKDIR /app

# Install compilers and dependencies
RUN apk update && apk add --no-cache g++ openjdk11 python3 gcc

COPY . .

RUN npm install

# Create essential directories for code, input, and output files
# These are necessary for the application to write temporary files.
RUN mkdir -p /app/codes
RUN mkdir -p /app/inputs
RUN mkdir -p /app/execute/outputs

EXPOSE 5000

CMD ["node", "index.js"]

