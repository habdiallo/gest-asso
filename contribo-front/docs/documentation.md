# Documentation frontend

## Sources de vérité

La documentation frontend décrit les capacités visibles par l'utilisateur et les
contrats techniques nécessaires à leur fonctionnement. Les règles métier durables
restent dans le [cahier métier](../../besoins/cahier-user-stories-mvp-association-v2.md)
et les décisions sont tracées dans les spécifications OpenSpec. Le contrat HTTP
partagé est [contribo-api.yml](../../contribo-back/src/main/resources/contribo-api.yml). Le README du
frontend décrit l'architecture et les commandes de développement.

Le cahier métier définit les parcours, les acteurs et les invariants. OpenAPI
définit les échanges nécessaires entre clients et serveur, notamment les chemins,
les schémas, les erreurs et les autorisations exposées par l'API. La documentation
frontend ne recopie pas ces règles sous une forme concurrente : elle renvoie vers
le cahier ou le contrat selon le sujet.

Une évolution commence par la clarification du besoin. Si elle modifie une
interface HTTP, le contrat est ensuite mis à jour et validé avant la génération
du client. Une divergence entre le cahier et le contrat doit être arbitrée dans
une spec OpenSpec, pas résolue par une modification locale du client généré.

## Règles de rédaction

- Décrire un comportement, une donnée ou une responsabilité, pas l'historique de
  son implémentation.
- Utiliser les noms de fonctionnalités, d'écrans, de services et d'opérations API
  comme références stables.
- Garder les identifiants de travaux dans OpenSpec et dans les tests de traçabilité,
  pas dans les documents de référence destinés aux mainteneurs frontend.
- Mettre à jour cette documentation ou le README quand une frontière
  d'architecture change.

## Organisation

Les pages et composants décrivent leur responsabilité locale. Les règles
transverses sont documentées dans `core/` ou `shared/` selon leur portée. Une
feature ne documente pas les détails d'une autre feature : elle renvoie vers son
contrat ou vers le composant partagé concerné.

## Vérification

`npm run test:documentation` contrôle le README et les documents Markdown de ce
dossier. Les tests fonctionnels conservent leur traçabilité séparément, sans faire
de ces identifiants le vocabulaire de la documentation d'architecture.

Pour une évolution du contrat, suivre la procédure et les liens de
[besoins/README.md](../../besoins/README.md), puis exécuter `npm run validate:api`
et `npm run generate:api` depuis `contribo-front/` lorsque la génération est
nécessaire.
