FROM node:14.15.1-alpine AS development

ARG NODE_ENV=development

ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# using cache docker for install dependency (./ -> absolute path. we use relative path to workdir)
COPY package*.json .
COPY yarn.lock .
COPY prisma prisma/


RUN yarn install

# destination based on workdir so dest in (/app)
COPY . .

EXPOSE 4000

RUN npx prisma generate

RUN yarn build

CMD [ "node", "dist/main.js" ]