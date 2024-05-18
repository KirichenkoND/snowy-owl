FROM node

WORKDIR /app

COPY ./.eslintrc.cjs ./package.json ./tsconfig.json ./tsconfig.node.json ./vite.config.ts ./index.html ./
COPY ./public ./
COPY ./src ./

EXPOSE 5173

RUN npm install
CMD ["npm run dev"]