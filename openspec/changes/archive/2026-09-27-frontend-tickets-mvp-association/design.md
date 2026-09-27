## Context

Le projet dispose de trois artefacts stables et d'un socle frontend Angular dans `contribo-front/` :

- `besoins/cahier-user-stories-mvp-association-v2.md` : règles de gestion (RG-*) et user stories (US-*), source de vérité fonctionnelle.
- `besoins/openapi.yaml` : contrat API REST (`/api/v1`) que le frontend doit consommer, organisé par tags (Authentification, Tableau de bord, Espace personnel, Membres, Catégories de revenu, Utilisateurs et rôles, Campagnes, Règlements, Cagnottes, Contributions).
- `design/` : prototype UX/UI statique (HTML/CSS/JS + jeton de design `DESIGN (5).md`) qui valide déjà les parcours par rôle, le responsive, les dialogues de formulaire, la recherche/filtres et le formatage GNF.

Ce change ne produit pas de code : il découpe le travail frontend en tickets exploitables par petites évolutions, en s'appuyant sur les 7 capacités définies dans `proposal.md` et détaillées dans `specs/`.

Le change `initialisation-front-features` complète le socle technique. Les décisions
ci-dessous sont mises à jour avec le choix actuel : Angular 21, architecture par
fonctionnalités, routage lazy, signals pour l'état local, RxJS pour les flux async.

## Goals / Non-Goals

**Goals:**
- Fournir un backlog de tickets frontend suffisamment fin (grain écran/composant/interaction) pour être livré incrémentalement, chaque ticket étant testable indépendamment.
- Garantir que chaque ticket référence explicitement les US/RG du cahier des charges et, quand pertinent, l'opération de `openapi.yaml` qu'il consomme.
- Séquencer les tickets selon les dépendances réelles (socle applicatif → référentiels → campagnes/cagnottes → espace membre) et selon la priorité MVP.
- Conserver des critères métier observables, avec une implémentation Angular par fonctionnalités conforme au socle et aux règles frontend.

**Non-Goals:**
- Réévaluer la stack Angular retenue ou imposer une architecture hexagonale frontend.
- Écrire du code, des composants ou des tests.
- Modifier le contrat API (`openapi.yaml`) ou le prototype visuel (`design/`).
- Couvrir les éléments listés en Annexe A du cahier des charges (paiement en ligne, intégration Mobile Money, notifications, reçus, etc.).

## Decisions

### 1. Un ticket = un écran, un composant transverse, ou une interaction/règle précise
Plutôt que des tickets "US-MEM-004 complet", chaque US est éclatée en plusieurs tickets plus petits (ex. formulaire de création, verrouillage des champs pour l'Opérateur, validation, intégration API, état vide/erreur). Cela correspond à la demande explicite de "petites évolutions" livrables séparément.
**Alternative écartée** : un ticket par User Story du cahier — rejeté car trop gros pour une livraison incrémentale, et parce que plusieurs US partagent des composants transverses (formulaire membre, tableau générique, badge de statut) qu'il vaut mieux ticketiser une seule fois.

### 2. Tickets organisés par capacité, avec un socle transverse en préalable
Les tickets sont regroupés par capacité (une section par fichier `specs/<capability>/spec.md`), et un socle `frontend-shell` (auth, navigation par rôle, layout responsive, formatage GNF, modes de règlement) est traité en premier car toutes les autres capacités en dépendent (menus filtrés par rôle, formats de montant, restrictions Opérateur).
**Alternative écartée** : découper par écran technique (liste/formulaire/détail transverses à toutes les capacités) — rejeté car cela éloignerait les tickets des US/RG du cahier, rendant la traçabilité métier plus difficile.

### 3. Traçabilité systématique vers le cahier des charges et l'API
Chaque ticket de `tasks.md` référence les US/RG concernées et, si applicable, l'`operationId` de `openapi.yaml` mobilisé, afin qu'un développeur puisse valider un ticket sans redescendre dans tout le cahier des charges.
**Alternative écartée** : ne référencer que la capacité globale — rejeté car la granularité fine des tickets impose une traçabilité fine (ex. RG-MEM-018 concerne un seul ticket, pas toute la capacité membres).

### 4. Angular et architecture par fonctionnalités
La stack retenue est Angular 21 standalone/OnPush, TypeScript strict, Tailwind 4,
signals pour l'état local/dérivé et RxJS pour les flux asynchrones, sans store tiers.
Chaque feature regroupe ses routes, pages, composants, services/état et tests ;
les routes sont chargées paresseusement. `core/` porte les préoccupations globales,
`shared/` les éléments neutres réellement réutilisés. Les features ne s'importent
pas directement entre elles et le socle ne dépend pas des features. Les DTO/services
API se génèrent depuis `besoins/openapi.yaml`. Le frontend n'impose ni ports/adapters
ni couches hexagonales ; l'architecture hexagonale est réservée au backend.
Le prototype reste une référence visuelle et de parcours pour une implémentation Angular.

### 5. Priorisation MVP en 3 niveaux
Chaque ticket reçoit une priorité **P0** (socle indispensable pour qu'un rôle puisse travailler), **P1** (fonctionnalité cœur de métier du MVP) ou **P2** (confort/qualité : recherche, filtres, formatage avancé, états vides), afin de permettre un séquencement réaliste par petites évolutions.

## Risks / Trade-offs

- [Granularité très fine des tickets] → risque de dispersion et de perte de vue d'ensemble par écran → chaque section de `tasks.md` commence par un rappel du parcours utilisateur cible avant la liste de tickets.
- [Surarchitecture du frontend] → respecter les frontières features/core/shared et créer services/état/modèles seulement au besoin du ticket, sans couches hexagonales.
- [Dérive entre le prototype `design/` et les tickets] → le prototype peut évoluer indépendamment de ce backlog → chaque ticket renvoie aux US/RG (source de vérité stable) plutôt qu'à des éléments d'implémentation du prototype.

## Migration Plan

Sans objet : ce change ne modifie ni ne déploie de code, il produit uniquement des artefacts de planification (`proposal.md`, `specs/`, `design.md`, `tasks.md`).

## Open Questions

Aucune question de stack ou d'architecture frontend restante : Angular et
l'architecture par fonctionnalités sont retenus. Les choix de session/credentials,
les détails de chaque écran et l'hôte backend se précisent dans leurs tickets.
