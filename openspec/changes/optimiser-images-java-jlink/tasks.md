## 1. Establish the baseline

- [ ] 1.1 [T-197] Inspect the current backend and frontend Docker build inputs, image tags, BuildKit cache configuration and deployment healthchecks.
- [ ] 1.2 [T-197] Build the current backend image and record compressed size, uncompressed size, layer list, cold and warm build times, startup time and healthcheck result.
- [ ] 1.3 [T-197] Define measurable acceptance thresholds and document the generic JRE fallback image and rollback procedure.
- [ ] 1.4 [T-197] Build the current frontend image and record compressed size, uncompressed size, layer list, cold and warm build times, startup time and healthcheck result.

## 2. Optimize the backend build and runtime

- [ ] 2.1 [T-197] Reorder the backend Dockerfile and cache mounts so Maven descriptors and dependencies are reusable across source-only changes.
- [ ] 2.2 [T-197] Add the `jdeps` analysis and `jlink` runtime generation in a dedicated build stage, including explicit handling for modules not detected statically.
- [ ] 2.3 [T-197] Build a minimal glibc-compatible runtime image with CA certificates, required timezone data, the healthcheck tool, the existing entrypoint and no Maven or full JDK.
- [ ] 2.4 [T-197] Evaluate Spring Boot or Docker layer extraction and retain only the strategy that improves reuse without breaking startup or diagnostics.
- [ ] 2.5 [T-197] Reorder the frontend Dockerfile and cache mounts so npm dependencies are reusable across source-only changes.
- [ ] 2.6 [T-197] Keep only the browser assets and required Nginx configuration in the frontend runtime, and validate the SPA fallback, proxy, headers and optional non-root mode.

## 3. Validate compatibility and security

- [ ] 3.1 [T-197] Run backend tests and inspect the optimized image contents, user, filesystem permissions and exposed ports.
- [ ] 3.2 [T-197] Run container smoke tests for startup, Actuator readiness, mounted secrets, PostgreSQL, Flyway, JWT validation and TLS.
- [ ] 3.3 [T-197] Run the integration or Portainer compose healthchecks with the optimized candidate and compare the result with the baseline.
- [ ] 3.4 [T-197] Run frontend smoke tests for root and deep-link routes, static assets, API proxy, security headers, rate limits and the container healthcheck.

## 4. Integrate and document the delivery

- [ ] 4.1 [T-197] Add the image metrics and build commands to the deployment documentation and wire the required CI validation without changing release promotion semantics.
- [ ] 4.2 [T-197] Rebuild with and without cache, confirm the thresholds, document rollback, and prepare the PR for T-197 with all validation results.
- [ ] 4.3 [T-197] Inspect `.dockerignore`, base image versions, runtime users, filesystem permissions, labels and final layers for both images, then document the accepted practices.
