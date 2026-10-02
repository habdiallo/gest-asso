## Context

Le commit T-186 présent dans `develop` a retiré les fichiers runtime MSW, les comptes de démonstration, la configuration Angular mock et les handlers par feature. Une vérification de `develop` montre cependant un paquet `msw` encore verrouillé, une exclusion de worker dans `.prettierignore` et plusieurs specs publiées qui décrivent le dispositif supprimé.

Le ticket T-189 complète cette suppression. Il ne doit pas supprimer les mocks de tests unitaires, les spies, `HttpTestingController`, `provideHttpClientTesting` ou `MockMvc`, qui sont des outils de vérification isolée et non des données applicatives de démonstration.

## Goals / Non-Goals

**Goals:**

- Faire disparaître les résidus de runtime mock des dépendances et de la documentation publiée.
- Garder `npm start`, `npm run build` et le proxy `/api/**` orientés vers le backend réel.
- Rendre les specs OpenSpec cohérentes avec l'état livré.
- Conserver les doubles de test légitimes et les tests de contrat.

**Non-Goals:**

- Ne pas modifier les endpoints métier, les entités ou la base de données. Le déplacement physique du contrat vers les ressources du backend est inclus. Le contrat d'authentification peut préciser l'en-tête CSRF de réponse nécessaire au frontend réel.
- Ne pas supprimer les tests unitaires qui utilisent des réponses ou services simulés localement.
- Ne pas ajouter un nouveau serveur de fixtures ou une alternative MSW.

## Decisions

- Vérifier le lockfile avec `package.json`. Le paquet `msw` ne doit pas être une dépendance directe ; une peerDependency optionnelle portée par Vitest peut rester sans installer de runtime mock.
- Retirer uniquement les références de runtime et les specs devenues fausses. Les archives historiques et les tickets déjà livrés restent conservés comme traçabilité.
- Mettre à jour les specs publiées par deltas OpenSpec, puis vérifier que les exigences restantes parlent du backend réel et des tests isolés.
- Traiter un `401` reçu sur une requête métier comme une session expirée, effacer l'état local et rediriger vers `/login`. Un `403` reste une réponse métier ou de rôle et ne déconnecte pas l'utilisateur.
- Maintenir les mutations protégées par CSRF. Le frontend utilise le cookie ou l'en-tête CSRF de réponse, et le backend accepte le marqueur navigateur `Sec-Fetch-Site: same-origin` pour les requêtes réellement émises par l'application. Les requêtes cross-site ou sans marqueur restent soumises au token CSRF.
- Utiliser `contribo-back/src/main/resources/contribo-api.yml` comme chemin canonique. Maven, `openapitools.json`, le script de génération Angular, les Dockerfiles et la découverte QA doivent tous pointer vers ce fichier.
- Traiter `targetAmount` et `progressRate` comme des champs optionnels à la frontière de la feature Cagnottes. Le backend peut les omettre ou les sérialiser à `null` lorsqu'une cagnotte n'a pas d'objectif. Le template doit donc appliquer un garde nullish avant tout formatage, conserver le titre, l'événement, le bénéficiaire, les dates, le statut et le montant collecté, puis ne rendre ni comparatif ni jauge sans objectif. Le calcul de jauge des campagnes reste inchangé.
- Valider par recherche ciblée, tests frontend, build, documentation et contrôle OpenSpec. Les références génériques au mot `mock` dans les outils de test ne sont pas considérées comme des résidus runtime.

## Risks / Trade-offs

- [Risque] Un utilisateur tente encore une commande mock documentée dans un ancien artefact. -> Les specs publiées et la documentation indiquent le backend réel et les archives sont explicitement historiques.
- [Risque] Une suppression trop large casse les tests unitaires. -> Les fichiers de test et les outils `HttpTestingController`, spies et `MockMvc` sont conservés et validés.
- [Risque] Le lockfile évolue avec la version npm locale. -> Utiliser la version déclarée du projet, inspecter le diff et exécuter les contrôles npm avant de valider.

## Migration Plan

1. Retirer les résidus de dépendance et de formatage.
2. Mettre à jour les specs publiées et la documentation de référence.
3. Vérifier l'absence d'activation runtime mock et compiler le frontend réel.
4. En cas de rollback, rétablir le commit T-189 puis relancer `npm ci`; aucune donnée backend n'est concernée.

## Open Questions

Aucune question bloquante.
