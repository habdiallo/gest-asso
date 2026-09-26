## Why

La fiche membre actuelle présente les informations et les historiques dans une structure différente du prototype de référence. Le retour visuel attendu est une fiche de détail cohérente avec les campagnes et les cagnottes, avec un hero lisible, une situation financière immédiatement visible et des actions contextualisées.

## What Changes

- Migrer la fiche membre vers le shell de détail partagé avec le retour vers la liste, le kicker, le titre, la période de contexte et les actions alignées dans le hero.
- Regrouper les informations personnelles et associatives dans une carte principale à deux colonnes, avec des valeurs de remplacement explicites pour les données absentes.
- Ajouter une colonne latérale responsive présentant la situation financière et le compte associé, sans dupliquer ni recalculer les données métier de l'API.
- Harmoniser les actions Modifier, Désactiver/Réactiver et Enregistrer un règlement avec les composants et états visuels partagés, selon les rôles et les autorisations existantes.
- Aligner le formulaire ouvert par l'action Modifier sur la maquette : modal « Modifier un membre », sections Identité et Localisation et association, champs préremplis, sélecteurs cohérents et actions Annuler/Enregistrer.
- Aligner le parcours ouvert par l'action Enregistrer un règlement sur la maquette : modal « Nouveau règlement », synthèse de la cotisation, choix du membre et de la campagne, montant plafonné au reste à payer, date, mode de règlement et confirmation explicite.
- Harmoniser les onglets et les tableaux des cotisations, règlements et contributions avec le composant de détail partagé, en conservant la pagination, les états de chargement, d'erreur et vide.
- Supprimer l'onglet Informations redondant de la fiche cagnotte, conserver la description et la progression dans le hero, puis afficher directement l'historique des contributions.
- Réduire les tableaux de la fiche membre aux colonnes métier nécessaires : date, campagne ou cagnotte, montant et mode de règlement, sans afficher de colonne de journalisation telle que « Enregistré par », « Enregistrée par » ou « Horodatage ».
- Couvrir le rendu desktop et responsive, le clavier, le focus visible et les interactions de dialogue dans les tests de la fiche membre.

## Capabilities

### New Capabilities

- `member-detail-visualization`: Décrit la structure, les informations, les actions, les onglets, les états et le responsive de la fiche membre.

### Modified Capabilities

- Aucune.

## Impact

- Frontend Angular : `features/members/pages/member-detail-page` et ses composants d'onglets et de formulaires, ainsi que `features/social-funds/pages/social-fund-detail-page` pour la suppression de l'onglet redondant.
- Composants partagés : réutilisation du shell de détail, des boutons d'action, des tableaux, des onglets et des primitives de situation financière déjà présentes.
- Mocks et tests frontend : adaptation des fixtures et couverture des rôles, des interactions et des états de données.
- API et contrat OpenAPI : aucun changement prévu. Les données affichées proviennent de `GET /api/v1/members/{memberId}` et des opérations paginées déjà consommées par la fiche membre.
