FROM node:20

WORKDIR /app

COPY . /app

RUN npm install
RUN npm run build

ENV PORT 3000

EXPOSE 3000

CMD ["node", "dist/index.js"]