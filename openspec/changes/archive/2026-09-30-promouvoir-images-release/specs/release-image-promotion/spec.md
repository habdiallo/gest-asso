## ADDED Requirements

### Requirement: Release candidate images are published once

The CI SHALL build and publish the backend and frontend images from a validated
`release/vX.Y.Z` or `hotfix/<description>` push, using tags that identify the
source branch and commit SHA. A failed backend or frontend validation MUST
prevent publication of either image.

#### Scenario: Validated release candidate is published

- **WHEN** a push to a release or hotfix branch completes the backend and frontend validations successfully
- **THEN** CI publishes both candidate images to GHCR with traceable tags and exposes their digests in the workflow result

#### Scenario: Failed validation blocks publication

- **WHEN** either the backend or frontend validation fails for a release or hotfix push
- **THEN** CI does not publish a candidate image

#### Scenario: Pull request validation does not publish

- **WHEN** a pull request workflow validates a feature, release or hotfix branch
- **THEN** CI may build for validation but MUST NOT push an image to GHCR

### Requirement: Staging consumes the release candidate

The staging deployment SHALL use the backend and frontend image references
produced by the same candidate workflow run. The deployment configuration MUST
support immutable image digests and MUST NOT require a mutable `latest` tag.

#### Scenario: Candidate is deployed to staging

- **WHEN** the maintainer supplies the candidate backend and frontend digests to the staging stack
- **THEN** Portainer starts both services from those exact image manifests

#### Scenario: Candidate references are incomplete

- **WHEN** either the backend or frontend image reference is missing
- **THEN** the Compose configuration fails before starting the stack

#### Scenario: Staging rollback is requested

- **WHEN** the candidate fails a smoke test
- **THEN** the maintainer can redeploy the previous backend and frontend digests without changing persistent database data

### Requirement: Production reuses the tested image

The production release SHALL use the same backend and frontend image digests that
passed staging. A push or merge to `main` MUST NOT rebuild a different production
image for that release.

#### Scenario: Validated release is merged

- **WHEN** a release pull request is merged into `main` after staging validation
- **THEN** the production deployment can use the candidate digests without a new Docker build

#### Scenario: Production promotion is performed

- **WHEN** the maintainer updates the production Portainer stack with the two validated digests
- **THEN** both services run the same release candidate that was tested in staging

#### Scenario: Production rollback is performed

- **WHEN** a production smoke test fails after promotion
- **THEN** the maintainer can restore the previously recorded pair of image digests
