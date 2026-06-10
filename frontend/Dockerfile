# Stage 1: Build the TypeScript code
FROM node:20-alpine AS build
WORKDIR /app

# Copy package management files
COPY package*.json ./
# Copy prisma schema early so it can generate the client during npm install
COPY prisma ./prisma/

RUN npm install
COPY . .

# Compile TypeScript to JavaScript (generates the /dist folder)
RUN npm run build

# Stage 2: Premium, lightweight production runtime
FROM node:20-alpine AS runtime

# FIX: Install the missing native OpenSSL package required by the Prisma engine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy only the necessary runtime files from the build stage
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Expose your backend port (e.g., 5000, 8080, or whatever your Express server listens on)
EXPOSE 8080

# Run database migrations and start the server
CMD ["node", "dist/index.js"]