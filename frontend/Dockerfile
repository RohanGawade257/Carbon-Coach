# Stage 1: Build compilation
FROM node:20-slim AS build
WORKDIR /app

# Install openssl in the build stage
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
COPY . .
RUN npm run build

# Stage 2: Clean, optimized production runtime
FROM node:20-slim AS runtime

# Install openssl in the final runtime stage
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy compiled resources from the builder stage
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 8080

# Run migrations and launch the Express app
CMD ["node", "dist/index.js"]