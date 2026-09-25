## 1. Préparation du ticket

- [x] 1.1 [T-129] Vérifier le registre, résoudre T-129 et créer ou réutiliser `front/fix-129-details-campagnes-cagnottes` depuis `origin/main` avant toute modification applicative.
- [x] 1.2 [T-129] Relire le prototype `design/`, les règles frontend, les pages de détail existantes et les contrats API, puis figer les critères de parité et les dépendances sans modifier les services métier.

## 2. Primitives de détail partagées

- [x] 2.1 [T-129] Implémenter dans `shared/` le shell de détail projeté avec retour contextuel, hero, contenu d'action et largeur responsive, sans dépendance à une feature.
- [x] 2.2 [T-129] Implémenter la primitive de métriques du hero avec quatre cellules label, valeur et aide, y compris les variantes campagne et cagnotte.
- [x] 2.3 [T-129] Extraire la navigation d'onglets accessible avec relations ARIA, roving tabindex, activation au clic et navigation gauche/droite.
- [x] 2.4 [T-129] Harmoniser les actions projetées avec `app-action-button` et les états hover, focus-visible, désactivé, chargement, erreur et double activation.

## 3. Tableau et interactions réutilisables

- [x] 3.1 [T-129] Implémenter le conteneur `app-data-table` avec projection des en-têtes et cellules, surface bordée, séparateurs, hover et focus des lignes interactives.
- [x] 3.2 [T-129] Ajouter les états partagés chargement, erreur, vide et `aria-busy`, en conservant la responsabilité des données et des autorisations dans chaque feature.
- [x] 3.3 [T-129] Ajouter la variante mobile ou le fallback de défilement horizontal pour les colonnes larges, sans perdre les valeurs ni l'accès clavier.
- [x] 3.4 [T-129] Ajouter ou adapter la pagination partagée avec bornes, libellé accessible, état pending et contrôles précédent/suivant cohérents avec le prototype.

## 4. Détail des cotisations

- [x] 4.1 [T-129] Migrer `CampaignDetailPage` vers le shell, les métriques et les actions du prototype, sans modifier les règles de clôture ni d'édition du barème.
- [x] 4.2 [T-129] Migrer la Situation des membres vers le tableau partagé, conserver la recherche et le filtre de statut, puis couvrir les résultats, erreurs et états vides.
- [x] 4.3 [T-129] Migrer Montants par catégorie vers le tableau partagé, conserver lecture, édition, validation, avertissement de montant non configuré et message d'information.
- [x] 4.4 [T-129] Migrer Règlements vers le tableau partagé, conserver l'enregistrement, les données métier, la pagination et les rafraîchissements après succès ou erreur.

## 5. Détail des cagnottes

- [x] 5.1 [T-129] Migrer `SocialFundDetailPage` vers le shell, les métriques et les actions du prototype, avec et sans objectif de collecte.
- [x] 5.2 [T-129] Migrer Contributions vers le tableau partagé avec membre, montant, mode de règlement et date, sans perdre la pagination ni les formatages existants ; conserver les données d'audit uniquement dans le contrat API pour une évolution ultérieure.
- [x] 5.3 [T-129] Créer le panneau Informations et conserver les actions de contribution et de clôture selon les rôles, le statut et l'autorisation opérateur.
- [x] 5.4 [T-129] Couvrir les parcours de la page cagnotte, les réponses tardives, les erreurs de page, les états vides et le rafraîchissement après contribution.

## 6. Validation et livraison

- [x] 6.1 [T-129] Ajouter les tests des primitives partagées pour le rendu, les rôles ARIA, le clavier, les états hover/focus, les états de chargement et la variante responsive.
- [x] 6.2 [T-129] Mettre à jour les tests des pages Campagnes et Cagnottes pour les quatre vues de campagne, les deux vues de cagnotte, les permissions, les clics et la pagination.
- [ ] 6.3 [T-129] Comparer les écrans aux quatre vues du prototype aux largeurs desktop et mobile, corriger les écarts visuels et documenter les vérifications réalisées.
- [x] 6.4 [T-129] Exécuter les tests frontend, le build, le lint, la validation API et les contrôles de tickets, puis préparer une PR ciblée vers `main` avec la documentation OpenSpec à jour.
