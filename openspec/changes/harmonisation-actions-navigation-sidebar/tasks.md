Cette évolution correspond à un ticket front/fix unique, T-128. Les cases restent
décochées tant que l'implémentation et ses validations n'ont pas été réalisées.
La branche à résoudre est `front/fix-128-harmonisation-actions-navigation-sidebar`.
Le périmètre couvre le composant d'action partagé, les actions des menus concernés,
la navigation desktop et le pied de sidebar. Les validations visuelles utilisent
`design/index.html` et l'application locale à 1440 px puis 1024 px, dans les deux
thèmes.

## 1. Préparation du ticket et de la référence

- [x] 1.1 [T-128] Résoudre et vérifier T-128 avec `node scripts/tickets.mjs resolve T-128 --json` et `node scripts/tickets.mjs verify T-128`, puis utiliser la branche `front/fix-128-harmonisation-actions-navigation-sidebar`.
- [x] 1.2 [T-128] Inventorier les actions `.btn` des features dashboard, members, campaigns, social-funds, income-categories et roles-users, en distinguant les navigations qui doivent rester des liens des actions locales qui doivent rester des boutons.

## 2. Composant d'action partagé

- [x] 2.1 [T-128] Créer `contribo-front/src/app/shared/action-button/` comme composant Angular autonome avec variantes primaire, secondaire et dangereuse, icône décorative, focus visible, états disabled/loading et type HTML explicite.
- [x] 2.2 [T-128] Ajouter le mode lien Angular avec `RouterLink` et `queryParams`, afin que le rendu puisse être identique sans convertir une navigation en bouton.
- [x] 2.3 [T-128] Ajouter les tests du composant pour le nœud `<a>` ou `<button>`, le paramètre `creer=1`, les types `button` et `submit`, les états accessibles et l'activation au clavier.

## 3. Migration des actions métier

- [x] 3.1 [T-128] Migrer « Nouvelle campagne » du dashboard vers le composant partagé en mode lien, conserver `/campagnes?creer=1`, l'icône plus et le libellé existant.
- [x] 3.2 [T-128] Migrer les actions principales des listes Membres, Campagnes, Cagnottes, Catégories et Rôles et utilisateurs vers le composant partagé, sans modifier les droits, routes ou paramètres.
- [x] 3.3 [T-128] Migrer les actions des formulaires et détails concernés en conservant `type="button"` pour annuler ou déclencher une action locale et `type="submit"` pour valider, puis vérifier l'absence de double soumission.
- [x] 3.4 [T-128] Conserver les composants spécialisés des onglets, filtres, selects, pagination et liens textuels lorsqu'ils ne correspondent pas au contrat d'action `.btn`.
- [x] 3.5 [T-128] Aligner les en-têtes de toutes les pages métier sur le motif `.page-head` du prototype avec un composant partagé, le kicker, le titre, l'introduction et la largeur maximale de 1440 px.
- [x] 3.6 [T-128] Reproduire la liste Membres selon le prototype avec recherche iconifiée, filtres segmentés de statut, catégorie et pays, avatar, identité regroupée, statut visuel et accès au détail, en conservant les filtres métier et la pagination.

## 4. Navigation et sidebar

- [x] 4.1 [T-128] Mettre à jour le modèle `navigation-items.ts` et `navigation-menu` pour afficher à l'administrateur l'ordre et les libellés du prototype : Tableau de bord, Membres, Cotisations, Cagnottes, puis Administration avec Utilisateurs & rôles et Catégories.
- [x] 4.2 [T-128] Préserver les destinations et permissions des autres rôles, ne pas afficher Mon espace dans la navigation desktop administrateur si le prototype ne le présente pas, et conserver la route et les gardes existants.
- [x] 4.3 [T-128] Aligner la présentation du pied de sidebar sur le motif `.profile*` avec les données de session, tout en conservant les actions accessibles de thème et de déconnexion.
- [x] 4.4 [T-128] Adapter ou compléter les tests de navigation pour chaque rôle, l'état actif sur les sous-routes, le regroupement Administration et la séparation vertical/mobile.

## 5. Validation et livraison

- [x] 5.1 [T-128] Comparer le dashboard et la sidebar avec le prototype local à 1440 px et 1024 px, en thème sombre puis clair, et vérifier le clavier, le focus, le texte agrandi et le breakpoint mobile existant.
- [x] 5.2 [T-128] Exécuter `npm test -- --watch=false`, `npm run build` et `npm run lint` depuis `contribo-front/`, puis relire le diff pour confirmer qu'aucun contrat API ou fichier hors périmètre n'a changé.
- [x] 5.3 [T-128] Exécuter `node scripts/tickets.mjs check`, committer uniquement le périmètre T-128, pousser la branche dédiée et préparer une PR vers `main` avec les validations et captures avant/après, sans fusionner.
- [x] 5.4 [T-128] Comparer visuellement les en-têtes des pages Membres, Campagnes, Cagnottes, Catégories, Rôles et espace membre avec le prototype, puis vérifier les tests, le build, le lint et le formatage.
- [x] 5.5 [T-128] Comparer visuellement la liste Membres avec le prototype, puis vérifier les états recherche, filtres statut/catégorie/pays, chargement, erreur, absence de résultat, pagination, clavier et responsive.
- [x] 5.6 [T-128] Reproduire visuellement la liste Campagnes du prototype avec recherche iconifiée, filtres segmentés Toutes/Ouvertes/Clôturées, grille de cartes financières responsive et normalisation visuelle de `UPCOMING` en Ouverte sans modifier le contrat API.
- [x] 5.7 [T-128] Ajouter les tests de rendu des cartes, de progression financière, des filtres segmentés et de l'absence du libellé « À venir », puis exécuter les validations frontend et mettre à jour la PR.
