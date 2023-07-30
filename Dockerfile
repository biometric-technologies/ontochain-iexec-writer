FROM node:18
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
VOLUME /usr/app/storage
CMD [ "node", "dist/main.js" ]
