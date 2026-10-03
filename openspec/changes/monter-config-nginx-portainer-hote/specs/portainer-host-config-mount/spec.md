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

### Requirement: The production frontend stylesheet SHALL load under the Nginx CSP

The production frontend build SHALL expose its complete stylesheet through a
regular stylesheet link and SHALL NOT require an inline event handler to switch
the link from `media="print"` to an active media mode.

#### Scenario: CSP does not disable the frontend layout

- **WHEN** the production frontend is served with the deployment CSP
  `script-src 'self'`
- **THEN** the stylesheet link is active without executing inline JavaScript
  and the login layout keeps its grid, sizing and responsive utility classes

### Requirement: The frontend healthcheck SHALL use an IPv4 loopback address

The frontend healthcheck SHALL probe `127.0.0.1` instead of `localhost` so it
does not depend on IPv6 being enabled or configured inside the container.

#### Scenario: Portainer frontend is healthy with a read-only Nginx mount

- **WHEN** the Portainer Nginx configuration is mounted at
  `/etc/nginx/conf.d/default.conf` with read-only permissions
- **THEN** the frontend healthcheck reaches Nginx through `127.0.0.1` and
  reports healthy even if the entrypoint cannot modify the mounted file
