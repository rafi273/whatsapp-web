FROM node:lts

WORKDIR /var/www/whatsapp-web

COPY . .

RUN chmod 777 .wwebjs_auth/* && \
    yarn && \
    yarn run build

CMD ["yarn", "start"]
