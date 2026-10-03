## ADDED Requirements

### Requirement: The backend image build SHALL preserve reusable dependency layers

The backend image build SHALL resolve Maven dependencies before copying application sources, and SHALL expose a reproducible BuildKit cache strategy for dependency and build artifacts. A source-only change SHALL NOT invalidate the dependency resolution layer when the Maven descriptor and API contract inputs are unchanged.

#### Scenario: Source change reuses Maven dependencies
- **WHEN** the backend source changes without changing `pom.xml` or the OpenAPI resource used by the build
- **THEN** the dependency resolution layer remains reusable and the build downloads no unchanged Maven dependency

#### Scenario: Dependency descriptor change invalidates the correct layer
- **WHEN** `pom.xml` or the OpenAPI resource required by code generation changes
- **THEN** the dependency and generated-source layers are rebuilt before the application package layer

### Requirement: The backend image SHALL provide a validated targeted Java runtime

The build SHALL derive or verify the Java module set with `jdeps`, use that result to create a Java 21 runtime with `jlink`, and keep the runtime configuration explicit enough to reproduce the image. The final image SHALL NOT contain Maven or a full JDK.

#### Scenario: Runtime modules are derived from the packaged application
- **WHEN** the backend image build packages the application
- **THEN** `jdeps` analyzes the application classes and runtime libraries and the resulting module list is supplied to `jlink`

#### Scenario: Dynamically loaded runtime modules are covered
- **WHEN** a startup or integration test exercises Spring Boot, TLS, JWT, JDBC, PostgreSQL, Flyway or Actuator
- **THEN** every module required by that path is present in the targeted runtime, including modules that need an explicit documented addition

#### Scenario: Final image excludes build tooling
- **WHEN** the final backend image is inspected
- **THEN** Maven caches, Maven executables and the JDK compiler tools are absent from the runtime layers

### Requirement: The optimized image SHALL remain compatible with deployment health and security expectations

The optimized image SHALL retain the existing entrypoint contract, the Actuator readiness endpoint on port 9001, access to mounted secrets, CA certificates, timezone data required by the application, and the healthcheck command. The container SHALL run without requiring a writable system configuration directory.

#### Scenario: Container becomes healthy
- **WHEN** the optimized backend image is started with the integration or Portainer environment and its required secrets
- **THEN** the application starts, the readiness endpoint responds successfully on port 9001, and the container healthcheck becomes healthy

#### Scenario: Runtime dependencies are available
- **WHEN** the application performs a PostgreSQL connection, Flyway migration, JWT validation or an outbound TLS operation
- **THEN** the operation reaches the same application-level result as with the current supported backend image

#### Scenario: Container filesystem restrictions do not break startup
- **WHEN** the container is started with its runtime filesystem directories read-only except for explicitly mounted paths
- **THEN** the entrypoint and application start without attempting to rewrite the Nginx or system configuration, and the healthcheck remains executable

### Requirement: Image optimization SHALL be measurable and reversible

The change SHALL record baseline and optimized image size, layer composition, build time with cache, build time without cache, startup time and smoke-test results. The deployment workflow SHALL publish the optimized image only after the existing backend validations and targeted runtime checks pass, with a documented fallback to the previously supported JRE image.

#### Scenario: Candidate image passes the release gate
- **WHEN** the image workflow builds an optimized candidate
- **THEN** backend tests, image startup checks, healthcheck checks and integration smoke tests pass before the image is used for promotion

#### Scenario: Optimization regression is detected
- **WHEN** the optimized image fails a runtime check or does not meet the documented size or build-time threshold
- **THEN** the candidate is rejected or the generic JRE variant is selected, and the measured reason is recorded for follow-up

#### Scenario: Rollback is performed
- **WHEN** a deployed optimized image shows a production regression
- **THEN** deployment can be pointed back to the previous immutable backend image without changing application data or the API contract
