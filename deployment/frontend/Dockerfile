FROM node:24 AS frontend

WORKDIR /app
COPY package.json .
RUN npm install --ignore-scripts

COPY frontend frontend
RUN npm run build

FROM node:24 AS server

WORKDIR /server
COPY deployment/frontend/package.json .
RUN npm install
COPY deployment/frontend/ .

FROM node:24-slim

WORKDIR /app
COPY --from=frontend /app/frontend/dist .

WORKDIR /server
COPY --from=server /server .

ENV STATIC_FILE_PATH=/app
ENTRYPOINT ["npm", "run", "start"]