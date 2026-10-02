## Context

Portainer runs as a container with its own `portainer_data` volume mounted at
`/data`. The Docker daemon that starts the application stack runs on the host.
The previous relative bind mount therefore resolved to
`/data/compose/<stack-id>/nginx.portainer.conf` from the daemon perspective,
where the companion file was absent or was created as a directory after the
first failed deployment.

## Goals / Non-Goals

**Goals:**

- Make the Nginx configuration source an explicit absolute host path.
- Keep the file read-only inside the frontend container.
- Preserve the synchronized composition in the application and deployment
  repositories.
- Document provisioning and migration without placing the file in
  `portainer_data`.

**Non-Goals:**

- No change to the frontend image or application code.
- No change to Caddy TLS termination or PostgreSQL secrets.
- No automatic creation of host files by the application stack.

## Decisions

- Add `FRONTEND_NGINX_CONFIG_FILE_PATH` with a default such as
  `/etc/contribo/nginx/nginx.portainer.conf`.
- Mount `${FRONTEND_NGINX_CONFIG_FILE_PATH}` read-only at
  `/etc/nginx/conf.d/default.conf` with `bind.create_host_path: false`, so
  Compose fails explicitly when the source file is missing or is a directory.
- Provision the same file on the Docker host, outside the Portainer data
  volume, with mode `0644` and a parent directory mode `0755`.
- Keep the deployment repository composition byte-identical to the application
  repository composition. The deployment repository remains the source used by
  Portainer.
- Require an explicit Git stack refresh before redeployment so the composition
  and its environment example are current.

## Risks / Trade-offs

- [Risk] The host file can be missing or have the wrong type. -> Mitigation:
  document `test -f`, `stat`, and the expected permissions before deployment.
- [Risk] The chosen host path may not be accessible to the Docker daemon. ->
  Mitigation: use an absolute path on the Docker host and verify it from the
  host shell, not only from inside the Portainer container.
- [Risk] A stale directory can remain after the failed relative mount. ->
  Mitigation: inspect it and remove it only when empty and dedicated to this
  stack.

## Migration Plan

1. Stop the stack and remove any empty stale directory at the configured host
   path or at the old relative source path, only after verifying it is
   dedicated to this stack.
2. Create the host directory and copy the tracked Nginx configuration there.
3. Set `FRONTEND_NGINX_CONFIG_FILE_PATH` in the Portainer stack environment.
4. Pull the updated Git stack from `main` and redeploy.
5. Verify the frontend container healthcheck and the Caddy route.

Rollback restores the previous composition and removes the new host path only
after the stack no longer references it.

## Open Questions

None for the requested host-path correction.
