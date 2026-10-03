Ticket : T-198
Scope / type : infra / fix
Slug : durcir-secrets-runtime-portainer
Branche : infra/fix-198-durcir-secrets-runtime-portainer
Prérequis : T-197 fusionné dans develop

## 1. Reproduire et cadrer le blocage Portainer

- [ ] 1.1 [T-198] Vérifier la branche du ticket, résoudre T-198, confirmer le prérequis T-197 et préserver les fichiers non suivis existants avant toute modification de code.
- [ ] 1.2 [T-198] Reproduire sur Linux ou un équivalent fidèle la matrice de permissions des fichiers `db_password`, RSA et bootstrap avec l'UID 10001, puis consigner le cas root-owned illisible et le cas lisible.

## 2. Corriger le runtime et la documentation de déploiement

- [ ] 2.1 [T-198] Modifier `backend-entrypoint.sh` pour échouer explicitement si `DB_PASSWORD_FILE` est défini mais absent, vide ou illisible, sans afficher le secret et sans modifier le comportement des environnements qui fournissent directement `DB_PASSWORD`.
- [ ] 2.2 [T-198] Mettre à jour `PORTAINER.md` et `INTEGRATION.md` avec la préparation des propriétaires, groupes et modes compatibles avec UID 10001, les commandes `stat`, la note de migration et le rollback.
- [ ] 2.3 [T-198] Vérifier et ajuster les manifests ou la documentation pour que les secrets PostgreSQL, RSA et bootstrap soient lisibles par le runtime non-root sans être publics, puis valider les montages `file:` sous Compose et Portainer.
- [ ] 2.4 [T-198] Remplacer le nom de JAR versionné en dur dans les étapes Maven, jlink et runtime par un artefact stable et vérifier que le build reste indépendant de la version Maven du projet.
- [ ] 2.5 [T-198] Remplacer `jlink --compress=2` par la syntaxe supportée par le JDK utilisé, puis vérifier que la génération du runtime et son démarrage restent fonctionnels.
- [ ] 2.6 [T-198] Épingler la base runtime par digest ou documenter précisément la politique de mise à jour, et conserver une preuve de démarrage réel malgré les dépendances éventuellement chargées dynamiquement après `jdeps`.

## 3. Valider la compatibilité et la sécurité

- [ ] 3.1 [T-198] Exécuter les tests backend et les validations de génération, puis inspecter l'image finale, l'utilisateur, les permissions, les ports et l'absence d'outils de build.
- [ ] 3.2 [T-198] Ajouter ou exécuter un test automatisé de la matrice de permissions qui confirme la lecture par UID 10001 et l'échec explicite d'un fichier de mot de passe illisible.
- [ ] 3.3 [T-198] Exécuter le compose d'intégration avec PostgreSQL, Flyway, clés RSA et certificat TLS, puis vérifier les healthchecks, la readiness, JWT et une requête authentifiée.
- [ ] 3.4 [T-198] Vérifier la stack Portainer candidate ou son équivalent Linux, consigner l'état avant migration, effectuer la migration des secrets et vérifier le rollback vers la paire de digests précédente.

## 4. Livrer le correctif

- [ ] 4.1 [T-198] Vérifier la parité avec `gest-asso-deploiement` et préparer une PR miroir uniquement si un manifeste partagé a été modifié.
- [ ] 4.2 [T-198] Mettre à jour les artefacts OpenSpec et la documentation de revue, exécuter les validations finales, pousser uniquement la branche du ticket et ouvrir une PR vers `develop` sans la fusionner sans demande explicite.
