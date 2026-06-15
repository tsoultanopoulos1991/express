FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY .sequelizerc ./
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY tests/ ./tests/

EXPOSE ${PORT}

CMD ["npm", "start"]
