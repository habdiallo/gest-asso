# syntax=docker/dockerfile:1.7
# Images de base épinglées par digest (reproductibilité) ; Dependabot met à jour tag et digest.

FROM maven:3.9.11-eclipse-temurin-21@sha256:6fdc855a6ed81d288ca7ca37ac6ff5e9308b612485c0801d70b25a858c83d237 AS build

WORKDIR /workspace
COPY contribo-back/pom.xml contribo-back/pom.xml
COPY contribo-back/src/main/resources/contribo-api.yml contribo-back/src/main/resources/contribo-api.yml

RUN --mount=type=cache,target=/root/.m2/repository \
    mvn -B -f contribo-back/pom.xml dependency:go-offline -DskipTests

COPY contribo-back/src contribo-back/src

RUN --mount=type=cache,target=/root/.m2/repository \
    mvn -B -f contribo-back/pom.xml package -DskipTests

FROM eclipse-temurin:21-jre-alpine@sha256:51ab5e3302e7141ce665ca3ea85e8b5cd648eafbc3c0c90dd79d6537684e4555 AS runtime

LABEL org.opencontainers.image.title="Contribo backend"
LABEL org.opencontainers.image.description="Contribo Spring Boot API on the Temurin 21 JRE"

RUN addgroup -S -g 10001 contribo \
    && adduser -S -D -u 10001 -G contribo -h /app -s /sbin/nologin contribo

WORKDIR /app
COPY --from=build --chown=contribo:contribo /workspace/contribo-back/target/contribo-back.jar app.jar

USER contribo

# Les secrets sont lus par Spring Boot depuis ce répertoire (spring.config.import=configtree).
ENV SECRETS_DIR=/run/secrets

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=5 \
    CMD wget --quiet --spider http://127.0.0.1:9001/actuator/health/readiness || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
