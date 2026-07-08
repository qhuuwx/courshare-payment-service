# Stage 1: Build the application
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY tsconfig.json ./
COPY src ./src/
RUN npm run build
RUN npm run prisma:generate

# Stage 2: Production runtime image
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma/
RUN npm run prisma:generate

COPY --from=build /app/dist ./dist

EXPOSE 8083
CMD ["node", "dist/index.js"]
