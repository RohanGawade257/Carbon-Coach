FROM node:22-slim AS build
WORKDIR /app

# Step 1: Install OpenSSL inside the compilation environment
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
ENV NODE_ENV=production

# Step 2: Install OpenSSL inside the final execution environment 
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate
COPY --from=build /app/dist ./dist

EXPOSE 4000

# Keep your startup command exactly the same!
CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed && node dist/server.js"]