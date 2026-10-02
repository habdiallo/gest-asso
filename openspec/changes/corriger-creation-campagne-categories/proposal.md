## Why

La création d'une campagne échoue toujours avec une erreur `VALIDATION_ERROR` lorsque le frontend envoie `categoryAmounts` sous forme de `Set`. `JSON.stringify` transforme ce `Set` en objet vide, alors que le backend attend un tableau JSON conforme au contrat OpenAPI.

Le correctif est nécessaire maintenant car le parcours US-COT-001 est bloqué sur `develop`, malgré des tests unitaires frontend qui ne vérifient pas la sérialisation HTTP réelle.

## What Changes

- Corriger la préparation de la requête de création de campagne pour convertir explicitement les montants par catégorie en tableau JSON avant l'appel HTTP.
- Ajouter un test frontend qui vérifie la forme sérialisable du payload transmis par le parcours de création.
- Conserver le contrat OpenAPI, le backend et le type généré inchangés.
- Documenter dans le change la limite des tests unitaires qui comparent les objets en mémoire sans sérialiser le corps HTTP.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `campaigns-ui` : garantir que la création d'une campagne envoie `categoryAmounts` comme un tableau JSON accepté par l'API réelle.

## Impact

- Frontend Angular : composant de création de campagne, page de liste et tests associés dans `contribo-front/src/app/features/campaigns/`.
- API : aucun changement de contrat, d'endpoint ou de modèle généré.
- Backend et base de données : aucun changement.
- Validation : tests unitaires ciblés, test de sérialisation JSON du payload, build frontend et vérification du ticket T-188.
