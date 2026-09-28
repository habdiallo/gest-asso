FROM node:22-alpine AS build

RUN apk add --no-cache openjdk21-jre-headless

WORKDIR /workspace/contribo-front
COPY contribo-front/package.json contribo-front/package-lock.json ./
RUN npm ci
COPY besoins/openapi.yaml /workspace/besoins/openapi.yaml
COPY contribo-front/ ./

RUN npm run generate:api && npm run build

FROM nginx:1.27-alpine

COPY contribo-deploiement/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/contribo-front/dist/contribo-front/browser /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
    CMD wget --quiet --spider http://localhost/ || exit 1
