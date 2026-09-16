FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --production
WORKDIR /app
COPY database ./database
COPY backend ./backend
WORKDIR /app/backend
EXPOSE 5001
CMD ["npm", "start"]
