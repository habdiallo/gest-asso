## Context

Le prototype `design/app.js` et `design/styles.css` définissent un même langage pour les détails de campagne et de cagnotte : retour contextuel, carte hero sombre avec actions à droite, quatre métriques, onglets soulignés en doré et panneaux de données à largeur complète. Les détails Angular actuels chargent correctement les ressources et appliquent déjà les autorisations, mais leur structure visuelle est différente et plusieurs tableaux construisent directement leurs éléments HTML.

Le périmètre est le frontend Angular dans `contribo-front/`. Les pages restent propriétaires de leur état métier et de leurs appels API. Les nouveaux composants de présentation iront dans `shared/` et ne dépendront d'aucune feature. Les composants spécifiques aux campagnes restent dans `features/campaigns/`, ceux des cagnottes dans `features/social-funds/`.

## Goals / Non-Goals

**Goals:**

- Reproduire le shell de détail du prototype sur `/campagnes/:campaignId` et `/cagnottes/:socialFundId`.
- Mutualiser la carte hero, les métriques, les onglets accessibles, la barre d'outils de tableau et le conteneur de tableau.
- Conserver les appels API, la pagination, les états de chargement, les erreurs et les règles d'autorisation existants.
- Offrir des états cohérents pour hover, focus-visible, actif, désactivé, chargement et clic.
- Fournir un rendu desktop fidèle et une variante mobile lisible lorsque les colonnes ne tiennent plus.
- Couvrir les composants partagés et les parcours des deux pages par des tests Angular ciblés.

**Non-Goals:**

- Modifier le modèle métier, les rôles ou les autorisations serveur.
- Ajouter des endpoints, une migration backend ou un nouveau package.
- Remplacer les formulaires existants de règlement, contribution, clôture ou modification du barème.
- Le ticket ne migre pas tous les tableaux vers `app-data-table`. En revanche, tout tableau visible concerné par les écrans livrés doit afficher au plus 10 éléments par page. Les vues alimentées par une API utilisent le paramètre `size=10`, tandis que les collections sans métadonnées de page utilisent une pagination locale. Le bloc de navigation n'est rendu que lorsque plusieurs pages existent.

## Decisions

### 1. Créer un shell de détail partagé, piloté par projection

Un composant neutre de type `app-detail-shell` portera la largeur maximale, le retour vers la liste, la carte hero, les actions projetées et la zone d'onglets. Les pages fourniront le contenu via projection et conserveront leurs textes Transloco, leurs signaux et leurs permissions.

Le composant recevra uniquement des données de présentation stables, par exemple le kicker, le titre, l'introduction et les métriques. Il ne connaîtra ni `Campaign`, ni `SocialFund`, ni les services API. Cette séparation permet de partager la forme sans créer de dépendance entre features.

Alternative écartée : copier le markup de la page Campagnes dans la page Cagnottes. Cette solution serait rapide mais reproduirait les divergences déjà visibles et rendrait chaque correction de focus ou de responsive coûteuse.

### 2. Utiliser des primitives partagées pour les métriques et les onglets

`app-detail-metrics` rendra une collection ordonnée de cellules label, valeur et aide. `app-detail-tabs` gérera le rôle `tablist`, les attributs ARIA, le clavier gauche/droite, le roving tabindex et l'état actif. La sélection restera pilotée par la page afin de conserver les états d'onglet propres à chaque domaine.

Les actions resteront basées sur `app-action-button`. Le shell placera les actions dans la zone hero, avec un bouton doré primaire et une action secondaire bordée selon les droits. Les boutons désactivés ou en chargement ne déclencheront aucune double soumission et exposeront leur état à l'accessibilité.

Alternative écartée : gérer les onglets avec des liens de navigation distincts. Le prototype décrit un changement de panneau local et les pages ont déjà une navigation clavier de type ARIA tab, qui sera consolidée plutôt que remplacée.

### 3. Factoriser la structure visuelle des tableaux, pas leur état métier

`app-data-table` fournira le panneau, l'en-tête, les séparateurs, le survol de ligne, le focus de ligne lorsque celle-ci est interactive et le conteneur responsive. Les colonnes et les cellules resteront projetées ou décrites par la feature, pour supporter les variations suivantes : membres/cotisations, catégories/barème, règlements et contributions.

Une variante mobile permettra à chaque feature de fournir une carte condensée lorsque la table desktop devient trop large. Le composant ne triera pas, ne paginera pas et ne chargera pas les données. La page continuera de demander la page API et passera au composant un état de chargement, vide ou erreur.

La pagination visuelle sera fournie par une primitive partagée avec des boutons `app-action-button` ou un contrat équivalent. Elle conservera la page courante, les bornes, `aria-disabled`, le focus visible et l'état pending pendant un changement de page.

Toutes les tables paginées suivent la même règle de capacité : 10 éléments maximum par page, contrôles précédent et suivant, et libellé de la page courante sur le nombre total de pages. Pour une collection de 10 éléments ou moins, aucun bloc de pagination n'est affiché.

Alternative écartée : un composant de table générique qui prendrait un service et un modèle API. Cela mélangerait présentation et métier, limiterait la projection des cellules et violerait les frontières `shared`/`features`.

### 4. Aligner le contenu sur les quatre vues du prototype

La page Campagnes conservera ses trois onglets, renommés et structurés comme le prototype : Situation des membres, Montants par catégorie et Règlements. La Situation réutilisera le tableau de cotisations existant, le barème réutilisera le tableau d'édition et de lecture, et les règlements utiliseront le même rendu métier que les contributions.

La page Cagnottes conservera ses deux onglets : Contributions et Informations. Le premier utilisera le tableau partagé avec membre, montant, mode de règlement et date. Le second regroupera la description, le type d'événement, le bénéficiaire, la période et l'objectif sans perdre la progression existante.

### 6. Réduire les colonnes de journalisation dans le MVP

Les tableaux de règlements et de contributions affichent uniquement les données utiles au suivi métier : membre, montant, mode de règlement et date. Les colonnes `Enregistré par`, `Enregistré le` et `Horodatage` restent disponibles dans les contrats API, mais ne sont pas rendues dans ces listes tant que la fonctionnalité de journalisation détaillée n'est pas livrée.

La date de règlement ou de contribution est conservée, car elle décrit l'événement métier. Les tableaux de la fiche membre réutilisent la même règle et la même structure visuelle que les tableaux de détail.

### 5. Conserver les données et permissions existantes

Les pages continueront à consommer les services générés existants et les mocks MSW. Les actions seront projetées seulement lorsque les computed signals actuels les autorisent. Les réponses tardives, erreurs de changement de page et rafraîchissements après enregistrement conserveront les protections déjà présentes.

## Risks / Trade-offs

- [Risque] Une abstraction de tableau trop ambitieuse pourrait imposer le même modèle aux quatre usages. → Mitigation : limiter `shared` au cadre visuel et projeter les cellules ainsi que la variante mobile.
- [Risque] La projection Angular peut rendre le focus ou l'état busy moins explicite. → Mitigation : définir les rôles ARIA et les attributs au niveau du composant partagé, puis ajouter des tests DOM sur chaque état.
- [Risque] Le rendu mobile de tables larges peut diverger du desktop. → Mitigation : conserver une table scrollable accessible comme fallback et fournir une carte mobile dédiée seulement lorsque le prototype ou la lisibilité l'exigent.
- [Risque] Une action visible dans le hero et une action répétée dans l'onglet peuvent provoquer des doublons. → Mitigation : utiliser le même signal d'autorisation et le même état pending, avec une seule source d'ouverture du dialogue.

## Migration Plan

1. Réserver et résoudre T-129 sur `front/fix-129-details-campagnes-cagnottes` avant toute modification applicative.
2. Ajouter les primitives partagées et leurs tests sans modifier les services métier.
3. Migrer la page Campagnes, puis la page Cagnottes, en conservant les contrôles existants et leurs tests.
4. Vérifier le prototype aux largeurs desktop et mobile, les états hover/focus/clic, les erreurs et la pagination.
5. Exécuter les tests frontend, le build, le lint, la validation API et les contrôles de tickets avant de préparer une PR vers `main`.

Le retour arrière consiste à revertir la PR T-129. Les endpoints et les données n'étant pas modifiés, aucun rollback de migration n'est nécessaire.

## Open Questions

- Le tableau de détail doit-il rendre chaque ligne cliquable dans les vues de suivi, ou seulement les boutons d'action et les onglets ? La proposition retient des lignes non cliquables par défaut pour éviter d'inventer une navigation non présente dans le prototype.
- Les nouveaux composants de tableau devront-ils être réutilisés dans les écrans globaux Règlements et Contributions ? Ce ticket prépare la primitive, mais ne migre ces écrans que si le périmètre est confirmé pendant l'apply.
