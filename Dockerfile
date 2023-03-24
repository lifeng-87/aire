FROM node

RUN mkdir ./fonts

RUN apt-get update && \
  apt-get install -y python3 build-essential unzip fonts-noto && \
  apt-get purge -y --auto-remove

COPY package.json ./

RUN npm install -g npm@latest typescript && yarn install

COPY . .

RUN yarn build
CMD [ "yarn", "start:prod" ]
