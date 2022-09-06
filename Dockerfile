FROM node
WORKDIR /app
COPY package.json /app
RUN npm i --omit=dev
COPY . .
CMD npm start