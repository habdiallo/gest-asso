# syntax=docker/dockerfile:1.7

FROM maven:3.9.11-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY contribo-back/pom.xml contribo-back/pom.xml
COPY contribo-back/src/main/resources/contribo-api.yml contribo-back/src/main/resources/contribo-api.yml

RUN --mount=type=cache,target=/root/.m2/repository \
    mvn -B -f contribo-back/pom.xml dependency:go-offline -DskipTests

COPY contribo-back/src contribo-back/src

RUN --mount=type=cache,target=/root/.m2/repository \
    mvn -B -f contribo-back/pom.xml package -DskipTests

FROM eclipse-temurin:21-jdk-jammy AS jlink

WORKDIR /opt/app
COPY --from=build /workspace/contribo-back/target/contribo-back.jar app.jar

RUN set -eux; \
    mkdir extracted; \
    cd extracted; \
    jar -xf ../app.jar; \
    modules="$(jdeps \
        --ignore-missing-deps \
        --multi-release 21 \
        --recursive \
        --print-module-deps \
        --class-path 'BOOT-INF/lib/*' \
        BOOT-INF/classes)"; \
    modules="${modules},jdk.crypto.ec,jdk.crypto.cryptoki,jdk.security.auth,jdk.unsupported"; \
    printf '%s\n' "$modules" > /opt/java-modules.txt; \
    jlink \
        --add-modules "$modules" \
        --strip-debug \
        --no-man-pages \
        --no-header-files \
        --compress=zip-6 \
        --output /opt/java-runtime; \
    rm -rf /opt/app/extracted /opt/app/app.jar

FROM ubuntu:22.04 AS runtime

LABEL org.opencontainers.image.title="Contribo backend"
LABEL org.opencontainers.image.description="Contribo Spring Boot API with a jlink runtime"

RUN apt-get update \
    && apt-get install --no-install-recommends --yes ca-certificates curl tzdata \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/opt/java
ENV PATH="${JAVA_HOME}/bin:${PATH}"

RUN useradd --system --uid 10001 --home-dir /app --shell /usr/sbin/nologin contribo

WORKDIR /app
COPY --from=jlink --chown=contribo:contribo /opt/java-runtime /opt/java
COPY --from=build --chown=contribo:contribo /workspace/contribo-back/target/contribo-back.jar app.jar
COPY --chmod=0755 contribo-deploiement/backend-entrypoint.sh /usr/local/bin/backend-entrypoint.sh

USER contribo

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=5 \
    CMD curl --fail --silent http://localhost:9001/actuator/health/readiness || exit 1

ENTRYPOINT ["/usr/local/bin/backend-entrypoint.sh"]
