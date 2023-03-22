FROM node

RUN mkdir ./fonts

RUN apt-get update && \
  apt-get install -y python3 build-essential unzip && \
  apt-get purge -y --auto-remove && \
  wget https://fonts.google.com/download?family=Noto%20Sans%20TC -O noto.zip && \
  unzip -d ./fonts/ ./noto.zip && \
  rm ./noto.zip

COPY package.json ./

RUN npm install -g yarn typescript && \
  yarn install

COPY . .

RUN yarn build
CMD [ "yarn", "start:prod" ]
