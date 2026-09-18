## Context

La proposition corrige la régression T-68. OpenAPI Generator 7.25.0 représente `uniqueItems: true` par un Set, tandis que `request.json()` renvoie un tableau JSON. Le garde du mock valide un tableau mais annonce le DTO généré avec Set. `tsconfig.app.json` exclut les mocks du build standard ; la configuration mock les importe via `main.mock.ts`.

## Goals / Non-Goals

**Goals:** restaurer le démarrage mock, tester les réponses du handler et compiler les deux configurations dans une CI reproductible.

**Non-Goals:** modifier le contrat OpenAPI, la sérialisation du client, les règles métier du barème ou les autres tickets.

## Decisions

- Dériver le type JSON validé du DTO généré avec `Omit` et réutiliser le type généré `CampaignCategoryAmountInput` pour les entrées. Seule la représentation de la collection devient un tableau à la frontière JSON. Réutiliser ce type pour le garde des entrées. Une assertion vers le DTO masquerait l'erreur ; modifier `uniqueItems` altérerait le contrat.
- Tester le handler via MSW en environnement de test, avec une vraie requête JSON, pour vérifier succès, corps invalide et refus d'accès. La compilation mock vérifie en plus tous les imports exclus du build standard.
- Ajouter un workflow PR avec Node 24 et Java 21, installation npm reproductible, validation/génération API puis builds production et mock. Exécuter les deux builds séparément permet de repérer les erreurs propres à chaque configuration. Déclarer un script `build:mock` et documenter son usage.

## Risks / Trade-offs

- Disponibilité npm et du JAR du générateur : la CI peut échouer au téléchargement ; rapporter cet échec sans ignorer la validation.
- Le workflow ajoute un contrôle GitHub, mais son caractère obligatoire dépend des protections configurées par le mainteneur.

## Migration Plan

T-113 est livré dans une seule PR après T-68 (PR 64, commit 295a04d présent dans l'ascendance). Vérifier registre, artefacts, tests du handler, builds et démarrage HTTP avant publication. Aucune migration. Un retour arrière se fait par une PR de revert et réintroduirait la régression mock.

## Open Questions

Aucune question bloquante.
