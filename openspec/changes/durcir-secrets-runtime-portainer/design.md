## Context

La PR #219 a remplacé le runtime backend root par l'utilisateur `contribo`
(UID 10001). Les stacks Portainer et intégration utilisent des secrets Docker
créés depuis des fichiers hôtes avec `file:`. Sur un hôte Linux, les
propriétaires et modes de ces fichiers peuvent donc empêcher l'UID 10001 de
lire le mot de passe PostgreSQL ou les clés RSA.

Le problème est aggravé par `backend-entrypoint.sh`, qui ignore actuellement un
fichier `DB_PASSWORD_FILE` illisible et démarre ensuite la JVM sans mot de
passe. Le ticket couvre le backend, les manifests et la documentation de
déploiement. Il ne modifie ni le contrat API ni le schéma de données.

## Goals / Non-Goals

**Goals:**

- Garantir la lecture des secrets par l'UID 10001 sous Portainer et Compose sur
  un hôte Linux.
- Échouer rapidement et sans divulgation si un secret obligatoire est absent,
  vide ou illisible.
- Fournir une migration explicite des secrets existants avant redéploiement.
- Valider la correction avec une matrice de permissions, les deux stacks, les
  healthchecks, Flyway, RSA, JWT et TLS.
- Corriger les détails de reproductibilité de l'image signalés par la revue.

**Non-Goals:**

- Revenir à un runtime root ou modifier le modèle de sécurité de l'application.
- Changer les routes API, les migrations métier ou les données PostgreSQL.
- Ajouter un gestionnaire de secrets externe ou transformer ces stacks en
  déploiements Swarm.
- Modifier le frontend en dehors des validations nécessaires à la stack.

## Decisions

### Utiliser le propriétaire numérique du runtime

Les fichiers `db_password`, `rsa_private.pem`, `rsa_public.pem` et, lorsqu'il
est activé, `bootstrap_admin_password` seront documentés avec le propriétaire
numérique UID 10001 et un mode privé adapté. Le dossier hôte restera protégé,
mais le mode du fichier monté devra permettre sa lecture par l'utilisateur du
conteneur.

Un groupe partagé avec un mode `640` a été considéré, mais il dépend de la
présence d'un groupe stable sur l'hôte. Revenir au runtime root masque le défaut
et annule le durcissement de T-197, donc cette alternative est rejetée.

### Faire échouer l'entrypoint avant la JVM

Quand `DB_PASSWORD_FILE` est défini, l'entrypoint vérifiera que le fichier est
lisible et non vide, puis exportera sa valeur. Toute erreur produira un message
de diagnostic générique sur stderr et un code de sortie non nul, sans afficher
le mot de passe. Si la variable n'est pas définie, le comportement actuel des
environnements qui fournissent directement `DB_PASSWORD` reste inchangé.

### Tester les droits sur un hôte Linux ou équivalent

Les tests créeront des fichiers avec plusieurs combinaisons de propriétaire et
de mode, puis lanceront le runtime avec UID 10001. Le compose d'intégration
restera le test fonctionnel de PostgreSQL, Flyway, RSA, JWT et TLS. Les tests
Docker Desktop macOS seront conservés comme smoke tests, mais ne suffiront plus
à eux seuls pour conclure sur les permissions.

### Stabiliser les artefacts Docker

Le build Maven produira un nom de JAR stable consommé par les étapes `jlink` et
runtime. L'option de compression sera mise à jour vers la syntaxe supportée par
le JDK utilisé. La base runtime sera épinglée par digest ou, si la politique du
dépôt l'interdit pour cette image, la raison et la procédure de mise à jour
seront documentées.

### Garder une seule PR applicative

Le ticket reste une PR `infra/fix-199-durcir-secrets-runtime-portainer` vers
`develop`, dépendante de T-197. Aucun manifeste partagé ne sera modifié sans
vérifier la copie du dépôt `gest-asso-deploiement` et créer une PR miroir si
nécessaire.

## Risks / Trade-offs

- [Secret existant illisible] → fournir une commande de migration idempotente,
  vérifier les modes avec `stat` et documenter le contrôle avant pull de l'image.
- [Erreur silencieuse supprimée] → certains déploiements actuellement démarrés
  par défaut échoueront explicitement, ce qui est voulu et doit être signalé
  dans la note de migration.
- [Module Java dynamique absent] → conserver la détection `jdeps`, ajouter un
  démarrage réel avec secrets et healthcheck, et garder le fallback JRE
  documenté.
- [Différence Compose Linux et Docker Desktop] → exécuter la matrice de droits
  dans un environnement Linux ou un conteneur reproduisant les UID numériques.
- [Changement de nom du JAR] → valider les étapes Maven, jlink et runtime dans
  les deux architectures supportées par la CI avant publication.

## Migration Plan

1. Vérifier l'hôte Portainer et identifier les chemins de secrets sans afficher
   leur contenu.
2. Arrêter ou mettre en maintenance la stack, ajuster les propriétaires et
   modes des fichiers secrets, puis vérifier leur lisibilité par UID 10001.
3. Déployer les images corrigées avec les deux digests issus du même run CI.
4. Vérifier les healthchecks, Actuator readiness, les logs de migration Flyway,
   une connexion et une requête authentifiée.
5. En cas d'échec, redéployer la paire de digests précédente et conserver les
   secrets corrigés. Ne supprimer aucune donnée PostgreSQL.

## Operational Decisions

- Le chemin des secrets n'est pas imposé par le ticket. Le script lit les
  variables `*_FILE_PATH` de l'environnement Compose, avec
  `/opt/contribo/secrets` comme fallback historique de Portainer.
- La CI publie la preuve de la matrice de permissions dans les logs du job
  backend. Le résumé du workflow reste réservé aux digests d'images publiés.
