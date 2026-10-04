## MODIFIED Requirements

### Requirement: Staging consumes the release candidate

The staging deployment SHALL use the backend and frontend image references
produced by the same candidate workflow run. After publishing a candidate, the
CI SHALL open or update a pull request in the deployment repository that sets
both staging image references to their immutable digests. The deployment
configuration MUST support immutable image digests and MUST NOT require a
mutable `latest` tag.

#### Scenario: Candidate is deployed to staging

- **WHEN** the candidate workflow publishes both images and the maintainer merges the generated deployment pull request
- **THEN** Portainer starts both services from those exact image manifests

#### Scenario: Deployment pull request content

- **WHEN** the CI opens the staging deployment pull request
- **THEN** the pull request changes only the staging image references and its description lists the source commit, the workflow run and both digests

#### Scenario: Candidate references are incomplete

- **WHEN** either the backend or frontend image reference is missing
- **THEN** the Compose configuration fails before starting the stack

#### Scenario: Staging rollback is requested

- **WHEN** the candidate fails a smoke test
- **THEN** the maintainer reverts the deployment pull request and Portainer redeploys the previous backend and frontend digests without changing persistent database data

### Requirement: Production reuses the tested image

The production release SHALL use the same backend and frontend image digests that
passed staging. A push or merge to `main` MUST NOT rebuild a different production
image for that release. Pushing the `vX.Y.Z` tag SHALL read the digests
currently deployed in staging, SHALL refuse the promotion unless those images
were built from the tagged commit, SHALL retag those exact digests and SHALL
open a pull request in the deployment repository that sets the production image
references to `vX.Y.Z@sha256:<digest>`.

#### Scenario: Validated release is merged

- **WHEN** a release pull request is merged into `main` after staging validation and the `vX.Y.Z` tag is pushed
- **THEN** the production deployment pull request references the candidate digests without a new Docker build

#### Scenario: Commit added after staging validation

- **WHEN** a commit is added to the release after the staging deployment and that new commit is tagged
- **THEN** the promotion fails because the images deployed in staging were not built from the tagged commit, and nothing is retagged

#### Scenario: Production promotion is performed

- **WHEN** the maintainer merges the production deployment pull request
- **THEN** both services run the same release candidate that was tested in staging

#### Scenario: Production rollback is performed

- **WHEN** a production smoke test fails after promotion
- **THEN** the maintainer reverts the production deployment pull request and the previous pair of image digests is restored from Git history
