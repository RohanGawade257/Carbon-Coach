FROM node:22-slim AS build
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app

# 1. Install system engine essentials
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./
COPY prisma ./prisma

# 2. Install packages 
RUN npm install
RUN npx prisma generate
COPY --from=build /app/dist ./dist

# 👇 ADD THIS LINE BELOW TO FIX THE SEED IMPORT ERROR
COPY src ./src

# 3. Set production mode environment variable
ENV NODE_ENV=production

EXPOSE 4000

# Startup command stays completely identical
CMD ["sh", "-c", "npx prisma db push && npm run db:seed && node dist/server.js"]