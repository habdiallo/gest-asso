## 1. Préparer le ticket T-188

- [x] 1.1 [T-188] Vérifier le ticket, les prérequis et la branche `front/fix-188-corriger-creation-campagne-categories` avant toute modification applicative.
- [x] 1.2 [T-188] Reproduire le payload fautif, lire le contrat et comparer la sérialisation de création avec le correctif déjà présent sur la mise à jour du barème.

## 2. Corriger la création de campagne

- [x] 2.1 [T-188] Convertir `categoryAmounts` en tableau JSON à la frontière d'appel de `createCampaign`, sans modifier le type généré ni le contrat OpenAPI.
- [x] 2.2 [T-188] Ajouter un test de régression vérifiant que le payload transmis produit un tableau après `JSON.stringify` et préserver les tests existants du formulaire.

## 3. Valider le parcours

- [x] 3.1 [T-188] Exécuter les tests ciblés de campagne, la suite frontend, le build et les contrôles pertinents du client API.
- [x] 3.2 [T-188] Vérifier que le diff ne modifie ni le backend, ni le contrat OpenAPI, ni les artefacts générés et que la recherche ne révèle pas de contournement global inutile.

## 4. Livrer

- [x] 4.1 [T-188] Mettre à jour les étapes réalisées et vérifier le ticket sur la branche dédiée.
- [ ] 4.2 [T-188] Créer le commit `fix(front): T-188 corriger la creation campagne categories`, pousser la branche et ouvrir une PR vers `develop`.
