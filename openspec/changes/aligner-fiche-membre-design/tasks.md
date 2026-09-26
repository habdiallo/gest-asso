## 1. Préparation du ticket

- [x] 1.1 [T-130] Vérifier le registre, résoudre T-130 et confirmer la branche `front/fix-130-fiche-membre` avant toute modification applicative.
- [x] 1.2 [T-130] Relire la maquette membre, les règles frontend, les composants de détail partagés, les tests de la fiche membre et le contrat `MemberDetails`, puis figer les écarts à corriger.

## 2. Implémentation de la fiche membre

- [x] 2.1 [T-130] Migrer `MemberDetailPage` vers `app-detail-shell` et `app-detail-tabs`, avec le retour vers les membres, le hero d'identité et une composition responsive à deux colonnes.
- [x] 2.2 [T-130] Remplacer les cartes individuelles d'information par la carte principale de la maquette, en conservant les champs personnels, associatifs, les valeurs de remplacement et les règles de modification. Aligner le modal Modifier un membre sur la maquette avec ses sections, champs préremplis, sélecteurs, actions et gestion du focus.
- [x] 2.3 [T-130] Ajouter la colonne latérale avec les cartes Situation actuelle et Compte associé, en utilisant les données financières et de compte déjà fournies par l'API sans recalcul local.
- [x] 2.4 [T-130] Harmoniser les actions, les dialogues, les onglets et les trois historiques avec les primitives partagées, tout en conservant les autorisations, la pagination et les états de chargement, erreur et vide. Couvrir les cycles complets des modals Modifier un membre et Nouveau règlement. Limiter les colonnes aux ensembles métier définis dans la spec et retirer toute colonne de journalisation des règlements et contributions.

## 3. Validation et livraison

- [x] 3.1 [T-130] Mettre à jour les tests de la fiche membre et des mocks pour couvrir le rendu cible, les rôles, les actions, les modals de modification et de règlement, les limites de montant, les valeurs absentes, les onglets, le clavier, les historiques paginés et la présence exacte des colonnes métier sans métadonnées d'audit.
- [x] 3.2 [T-130] Comparer la fiche membre aux vues desktop, tablette et mobile de la maquette dans les deux thèmes lorsque le navigateur est disponible, corriger les écarts et documenter les vérifications réalisées.
- [ ] 3.3 [T-130] Exécuter les validations frontend et OpenSpec, préparer une PR ciblée vers `main` avec le ticket et le change référencés, puis traiter la revue avant fusion.
