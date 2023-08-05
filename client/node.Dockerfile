FROM node:alpine AS builder
WORKDIR /app
COPY . /app/
RUN npm install --force 
ENTRYPOINT ["npm", "run", "dev", "--", "--host"]