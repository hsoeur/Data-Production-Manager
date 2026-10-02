ARG BUILDER_IMAGE=pdm-build-deps:c3fda0e48f41
FROM ${BUILDER_IMAGE} AS builder

WORKDIR /app
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
