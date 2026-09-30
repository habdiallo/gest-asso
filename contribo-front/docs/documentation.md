# Documentation frontend

## Source de vérité

La documentation frontend décrit les capacités visibles par l'utilisateur et les
contrats techniques nécessaires à leur fonctionnement. Les règles métier durables
restent dans `besoins/` et les spécifications OpenSpec. Le README du frontend
décrit l'architecture et les commandes de développement.

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
