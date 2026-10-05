ARG BUILDER_IMAGE=pdm-build-deps:c3fda0e48f41
FROM ${BUILDER_IMAGE} AS builder

WORKDIR /app
COPY apps/notifications apps/notifications
COPY packages/shared packages/shared
RUN npm run build --workspace @pdm/notifications

FROM nginx:1.29-alpine AS production
COPY apps/notifications/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/notifications/dist /usr/share/nginx/html
ENV API_DATA_BASE_URL=http://localhost:5000/api
ENV API_PARSER_URL=http://localhost:7003/api
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1
CMD ["/bin/sh", "-c", "envsubst '${API_DATA_BASE_URL} ${API_PARSER_URL}' < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js && exec nginx -g 'daemon off;'"]
