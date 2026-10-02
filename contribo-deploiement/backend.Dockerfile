FROM maven:3.9.11-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY contribo-back/src/main/resources/contribo-api.yml contribo-back/src/main/resources/contribo-api.yml
COPY contribo-back/pom.xml contribo-back/pom.xml
COPY contribo-back/src contribo-back/src

RUN mvn -B -f contribo-back/pom.xml package -DskipTests

FROM eclipse-temurin:21-jre-jammy

RUN apt-get update \
    && apt-get install --no-install-recommends --yes curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /workspace/contribo-back/target/contribo-back-0.1.0-SNAPSHOT.jar app.jar
COPY contribo-deploiement/backend-entrypoint.sh /usr/local/bin/backend-entrypoint.sh
RUN chmod 0755 /usr/local/bin/backend-entrypoint.sh

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=5 \
    CMD curl --fail --silent http://localhost:9001/actuator/health/readiness || exit 1

ENTRYPOINT ["/usr/local/bin/backend-entrypoint.sh"]
