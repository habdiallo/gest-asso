## Why

Le workflow actuel reconstruit les images Docker lors de la validation de la
release puis après sa fusion dans `main`. La release ne peut donc pas être
déployée en staging avec l'image qui sera utilisée en production, et le build
de production peut produire un artefact différent.

Le projet doit construire une candidate de release une seule fois, la valider
en staging, puis promouvoir le même digest Docker en production. Le processus
doit rester compréhensible et exploitable par un mainteneur seul.

## What Changes

- Conserver les validations sans publication sur les pull requests.
- Construire et publier une image candidate immuable depuis `release/vX.Y.Z`.
- Rendre la candidate déployable en staging avant le merge vers `main`.
- Exiger la validation staging avant la promotion de la release.
- Ne plus reconstruire les images sur `main` après le merge d'une release.
- Promouvoir vers la production les mêmes images, identifiées par leur digest.
- Documenter le rôle du dépôt `gest-asso-deploiement`, les variables d'image et
  la procédure de rollback.
- Préserver une promotion manuelle et explicite, adaptée à un projet maintenu
  par une seule personne.

## Capabilities

### New Capabilities

- `release-image-promotion`: construire, tester et promouvoir un même artefact
  Docker entre staging et production.

### Modified Capabilities

Aucune.

## Impact

- `.github/workflows/backend-frontend-images.yml` et les contrôles CI associés.
- Documentation du workflow de branches et du déploiement Portainer.
- Références d'images utilisées par le dépôt `gest-asso-deploiement`.
- Aucun changement d'API, de schéma de données ou de fonctionnalité frontend.
- Les images candidates et de production utiliseront le registre GHCR avec des
  tags de traçabilité et des digests immuables.
