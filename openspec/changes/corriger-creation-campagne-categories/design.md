## Context

Le générateur Angular produit `CreateCampaignRequest.categoryAmounts` comme un `Set` parce que le contrat OpenAPI déclare `uniqueItems: true`. Le formulaire de création construit correctement ce type en mémoire, mais la page transmet ensuite la requête typée directement au client HTTP. Lors de la sérialisation JSON, `JSON.stringify(new Set(...))` produit `{}` au lieu d'un tableau, ce qui provoque une erreur `VALIDATION_ERROR` du backend.

Le parcours de modification du barème possède déjà un contournement local : il construit un tableau puis le transtypage vers le type généré uniquement au dernier moment. La création doit appliquer la même règle à la frontière d'appel du service.

## Goals / Non-Goals

**Goals:**

- Envoyer `categoryAmounts` comme un tableau JSON lors de `POST /api/v1/campaigns`.
- Conserver le `Set` du contrat généré dans le formulaire et ne pas modifier les artefacts générés.
- Ajouter une régression vérifiant la forme sérialisée du corps transmis au service.
- Garder le contrat API, le backend et les autres parcours de campagne inchangés.

**Non-Goals:**

- Modifier `contribo-back/src/main/resources/contribo-api.yml` ou désactiver `uniqueItems`.
- Modifier la validation métier des montants ou la sélection des membres.
- Ajouter un adaptateur frontend global pour un seul payload.
- Corriger les autres anomalies révélées par les tests manuels.

## Decisions

1. **Convertir au point d'appel de la création.** `CampaignsListPage.handleCreateCampaign` construira un payload de création dont `categoryAmounts` est un tableau, puis le transtypage local sera limité à la propriété attendue par le client généré. Cette frontière protège aussi les soumissions initiales et les nouvelles tentatives.
2. **Réutiliser la stratégie du détail de campagne.** Le commentaire expliquant le piège du `Set` sera conservé ou adapté près du nouveau code pour rendre la contrainte explicite. Une conversion dans le formulaire seul ne suffirait pas, car ce composant émet le type généré et la page reste responsable de l'appel HTTP.
3. **Tester le corps sérialisé, pas seulement l'objet TypeScript.** Le test de la page vérifiera que `JSON.stringify` du payload transmis contient un tableau `categoryAmounts`. Le test existant du formulaire reste utile pour vérifier la construction métier et ne sera pas supprimé.

Alternatives écartées : modifier le contrat OpenAPI pour supprimer `uniqueItems`, modifier le code généré, ou convertir tous les `Set` dans un intercepteur HTTP global. Ces options élargiraient le périmètre et pourraient affecter d'autres endpoints.

## Risks / Trade-offs

- **[Risque]** Un transtypage local peut masquer une divergence future du contrat. → Le tableau est construit à partir du type d'entrée métier et un test de sérialisation documente la forme attendue.
- **[Risque]** Le test unitaire peut encore ne pas reproduire Angular `HttpClient` intégralement. → L'assertion appelle explicitement `JSON.stringify` sur le payload transmis au service et la validation manuelle avec le backend réel reste recommandée.
- **[Trade-off]** Le type généré reste un `Set` alors que le transport JSON utilise un tableau. → Cette différence est imposée par la génération actuelle et reste confinée à la frontière HTTP, comme pour la mise à jour du barème.

## Migration Plan

1. Modifier la préparation du payload dans la page de création et ajouter le test de régression.
2. Exécuter les tests ciblés, la suite frontend et le build.
3. Vérifier le ticket, pousser la branche et ouvrir la PR vers `develop`.
4. Aucun script de migration, changement de base ou modification de déploiement n'est nécessaire. Le rollback consiste à rétablir le commit du frontend.

## Open Questions

Aucune question bloquante.
