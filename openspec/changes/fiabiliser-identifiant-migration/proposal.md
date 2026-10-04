## Pourquoi

La livraison de T-200 a rendu l'identifiant de connexion indépendant du numéro de téléphone et l'affiche dans le détail d'un compte utilisateur. Deux points de fiabilisation restent à traiter avant de considérer ce parcours terminé : une erreur de lecture du détail n'est pas signalée à l'administrateur, et la migration V4 dépend encore du comportement de `lower()` selon la locale PostgreSQL pour certains noms accentués en majuscules.

## Changements

- Signaler dans le dialogue de détail utilisateur l'échec de `getUser`, sans fermer le dialogue ni écraser les changements de rôle ou d'autorisation déjà saisis.
- Permettre de relancer la lecture du détail depuis le dialogue et afficher l'identifiant uniquement quand sa lecture a réussi.
- Rendre la normalisation des noms de la migration des identifiants indépendante de la locale de la base, notamment pour les majuscules accentuées.
- Ajouter une migration corrective traçable pour les identifiants déjà traités par V4, en conservant le suffixe numérique, les comptes, les mots de passe, les rôles et l'historique.
- Faire échouer la migration de manière atomique et explicite en cas de collision au lieu de produire une paire d'identifiants ambiguë.

## Périmètre

- Frontend : dialogue Utilisateurs et rôles, traductions et tests ciblés.
- Backend et base : migration Flyway corrective après V4, tests PostgreSQL et documentation de vérification.
- Contrat API : aucun nouveau champ ni changement de permission ; le détail existant reste la source de l'identifiant.

## Hors périmètre

- Aucun changement de l'identifiant affiché dans les listes.
- Aucun changement de la politique de génération ou du format validé par T-200, sauf pour partager la normalisation si cela est nécessaire à la cohérence.
- Aucune suppression ou recréation de compte utilisateur.
