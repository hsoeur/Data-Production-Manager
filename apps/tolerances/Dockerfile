FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/tolerances/package.json apps/tolerances/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci
COPY apps/tolerances apps/tolerances
COPY packages/shared packages/shared
RUN npm run build:tolerances

FROM nginx:1.29-alpine AS production
COPY apps/tolerances/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/tolerances/dist /usr/share/nginx/html
ENV API_DATA_BASE_URL=http://localhost:5000/api
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1
CMD ["/bin/sh", "-c", "envsubst '${API_DATA_BASE_URL}' < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js && exec nginx -g 'daemon off;'"]
