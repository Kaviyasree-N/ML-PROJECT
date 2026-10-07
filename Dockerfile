# Build Stage
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install && npm --prefix frontend install

COPY . .
RUN npm run build

# Production Runner Stage
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install --omit=dev && npm --prefix frontend install --omit=dev

COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/models ./models
COPY --from=builder /app/backend ./backend

EXPOSE 3000
CMD ["npm", "start"]
