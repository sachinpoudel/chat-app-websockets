FROM node:20-alpine AS dev

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .


CMD ["npm", "start", "index.js"]



FROM node:20-alpine AS prod

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .

CMD ["npm", "start"]
