## ADDED Requirements

### Requirement: Portainer frontend configuration SHALL use an explicit host file

The Portainer composition SHALL expose a configurable absolute host path for
the frontend Nginx configuration. The default path SHALL be outside the
Portainer data volume and SHALL be mounted read-only at
`/etc/nginx/conf.d/default.conf` in the frontend container.

#### Scenario: Host configuration file exists

- **WHEN** the stack is deployed with the configured host file present as a
  regular file
- **THEN** Docker mounts that file over the frontend Nginx configuration and
  the frontend container can start

#### Scenario: Host configuration file is absent

- **WHEN** the stack is deployed without the configured host file
- **THEN** deployment fails with an actionable missing-host-file error before
  the frontend is considered healthy

#### Scenario: Portainer data volume is not the host configuration source

- **WHEN** Portainer runs inside a container with `portainer_data:/data`
- **THEN** the frontend bind mount resolves from the Docker host filesystem and
  does not rely on a file stored only inside the Portainer container volume

### Requirement: The deployment documentation SHALL describe host provisioning

The deployment documentation SHALL identify the host path variable, the
required file permissions, the Portainer Git stack refresh, and the safe
recovery from a stale directory created by a failed bind mount.

#### Scenario: Operator provisions a new host

- **WHEN** an operator follows the documented provisioning procedure
- **THEN** the host configuration file exists before the stack is deployed and
  the compose interpolation points to that path

#### Scenario: Operator migrates an existing failed stack

- **WHEN** the previous relative mount created a directory at the old source
  path
- **THEN** the operator can identify and remove only that empty stale directory
  after verifying it is not shared, then redeploy from the updated Git stack
