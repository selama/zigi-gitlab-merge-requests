FROM node

WORKDIR /use/app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build
WORKDIR /use/app/build

EXPOSE ${SERVICE_PORT}
CMD node src/main.js
