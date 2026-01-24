FROM node:20-bullseye

# Install compilers & runtimes
RUN apt-get update && apt-get install -y \
    g++ \
    gcc \
    openjdk-17-jdk \
    python3 \
    python-is-python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Create runtime directories (safe even if code also creates them)
RUN mkdir -p codes inputs execute/outputs

EXPOSE 5000

CMD ["npm", "run", "start"]
