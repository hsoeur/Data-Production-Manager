FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.29-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
ENV API_DATA_BASE_URL=http://localhost:5000/api
EXPOSE 80
CMD ["/bin/sh", "-c", "envsubst '${API_DATA_BASE_URL}' < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js && exec nginx -g 'daemon off;'"]
