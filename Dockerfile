FROM node:lts

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173 8430
CMD [ "npm", "run", "start" ]
