# Matrice finale de couverture de l audit architecture

Référence vérifiée le 30 septembre 2026 sur `origin/develop`. Chaque constat
est rattaché à au moins un ticket local et à une spécification ou une décision
documentée. Les preuves de livraison sont les PR réellement fusionnées dans
`develop`, jamais des issues GitHub déduites des numéros de tickets locaux.

| # | Constat | Ticket, spécification et preuve | Statut | Décision ou risque résiduel |
|---:|---|---|---|---|
| 1 | Couche domain backend vide | T-167 ([spec](../formaliser-couche-domaine-backend/specs/backend-architecture-foundation/spec.md), [PR 173](https://github.com/habdiallo/gest-asso/pull/173)); T-171 ([spec](../introduire-modele-domaine-backend/specs/backend-domain-model/spec.md), [PR 178](https://github.com/habdiallo/gest-asso/pull/178)) | Couvert, PR fusionnées | La frontière domaine est documentée et utilisée. Le risque restant est la dérive des mappings lors de futures évolutions métier. |
| 2 | Couplage backend aux DTO OpenAPI | T-171 ([spec](../introduire-modele-domaine-backend/specs/backend-domain-model/spec.md), [PR 178](https://github.com/habdiallo/gest-asso/pull/178)) | Couvert, PR fusionnée | Les conversions restent nécessaires à la frontière API. Toute nouvelle ressource doit conserver cette séparation. |
| 3 | Couplage frontend au client OpenAPI | T-172 ([spec](../isoler-client-api-frontend/specs/frontend-api-boundary/spec.md), [PR 186](https://github.com/habdiallo/gest-asso/pull/186)) | Couvert, PR fusionnée | La façade par feature est la décision retenue. Une régénération API doit continuer à passer par cette frontière. |
| 4 | Autorisations backend divergentes | T-169 ([spec](../unifier-autorisation-backend/specs/backend-authorization-consistency/spec.md), [PR 174](https://github.com/habdiallo/gest-asso/pull/174)) | Couvert, PR fusionnée | `AuthorizationService` et `UserRole` sont la référence. Le risque résiduel concerne l ajout de nouveaux rôles sans tests associés. |
| 5 | `JdbcCampaignRepository` multi-responsabilités | T-173 ([spec](../decomposer-repository-campagnes/specs/campaign-persistence-boundaries/spec.md), [PR 184](https://github.com/habdiallo/gest-asso/pull/184)) | Couvert, PR fusionnée | Les responsabilités sont séparées. Les frontières transactionnelles devront rester explicites pour les nouveaux cas métier. |
| 6 | Tests H2 au lieu de PostgreSQL | T-165 ([spec](../tests-backend-postgresql-reel/specs/backend-integration-test-database/spec.md), [PR 172](https://github.com/habdiallo/gest-asso/pull/172)) | Couvert, PR fusionnée | PostgreSQL réel est utilisé pour l intégration. Les validations dépendent encore de la disponibilité du runtime Docker. |
| 7 | Versions OpenAPI différentes | T-164 ([spec](../verrouiller-version-generateur-openapi/specs/openapi-generator-version-governance/spec.md), [PR 177](https://github.com/habdiallo/gest-asso/pull/177)) | Couvert, PR fusionnée | Le contrôle de version commun est automatisé. Toute montée de version doit rester atomique front et back. |
| 8 | Noms générés tronqués avec accents | T-166 ([spec](../corriger-encodage-noms-fichiers-generes/specs/api-design-first-governance/spec.md), [PR 179](https://github.com/habdiallo/gest-asso/pull/179)); dépendance T-164 ([PR 177](https://github.com/habdiallo/gest-asso/pull/177)) | Couvert, PR fusionnées | Les tags générateurs sont ASCII et les clients ont été régénérés. Les consommateurs externes doivent rester compatibles avec les noms stabilisés. |
| 9 | Dépôts Portainer divergents | T-170 ([spec](../synchroniser-deploiement-portainer/specs/deployment-repo-parity/spec.md), [PR 176](https://github.com/habdiallo/gest-asso/pull/176)) | Couvert, PR fusionnée | La parité est contrôlée par CI. Le secret de lecture du dépôt miroir reste une précondition d exécution. |
| 10 | Healthcheck production incorrect | T-170 ([spec](../synchroniser-deploiement-portainer/specs/deployment-repo-parity/spec.md), [PR 176](https://github.com/habdiallo/gest-asso/pull/176)); T-168 ([spec](../harmoniser-configuration-deploiement-dupliquee/specs/deployment-configuration-governance/spec.md), [PR 185](https://github.com/habdiallo/gest-asso/pull/185)) | Couvert, PR fusionnées | Les healthchecks sont alignés et contrôlés. Un contrôle runtime après déploiement reste nécessaire. |
| 11 | Bootstrap admin absent | T-170 ([spec](../synchroniser-deploiement-portainer/specs/deployment-repo-parity/spec.md), [PR 176](https://github.com/habdiallo/gest-asso/pull/176)) | Couvert, PR fusionnée | Le bootstrap est documenté et désactivé après la première initialisation. Les secrets et l état de la base restent hors du dépôt. |
| 12 | Absence de synchronisation des dépôts | T-170 ([spec](../synchroniser-deploiement-portainer/specs/deployment-repo-parity/spec.md), [PR 176](https://github.com/habdiallo/gest-asso/pull/176)) | Couvert, PR fusionnée | Le workflow de parité bloque les divergences. Une modification doit toujours être livrée dans les deux dépôts. |
| 13 | Source de vérité production ambiguë | T-170 ([spec](../synchroniser-deploiement-portainer/specs/deployment-repo-parity/spec.md), [PR 176](https://github.com/habdiallo/gest-asso/pull/176)) | Couvert, PR fusionnée | `gest-asso-deploiement`, branche `main`, est la source consommée par Portainer. Le miroir applicatif et son contrôle CI ne doivent pas être confondus avec cette source. |
| 14 | Variables Compose incohérentes | T-168 ([spec](../harmoniser-configuration-deploiement-dupliquee/specs/deployment-configuration-governance/spec.md), [PR 185](https://github.com/habdiallo/gest-asso/pull/185)); T-170 ([PR 176](https://github.com/habdiallo/gest-asso/pull/176)) | Couvert, PR fusionnées | Les variables communes sont harmonisées. Les chemins de secrets peuvent rester spécifiques à l environnement et doivent être vérifiés au déploiement. |
| 15 | Duplication Nginx | T-168 ([spec](../harmoniser-configuration-deploiement-dupliquee/specs/deployment-configuration-governance/spec.md), [PR 185](https://github.com/habdiallo/gest-asso/pull/185)); T-170 ([PR 176](https://github.com/habdiallo/gest-asso/pull/176)) | Couvert, PR fusionnées | Les includes communs sont la source interne. Les différences TLS, HSTS et redirection restent volontairement spécifiques à la production. |
| 16 | Healthchecks dupliqués | T-168 ([spec](../harmoniser-configuration-deploiement-dupliquee/specs/deployment-configuration-governance/spec.md), [PR 185](https://github.com/habdiallo/gest-asso/pull/185)); T-170 ([PR 176](https://github.com/habdiallo/gest-asso/pull/176)) | Couvert, PR fusionnées | La duplication interne est supprimée. Le dépôt miroir reste couvert par le contrôle de parité externe. |
| 17 | `besoins` mélange fonctionnel et technique | T-174 ([spec](../separer-contrat-openapi-documentation/specs/contract-documentation-boundary/spec.md), [PR 180](https://github.com/habdiallo/gest-asso/pull/180)) | Couvert, PR fusionnée | Les besoins et le contrat OpenAPI ont des rôles distincts. Les liens entre eux doivent être maintenus explicitement dans les futures évolutions. |
| 18 | Documentation frontend liée aux tickets | T-175 ([spec](../decoupler-doc-frontend-tickets/specs/frontend-documentation-governance/spec.md), [PR 175](https://github.com/habdiallo/gest-asso/pull/175)) | Couvert, PR fusionnée | La documentation stable décrit les concepts et non l historique des tickets. Les liens de traçabilité restent dans OpenSpec. |
| 19 | Absence de state management global | T-176 ([spec](../definir-strategie-etat-frontend/specs/frontend-state-governance/spec.md), [PR 188](https://github.com/habdiallo/gest-asso/pull/188)) | Couvert, PR fusionnée | Aucun store global n est introduit sans besoin démontré. La stratégie devra être réévaluée si un état partagé complexe apparaît. |
| 20 | Dépendance Java du build frontend | T-177 ([spec](../rationaliser-generation-api-frontend/specs/frontend-api-generation-toolchain/spec.md), [PR 182](https://github.com/habdiallo/gest-asso/pull/182)) | Couvert, PR fusionnée | La génération est isolée dans une chaîne explicite. Java reste requis pour la génération et doit être documenté dans les environnements CI. |
| 21 | Traçabilité OpenSpec front et back déséquilibrée | T-178 ([spec](../equilibrer-tracabilite-openspec-front-back/specs/openspec-traceability-governance/spec.md), [PR 187](https://github.com/habdiallo/gest-asso/pull/187)) | Couvert, PR fusionnée | La matrice de traçabilité couvre les deux côtés. Le risque résiduel est l oubli d une mise à jour lors d un nouveau change. |
| 22 | Nom `besoins` ambigu | T-174 ([spec](../separer-contrat-openapi-documentation/specs/contract-documentation-boundary/spec.md), [PR 180](https://github.com/habdiallo/gest-asso/pull/180)); T-178 ([PR 187](https://github.com/habdiallo/gest-asso/pull/187)) | Couvert, PR fusionnées | Le nom historique est conservé pour compatibilité et clarifié par la documentation. Un renommage physique reste hors périmètre de T-179. |

## Décisions de non-traitement et risques résiduels

- Aucun ticket GitHub fictif n est créé. Les identifiants `T-164` à `T-179` sont
  des tickets locaux et les liens de livraison ci-dessus pointent uniquement
  vers les PR GitHub effectivement fusionnées.
- Aucun point de l audit n est sans attribution. Les points qui concernent une
  même cause partagent volontairement leurs tickets et leurs preuves, sans
  créer de ticket supplémentaire.
- Le renommage physique du dossier `besoins`, l introduction d un store global
  frontend et l uniformisation des différences TLS de production restent hors
  périmètre. Ils sont documentés comme décisions ou conditions de réévaluation,
  pas comme défauts non traités.
- Les PR de T-168, T-173, T-176 et T-178 sont fusionnées dans `develop`, mais
  certaines cases administratives de leurs fichiers OpenSpec restent ouvertes
  dans le registre local. T-179 ne les coche pas et ne prétend pas clôturer ces
  tâches. Cette incohérence de traçabilité doit être résolue séparément avant
  de considérer le registre local entièrement soldé.

## Contrôle de couverture

La couverture est complète sur le périmètre de l audit : 22 constats sur 22
sont attribués, reliés à une spec ou une décision, et associés à une preuve de
livraison fusionnée. Le contrôle local `node scripts/tickets.mjs verify T-179`
reste en échec tant que les cases administratives des quatre tickets cités
ci-dessus ne sont pas clôturées.
