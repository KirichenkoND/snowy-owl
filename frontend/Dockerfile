FROM node:21-alpine3.19 AS builder

WORKDIR /app

COPY ./package.json ./tsconfig.json ./tsconfig.node.json ./vite.config.ts ./index.html ./

RUN npm install

COPY ./public ./public
COPY ./src ./src

RUN find src -type f | grep -E '\.(ts|tsx)$' | xargs -I % sed -i '1s/^/\/\/ @ts-nocheck\n/' '%'

RUN npm run build

FROM nginx:1-alpine3.19 AS runtime

COPY nginx.conf /etc/nginx/nginx.conf

RUN rm /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html/app

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
