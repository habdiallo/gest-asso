## Why

Le cahier des user stories (`besoins/cahier-user-stories-mvp-association-v2.md`) et le contrat API (`besoins/openapi.yaml`) sont stabilisés, et un prototype UX/UI existe déjà (`design/`). Il manque encore un découpage du frontend en tickets de développement suffisamment fins pour être livrés par petites évolutions indépendantes, testables et priorisables, plutôt que comme un bloc monolithique par écran.

## What Changes

- Définir les capacités frontend du MVP (une par domaine fonctionnel : socle applicatif, membres, catégories de revenu, rôles/utilisateurs, campagnes de cotisation, cagnottes, espace personnel membre).
- Rédiger pour chaque capacité les exigences frontend dérivées du cahier des charges (écrans, règles de gestion appliquées côté UI, restrictions par rôle, gestion des erreurs).
- Documenter dans `design.md` les choix transverses d'architecture frontend (structure de l'app, routage par rôle, gestion d'état, consommation de l'API `openapi.yaml`, formatage GNF, gestion des formulaires/dialogues).
- Produire dans `tasks.md` un backlog de tickets frontend très découpés (grain : un composant, un écran ou une interaction par ticket), classés par capacité et priorité MVP, chacun référençant les US/RG du cahier des charges.
- Aucune implémentation de code n'est faite dans ce change : c'est un travail de planification/rédaction de backlog.

## Capabilities

### New Capabilities
- `frontend-shell`: authentification, navigation par rôle, layout responsive (desktop/tablette/mobile), thèmes, structure applicative commune (US-ACC-001, §2, §3).
- `member-management-ui`: liste des membres, fiche membre, création, modification (champs structurants/non structurants), désactivation, réactivation (US-MEM-001 à US-MEM-006).
- `income-categories-ui`: création et modification des catégories de revenu (US-REV-001, US-REV-002).
- `roles-users-ui`: attribution des rôles applicatifs, gestion de l'attribut "Opérateur autorisé" (US-ROLE-001, §2.3).
- `campaigns-ui`: création de campagne, configuration des montants par catégorie, suivi des cotisations, enregistrement des règlements, paiements partiels, bilan financier, clôture (US-COT-001 à US-COT-008).
- `cagnottes-ui`: création de cagnotte, enregistrement des contributions, suivi, clôture (US-CAG-001 à US-CAG-004).
- `member-space-ui`: espace personnel du membre — profil, cotisations, contributions (US-MBR-001 à US-MBR-003).

### Modified Capabilities
- Aucune (aucune capacité existante dans `openspec/specs/` à ce jour).

## Impact

- **Code affecté** : frontend Angular dans `contribo-front/`, avec socle complété par `initialisation-front-features` ; écrans métier du MVP restant à construire.
- **Références** : `besoins/cahier-user-stories-mvp-association-v2.md` (règles de gestion et user stories), `besoins/openapi.yaml` (contrat API consommé par le frontend), `design/` (prototype UX/UI de référence pour les parcours et le visuel).
- **Dépendances** : aucune dépendance backend n'est modifiée ; ce change ne fait que planifier le frontend en s'appuyant sur le contrat API existant.
- **Hors périmètre** : tout ce qui est listé en Annexe A du cahier des charges (paiement en ligne, intégration Mobile Money, permissions granulaires, notifications, reçus, suppression définitive, rôle "Président", correction/annulation de règlement, provisioning automatique des identifiants).
