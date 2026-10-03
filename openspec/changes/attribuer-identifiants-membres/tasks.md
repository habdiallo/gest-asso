Ticket : T-200
Scope / type : fullstack / feat
Slug : attribuer-identifiants-membres
Branche : fullstack/feat-200-attribuer-identifiants-membres
Prérequis : aucun ticket ; conserver les comptes existants et leur historique

## 1. Cadrer le format et la migration

- [x] 1.1 [T-200] Résoudre T-200, vérifier la branche attendue et préserver les fichiers non suivis existants avant toute modification de code.
- [ ] 1.2 [T-200] Inventorier les comptes dont l'identifiant est un téléphone, relever leurs UUID, membres, associations et collisions potentielles sans exposer de mot de passe, puis préparer la correspondance de migration réversible.
- [x] 1.3 [T-200] Implémenter et tester la normalisation des noms, la gestion des prénoms composés et la génération du code numérique de quatre chiffres avec une longueur maximale et un fallback documentés.

## 2. Implémenter l'identifiant backend

- [x] 2.1 [T-200] Générer un identifiant stable `initialesprenomnom-code` lors de la création d'un compte membre, indépendant du téléphone et unique dans l'association.
- [x] 2.2 [T-200] Garantir la gestion des collisions en service et au niveau de la contrainte SQL, sans changer l'identifiant lorsqu'un téléphone est modifié.
- [x] 2.3 [T-200] Étendre le contrat OpenAPI et le modèle `UserAccount` de détail pour exposer l'identifiant en lecture seule sans exposer de secret.
- [x] 2.4 [T-200] Préparer une migration de données ciblée des comptes existants vers leurs nouveaux identifiants, dans une transaction avec sauvegarde et procédure de rollback, sans supprimer ni recréer de compte.

## 3. Afficher et transmettre l'identifiant

- [x] 3.1 [T-200] Régénérer les modèles API frontend et adapter les fixtures aux réponses contenant l'identifiant de compte.
- [x] 3.2 [T-200] Afficher l'identifiant de connexion uniquement dans le détail utilisateur de la page Utilisateurs et rôles, sans l'ajouter aux listes ni aux pages membres.
- [x] 3.3 [T-200] Conserver et vérifier l'affichage de l'identifiant dans la confirmation de création, ajouter les traductions et ne jamais persister le mot de passe temporaire.

## 4. Valider la compatibilité

- [x] 4.1 [T-200] Ajouter les tests backend de génération, prénoms composés, accents, téléphone absent ou modifié, exposition du détail et chargement de la migration.
- [x] 4.2 [T-200] Ajouter les tests frontend du détail utilisateur, de la confirmation de création et de la séparation entre identifiant et téléphone, puis exécuter la compilation et les tests.
- [ ] 4.3 [T-200] Rejouer la migration sur une copie de base, vérifier les comptes, les mots de passe hashés, les rôles et les références historiques, puis documenter le rollback.

## 5. Livrer

- [x] 5.1 [T-200] Mettre à jour les artefacts OpenSpec et la documentation, exécuter les validations finales, pousser uniquement la branche du ticket et ouvrir une PR vers `develop` sans fusion automatique.
