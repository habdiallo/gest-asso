## Why

La fiche membre actuelle présente les informations et les historiques dans une structure différente du prototype de référence. Le retour visuel attendu est une fiche de détail cohérente avec les campagnes et les cagnottes, avec un hero lisible, une situation financière immédiatement visible et des actions contextualisées.

## What Changes

- Migrer la fiche membre vers le shell de détail partagé avec le retour vers la liste, le kicker, le titre, la période de contexte et les actions alignées dans le hero.
- Regrouper les informations personnelles et associatives dans une carte principale à deux colonnes, avec des valeurs de remplacement explicites pour les données absentes.
- Ajouter une colonne latérale responsive présentant la situation financière et le compte associé, sans dupliquer ni recalculer les données métier de l'API.
- Harmoniser les actions Modifier, Désactiver/Réactiver et Enregistrer un règlement avec les composants et états visuels partagés, selon les rôles et les autorisations existantes.
- Harmoniser les onglets et les tableaux des cotisations, règlements et contributions avec le composant de détail partagé, en conservant la pagination, les états de chargement, d'erreur et vide.
- Réduire les tableaux de la fiche membre aux colonnes métier nécessaires : date, campagne ou cagnotte, montant et mode de règlement, sans afficher de colonne de journalisation telle que « Enregistré par », « Enregistrée par » ou « Horodatage ».
- Couvrir le rendu desktop et responsive, le clavier, le focus visible et les interactions de dialogue dans les tests de la fiche membre.

## Capabilities

### New Capabilities

- `member-detail-visualization`: Décrit la structure, les informations, les actions, les onglets, les états et le responsive de la fiche membre.

### Modified Capabilities

- Aucune.

## Impact

- Frontend Angular : `features/members/pages/member-detail-page` et ses composants d'onglets et de formulaires.
- Composants partagés : réutilisation du shell de détail, des boutons d'action, des tableaux, des onglets et des primitives de situation financière déjà présentes.
- Mocks et tests frontend : adaptation des fixtures et couverture des rôles, des interactions et des états de données.
- API et contrat OpenAPI : aucun changement prévu. Les données affichées proviennent de `GET /api/v1/members/{memberId}` et des opérations paginées déjà consommées par la fiche membre.
