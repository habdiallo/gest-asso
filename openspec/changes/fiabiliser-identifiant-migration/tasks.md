## 1. Frontend, erreur de lecture du détail utilisateur

- [ ] 1.1 [T-204] Résoudre T-204, confirmer `fullstack/fix-204-fiabiliser-identifiant-migration` et exécuter `node scripts/tickets.mjs verify T-204` avant le code.
- [ ] 1.2 [T-204] Ajouter l'état d'erreur et le callback d'échec de `getUser` sans modifier les brouillons de rôle ou d'autorisation.
- [ ] 1.3 [T-204] Afficher le message traduit, masquer l'identifiant absent et proposer une nouvelle tentative dans le dialogue.
- [ ] 1.4 [T-204] Ajouter les tests de succès, d'erreur, de nouvelle tentative et de conservation des brouillons après une réponse asynchrone.

## 2. Backend et base, normalisation indépendante de la locale

- [ ] 2.1 [T-204] Définir la migration Flyway corrective après V4 et la table d'audit T-204 sans modifier la correspondance historique T-200.
- [ ] 2.2 [T-204] Implémenter la translittération explicite des caractères ASCII et accentués, sans dépendre de `lower()` pour les majuscules accentuées.
- [ ] 2.3 [T-204] Corriger uniquement les comptes inventoriés par T-200 en conservant le suffixe, les données du compte et l'unicité par association.
- [ ] 2.4 [T-204] Faire échouer la migration de façon atomique et explicite en cas d'identifiant source non conforme ou de collision.

## 3. Contrôles et documentation de migration

- [ ] 3.1 [T-204] Ajouter les tests PostgreSQL avec locale C, noms accentués en majuscules, prénoms composés, ligne déjà conforme et collision.
- [ ] 3.2 [T-204] Documenter la vérification de la table d'audit, la conservation du suffixe et la procédure de retour arrière contrôlé.

## 4. Livraison

- [ ] 4.1 [T-204] Exécuter les tests frontend et backend pertinents, puis vérifier le build et les migrations sur une base PostgreSQL de test.
- [ ] 4.2 [T-204] Mettre à jour les cases réalisées et préparer une PR fullstack vers `develop` avec les limites et preuves de validation.
