FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


FROM node:20-alpine AS runtime

# Install native OpenSSL package required by Prisma engine
RUN apk add --no-cache openssl

WORKDIR /app
COPY --from=build /app/dist ./dist
# ... rest of your setup