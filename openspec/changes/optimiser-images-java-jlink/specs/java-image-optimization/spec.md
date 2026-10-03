## ADDED Requirements

### Requirement: The backend and frontend image builds SHALL preserve reusable dependency layers

The backend image build SHALL resolve Maven dependencies before copying application sources, and the frontend image build SHALL resolve npm dependencies before copying application sources. Both builds SHALL expose a reproducible BuildKit cache strategy for dependency and build artifacts. A source-only change SHALL NOT invalidate the relevant dependency resolution layer when the Maven or npm descriptors and API contract inputs are unchanged.

#### Scenario: Backend source change reuses Maven dependencies
- **WHEN** the backend source changes without changing `pom.xml` or the OpenAPI resource used by the build
- **THEN** the Maven dependency resolution layer remains reusable and the build downloads no unchanged Maven dependency

#### Scenario: Frontend source change reuses npm dependencies
- **WHEN** the frontend source changes without changing `package.json` or `package-lock.json`
- **THEN** the npm installation layer remains reusable and the build downloads no unchanged npm dependency

#### Scenario: Dependency descriptor change invalidates the correct layer
- **WHEN** `pom.xml` or the OpenAPI resource required by code generation changes
- **THEN** the dependency and generated-source layers are rebuilt before the application package layer

#### Scenario: Frontend dependency descriptor change invalidates the correct layer
- **WHEN** `package.json` or `package-lock.json` changes
- **THEN** the npm installation layer is rebuilt before the Angular package layer

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

### Requirement: The frontend image SHALL contain only a validated Nginx runtime

The final frontend image SHALL contain the browser build output and the Nginx configuration required to serve the SPA and proxy the API. It SHALL NOT contain Node.js, Java, npm caches, source files or build-only dependencies. The image SHALL preserve the SPA fallback, proxy behavior, security headers, rate limits and frontend healthcheck.

#### Scenario: Frontend runtime excludes build tooling
- **WHEN** the final frontend image is inspected
- **THEN** Node.js, Java, npm caches, source files and package manager metadata are absent from the runtime layers

#### Scenario: Frontend serves the SPA and API proxy
- **WHEN** the frontend container is started with the supported Nginx configuration
- **THEN** the root page, a direct deep link, static assets and the configured API proxy respond with the same application behavior as the current image

#### Scenario: Frontend container becomes healthy
- **WHEN** the optimized frontend image starts with the deployment healthcheck
- **THEN** the healthcheck succeeds without requiring a writable system configuration directory

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

### Requirement: Both images SHALL follow explicit container hygiene rules

The backend and frontend builds SHALL use an appropriate `.dockerignore`, explicit base image versions, reproducible tags or digests where supported by the repository workflow, and no build secrets in image layers. Each image SHALL run with the least privileged user and filesystem permissions compatible with its runtime and deployment configuration.

#### Scenario: Build context excludes local artifacts
- **WHEN** either image build sends its Docker context
- **THEN** source-control metadata, local secrets, dependency caches, test reports and unrelated files are excluded

#### Scenario: Runtime image does not contain build secrets
- **WHEN** the final backend or frontend image is inspected
- **THEN** no secret value, private key, package-manager credential or build cache credential is present in any runtime layer

#### Scenario: Least privilege is validated
- **WHEN** an image is configured to run as a non-root user
- **THEN** its healthcheck, static serving, API proxy or backend startup remain functional with the deployment filesystem restrictions

### Requirement: Image optimization SHALL be measurable and reversible

The change SHALL record baseline and optimized image size, layer composition, build time with cache, build time without cache, startup time and smoke-test results for both images. The deployment workflow SHALL publish optimized images only after the existing backend and frontend validations and targeted runtime checks pass, with documented fallbacks to the previously supported images.

#### Scenario: Candidate image passes the release gate
- **WHEN** the image workflow builds an optimized candidate
- **THEN** backend tests, image startup checks, healthcheck checks and integration smoke tests pass before the image is used for promotion

#### Scenario: Frontend candidate passes the release gate
- **WHEN** the image workflow builds an optimized frontend candidate
- **THEN** frontend tests, browser build checks, image startup checks, SPA and proxy smoke tests and the healthcheck pass before the image is used for promotion

#### Scenario: Optimization regression is detected
- **WHEN** the optimized image fails a runtime check or does not meet the documented size or build-time threshold
- **THEN** the candidate is rejected or the corresponding current backend or frontend image is selected, and the measured reason is recorded for follow-up

#### Scenario: Rollback is performed
- **WHEN** a deployed optimized image shows a production regression
- **THEN** deployment can be pointed back to the previous immutable backend and frontend images without changing application data or the API contract
