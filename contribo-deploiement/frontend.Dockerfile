# syntax=docker/dockerfile:1.7
# Images de base épinglées par digest (reproductibilité) ; Dependabot met à jour tag et digest.

FROM node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS build

RUN apk add --no-cache openjdk21-jre-headless

WORKDIR /workspace/contribo-front
COPY contribo-front/package.json contribo-front/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY contribo-back/src/main/resources/contribo-api.yml /workspace/contribo-back/src/main/resources/contribo-api.yml
COPY contribo-front/ ./

RUN npm run generate:api && npm run build

FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:ed04ec1ff34502c339ee5c3ae3f855442398edc1d05591e2b98981dcbbd20b1e

LABEL org.opencontainers.image.title="Contribo frontend"
LABEL org.opencontainers.image.description="Contribo Angular application served by unprivileged Nginx over internal HTTP"

# Seule variable rendue par envsubst ; les variables Nginx ($uri, $host...) restent intactes.
ENV TRUSTED_PROXY_CIDR=172.16.0.0/12 \
    NGINX_ENVSUBST_FILTER=^TRUSTED_PROXY_CIDR$

COPY contribo-deploiement/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY contribo-deploiement/proxy-common.conf \
     contribo-deploiement/nginx-rate-limits.conf \
     contribo-deploiement/security-headers.conf \
     contribo-deploiement/nginx-application-locations.conf \
     /etc/nginx/includes/
COPY --from=build /workspace/contribo-front/dist/contribo-front/browser /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
    CMD wget --quiet --spider http://127.0.0.1:8080/ || exit 1
