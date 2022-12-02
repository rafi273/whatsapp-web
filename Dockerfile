FROM node:lts

WORKDIR /var/www/whatsapp-bot

COPY . .

RUN yarn && \
    yarn run build

CMD ["yarn", "start"]
