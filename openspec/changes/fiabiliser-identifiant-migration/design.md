## Contexte

T-200 est fusionné dans `develop` et la migration V4 a déjà été livrée. Le frontend charge les détails du compte après l'ouverture du dialogue afin d'obtenir l'identifiant, tandis que les valeurs de rôle et d'autorisation sont éditables immédiatement. La réponse tardive ne doit donc pas remplacer ces brouillons, et une erreur de lecture ne doit pas être silencieuse.

Le ticket utilise le code T-200 déjà fusionné comme base fonctionnelle. Les vérifications manuelles d'intégration encore ouvertes dans les cases historiques de T-200 restent suivies séparément et ne bloquent pas la correction du code sur cette branche.

La migration V4 normalise les prénoms et noms avec `lower()` puis `translate()`. Cette séquence peut varier pour des caractères accentués en majuscules selon la locale PostgreSQL. Une correction doit couvrir les comptes déjà migrés, sans supposer que V4 puisse être rejouée.

## Décisions

### Détail utilisateur

- Ajouter un état d'erreur distinct pour le chargement du détail, réinitialisé à chaque ouverture et à chaque nouvelle tentative.
- Utiliser le callback d'erreur de `getUser` pour conserver le dialogue ouvert, garder les brouillons de rôle et d'autorisation, masquer l'identifiant absent et afficher un message traduit non sensible.
- Ajouter une action de nouvelle tentative dans le dialogue. Une réponse réussie efface l'erreur et affiche l'identifiant ; elle ne remplace jamais les brouillons locaux de rôle ou d'autorisation.
- Ne pas modifier le contrat OpenAPI ni les colonnes des listes.

### Migration indépendante de la locale

- Ajouter une migration Flyway versionnée après V4. Elle utilise une table d'audit T-204 séparée pour enregistrer chaque correction, sans altérer la correspondance historique T-200.
- Calculer le préfixe avec une table de translittération explicite couvrant les lettres ASCII et les majuscules et minuscules accentuées prises en charge. Le calcul ne doit pas dépendre de `lower()` pour transformer les caractères accentués.
- Recalculer uniquement les lignes inventoriées dans `user_account_identifier_migration_t200`. Conserver le suffixe numérique à quatre chiffres déjà attribué par V4 afin de ne pas changer inutilement l'identifiant communiqué.
- Vérifier l'unicité dans l'association avant chaque correction. Toute collision ou identifiant source non conforme provoque une exception explicite et le rollback de la migration entière.
- Préserver l'UUID du compte, le hash du mot de passe, le rôle, l'état, le membre, l'association et toutes les données métier. Les lignes inchangées sont valides et ne sont pas dupliquées dans l'audit.

## Validation et retour arrière

- Frontend : tests du succès, de l'erreur et de la nouvelle tentative, avec une modification de rôle effectuée avant la réponse asynchrone.
- Base : exécuter la migration sur PostgreSQL avec une locale C et avec des noms contenant des majuscules accentuées, des prénoms composés et des collisions contrôlées.
- Vérifier que les deux comptes historiques de l'intégration conservent leur suffixe et que la table d'audit décrit chaque modification réelle.
- Le retour arrière applicatif consiste à retirer la PR. Pour la base, le runbook doit utiliser l'audit T-204 pour restaurer uniquement les anciennes valeurs si aucune modification ultérieure ne les a réutilisées ; toute restauration doit d'abord vérifier l'unicité.
