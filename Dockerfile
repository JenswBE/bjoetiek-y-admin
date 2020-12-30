# Based on https://vuejs.org/v2/cookbook/dockerize-vuejs-app.html

# Build application
FROM node:lts-alpine as builder
WORKDIR /app
RUN apk add python make g++
COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY . .
RUN yarn generate

# Build final image
FROM nginx:stable-alpine
ARG SERVICE_NAME
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]