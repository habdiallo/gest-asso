## Why

La revue de la PR #219 a identifié un risque P0 sur le déploiement Portainer :
le runtime backend UID 10001 peut ne pas lire les secrets `file:` lorsque
Portainer conserve les propriétaires et permissions de l'hôte. Le mot de passe
PostgreSQL est alors ignoré silencieusement par l'entrypoint, tandis que les
clés RSA peuvent empêcher le démarrage de l'application.

Le même ticket traite les écarts techniques relevés pendant la revue, afin que
la prochaine image soit vérifiable sur un hôte Linux et que la migration des
environnements existants soit explicite.

## What Changes

- Documenter une procédure Portainer et intégration qui rend les secrets lisibles
  par l'UID 10001, avec migration des fichiers déjà présents et procédure de
  retour arrière.
- Faire échouer explicitement l'entrypoint lorsque `DB_PASSWORD_FILE` est défini
  mais absent, vide ou illisible, sans afficher la valeur du secret.
- Vérifier la lecture des secrets PostgreSQL, RSA et bootstrap avec les droits
  réels du runtime non-root.
- Remplacer le nom de JAR versionné en dur dans le Dockerfile par un nom de
  build stable.
- Remplacer l'option `jlink --compress=2` dépréciée et documenter ou épingler la
  base runtime de manière reproductible.
- Ajouter une validation Linux ou équivalente des permissions, du démarrage,
  des migrations Flyway, de l'authentification JWT, des healthchecks et du TLS.

## Capabilities

### New Capabilities

Aucune nouvelle capacité fonctionnelle. Le ticket durcit des capacités de
déploiement et de démarrage déjà existantes.

### Modified Capabilities

- `actuator-and-secret-hardening` : un secret fichier configuré mais illisible
  doit provoquer une erreur de démarrage explicite et sûre.
- `portainer-deployment` : la documentation et la validation doivent garantir
  que les secrets montés depuis l'hôte sont lisibles par le runtime non-root et
  qu'une migration est fournie avant redéploiement.

## Impact

- Fichiers de déploiement : `backend-entrypoint.sh`, les Dockerfiles et les
  documents `PORTAINER.md` et `INTEGRATION.md`.
- Images Docker backend et frontend, sans modification du contrat API, du
  schéma PostgreSQL ou des données métier.
- Environnements Portainer et intégration existants : une correction des
  propriétaires ou groupes des secrets sera nécessaire avant le redéploiement
  de l'image corrigée.
- La composition `gest-asso-deploiement` devra être vérifiée et synchronisée si
  le correctif modifie un manifeste partagé.
