# pull the base image
FROM node:20-alpine

# RUN addgroup app && adduser -S -G app app
# USER app

# set the working direction
WORKDIR /app

# install app dependencies
COPY package*.json ./

COPY yarn.lock ./

# rebuild node-sass
# RUN yarn add node-sass

RUN yarn install --force

# add app
COPY . ./

# start app
CMD ["yarn", "dev", "--host"]
