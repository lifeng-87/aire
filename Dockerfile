FROM node

RUN apt-get update && \
  apt-get install -y python3 build-essential && \
  apt-get purge -y --auto-remove

COPY package.json ./

RUN npm install -g yarn typescript \
  && yarn install

COPY . .

RUN yarn build
CMD [ "yarn", "start:prod" ]
