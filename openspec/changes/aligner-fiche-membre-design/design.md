## Context

La fiche membre est actuellement rendue par `MemberDetailPage` avec un lien de retour, un `PageHeader`, des actions séparées et des cartes individuelles pour les informations. Les onglets et leurs tableaux restent fonctionnels, mais leur structure visuelle diverge du détail des campagnes et des cagnottes déjà migré vers `DetailShell`, `DetailTabs` et `DataTable`.

La maquette cible présente une composition desktop en deux colonnes : une carte principale pour l'identité, les actions et les informations du membre, puis une colonne latérale pour la situation financière et le compte associé. Les onglets et le tableau restent sous la carte principale. La composition doit se réduire en une seule colonne sur les petits écrans sans perte d'information ni d'action.

## Goals / Non-Goals

**Goals:**

- Réutiliser les primitives de détail existantes plutôt que créer une variante spécifique à la fiche membre.
- Reproduire la hiérarchie de la maquette : retour contextuel, identité, actions, informations, situation financière, compte associé, onglets et tableaux.
- Conserver les règles d'autorisation existantes pour la modification, la désactivation, la réactivation et l'enregistrement des règlements.
- Afficher les montants issus de `MemberDetails.financialSummary` avec le formateur GNF existant, sans recalcul depuis les pages paginées.
- Préserver la pagination, le chargement, l'erreur, l'état vide, le rafraîchissement après mutation et la navigation clavier des onglets et dialogues.
- Valider le rendu observable, les noms accessibles, le focus, les rôles et les variantes responsive dans les tests Angular.

**Non-Goals:**

- Modifier le contrat OpenAPI, les endpoints, les DTO générés ou les règles métier de membre.
- Ajouter un nouveau rôle, une nouvelle permission ou une nouvelle opération financière.
- Afficher des données de journalisation dans les tableaux de la fiche membre : les champs d'audit restent hors de cette présentation.
- Reproduire le sélecteur de rôle purement visuel du prototype comme une fonctionnalité applicative.
- Ajouter un outil de composants externe ou un système de design parallèle.

## Decisions

### Réutiliser le shell de détail partagé

La page membre utilisera `app-detail-shell`, `app-detail-tabs`, `app-data-table` et `app-action-button` déjà présents dans `shared/`. Cette option maintient une largeur maximale et des espacements cohérents avec les détails de campagne et de cagnotte. Une implémentation locale dans `member-detail-page.html` créerait une troisième variante difficile à maintenir.

Le shell recevra le retour vers `/membres`, le kicker `Fiche membre`, le nom d'affichage et une introduction limitée au contexte de la fiche. Les actions seront projetées dans la zone du hero.

### Construire la zone de détail en grille responsive

Le contenu après le retour sera organisé dans une grille à deux colonnes à partir du breakpoint desktop utilisé par le prototype. La colonne principale contiendra la carte d'identité et les onglets. La colonne secondaire contiendra deux cartes indépendantes : `Situation actuelle` et `Compte associé`. Sous le breakpoint, les colonnes seront empilées dans l'ordre identité, situation, compte, onglets.

La carte principale regroupera l'avatar, le nom, le badge de statut, la catégorie et la fonction sur une ligne d'identité. Les actions seront alignées à droite sur desktop et passeront à la ligne sur les écrans étroits. Les informations personnelles et associatives seront rendues dans une grille de paires libellé-valeur avec séparateurs visuels, sans cartes imbriquées par champ.

### Utiliser les données API sans calcul métier local

La carte financière affichera `totalRemainingAmount` comme montant principal, puis `totalDueAmount` et `totalPaidAmount`. Les valeurs seront formatées uniquement au rendu par le formateur GNF. La carte de compte associé utilisera `member.account.active`, `member.account.role` et l'identité du membre, avec un message informatif non prescriptif lorsque la fonction associative est distincte du rôle applicatif.

Les états absents resteront distincts d'une valeur nulle : les propriétés optionnelles de contact et de fonction afficheront le remplacement déjà prévu, tandis que les valeurs financières obligatoires de `MemberDetails` seront affichées même lorsqu'elles valent zéro.

### Conserver les composants métier et déléguer les interactions

Les composants `MemberDuesTab`, `MemberPaymentsTab`, `MemberContributionsTab`, `MemberEditForm` et `MemberEditFormOperator` restent responsables de leurs données et de leurs formulaires. La page ne dupliquera pas leurs appels API. L'action d'enregistrement d'un règlement sera branchée sur le parcours déjà fourni par la fiche membre ou, si l'API actuelle ne permet pas une sélection globale depuis le hero, sera présentée comme une navigation explicite vers l'onglet des cotisations plutôt que comme une promesse de dialogue global.

Les dialogues de modification, désactivation et réactivation conserveront leur cycle de vie actuel : prévention des doubles soumissions, erreur visible, nouvelle tentative, fermeture par Échap lorsque permise et restitution du focus au déclencheur.

### Aligner le formulaire de modification du membre

Le clic sur `Modifier` ouvre le formulaire dans un modal centré avec un overlay sombre. Le modal reprend la hiérarchie de la maquette : kicker `Fiche membre`, titre `Modifier un membre`, bouton de fermeture en haut à droite, texte d'introduction, puis deux sections numérotées.

La section `Identité` contient `Nom`, `Prénom`, `Nom d'usage` et `Téléphone`. La section `Localisation et association` contient `Pays`, `Ville`, `Catégorie de revenu` et `Fonction associative`. Sur desktop, chaque section utilise deux colonnes ; les champs passent sur une colonne lorsque la largeur disponible ne permet plus une saisie confortable. Les valeurs existantes sont préremplies et le statut reste géré depuis la fiche, comme indiqué dans l'introduction du modal.

Les champs utilisent les primitives d'input partagées : hauteur minimale de 48 px, fond de surface, bordure simple, rayon cohérent, `outline: none` accompagné d'un état `:focus-visible` accessible, et aucune double bordure provoquée par un ring externe. `Pays` et `Catégorie de revenu` utilisent le composant de sélection partagé avec une indication de choix. Le footer du modal aligne `Annuler` et `Enregistrer`, avec `Enregistrer` en action primaire jaune et un état de chargement pendant la mutation.

Le modal doit gérer le focus initial, le confinement du focus, la fermeture par Échap et la restitution du focus au bouton `Modifier`. Une fermeture ou une annulation ne doit pas envoyer de requête. Une erreur d'enregistrement reste visible dans le modal et permet une nouvelle tentative sans perdre les valeurs saisies.

### Aligner le formulaire d'enregistrement d'un règlement

Le clic sur `Enregistrer un règlement` ouvre un modal intitulé `Nouveau règlement` avec le kicker `Fiche membre`, un bouton de fermeture et un texte indiquant qu'il s'agit d'une opération déjà constatée, sans déclencher de paiement depuis ce formulaire.

Le modal affiche d'abord une synthèse en trois blocs : `Montant dû`, `Déjà payé` et `Reste à payer`. Le reste à payer est mis en évidence avec la couleur d'accent. Le formulaire contient ensuite `Membre` et `Campagne` sous forme de sélecteurs, puis `Montant` et `Date` sur la même ligne, et `Mode de règlement` sous forme de sélecteur. Lorsqu'il est ouvert depuis une fiche membre, le membre concerné est présélectionné. La campagne sélectionnée détermine la synthèse affichée et le plafond de saisie.

Le champ `Montant` est numérique, affiche la devise `GNF`, indique le maximum autorisé correspondant au reste à payer et bloque une valeur supérieure. La date utilise le contrôle de date partagé. Le mode de règlement utilise les options métier existantes. Une alerte informative rappelle que l'opération sera horodatée et associée au compte de l'utilisateur pour assurer sa traçabilité. Cette information est contextuelle au formulaire et ne constitue pas une colonne de journalisation dans les tableaux.

Le footer aligne `Annuler` et `Confirmer l'enregistrement`, avec l'action primaire jaune et un état de chargement pendant la mutation. La confirmation envoie une seule requête avec le membre, la campagne, le montant, la date et le mode de règlement validés. Une annulation, la fermeture ou Échap ferme le modal sans mutation. Le focus est initialisé dans le modal, y reste confiné et revient au déclencheur après fermeture.

### Limiter les tableaux aux données métier nécessaires

Les tableaux de la fiche membre ne doivent présenter que les informations nécessaires à la consultation opérationnelle. Ils ne doivent pas exposer de colonne destinée à la journalisation, même si les DTO de l'API fournissent ces métadonnées pour d'autres usages.

Les colonnes et leur ordre sont fixés ainsi :

- Cotisations : `Campagne`, `Dû`, `Payé`, `Reste`, `Statut`.
- Règlements : `Date`, `Campagne`, `Montant`, `Mode`.
- Contributions : `Cagnotte`, `Montant`, `Mode`, `Date`.

Les champs `recordedBy` et `recordedAt`, ainsi que leurs libellés « Enregistré par », « Enregistrée par » et « Horodatage », peuvent rester présents dans les modèles ou les réponses API pour préserver la compatibilité, mais ne doivent pas être rendus dans ces tableaux. Cette règle reprend la décision de T-129 : les tableaux métier ne sont pas des journaux d'activité.

### Étendre les tests avant de valider l'alignement

Les tests de `MemberDetailPage` seront adaptés aux nouveaux rôles DOM et à la projection du shell. Ils couvriront le rendu de la carte principale et des deux cartes latérales, les permissions par rôle, le statut actif/inactif, l'ouverture et la validation des formulaires de modification et de règlement, l'activation des onglets, les actions de dialogue et la présence des enfants paginés. Les primitives partagées ne seront pas recopiées dans les tests de page.

La vérification visuelle sera menée à au moins 1440 px, 1024 px et 375 px dans les deux thèmes lorsque le navigateur est disponible. Les tests jsdom et la compilation ne seront pas présentés comme un audit d'accessibilité exhaustif.

## Risks / Trade-offs

- [Risque] Le shell partagé peut imposer des espacements ou un ordre de projection qui diffère du prototype membre. → Mitigation : limiter les ajustements à des classes de composition de la page et ne modifier la primitive partagée que si le besoin est commun aux trois fiches.
- [Risque] Une action financière dans le hero pourrait suggérer une sélection de cotisation inexistante. → Mitigation : conserver un libellé de navigation tant qu'aucun sélecteur de dette global n'est supporté par le parcours existant, et tester le comportement réel du clic.
- [Risque] La colonne latérale peut devenir trop étroite ou provoquer un débordement sur tablette. → Mitigation : utiliser une grille avec seuil desktop explicite, des valeurs `min-width: 0` et un empilement avant la largeur minimale nécessaire aux actions.
- [Risque] Les données du compte associé peuvent être optionnelles dans des fixtures anciennes. → Mitigation : couvrir l'état absent avec un remplacement accessible et maintenir le typage généré comme source de vérité.

## Migration Plan

1. Vérifier T-130, la branche `front/fix-130-fiche-membre` et les dépendances locales avant toute modification applicative.
2. Adapter la page et ses tests, puis mettre à jour les mocks uniquement si une donnée déjà contractuelle manque pour rendre la maquette.
3. Exécuter les tests ciblés de la feature membres, le lint, le build et la suite frontend complète selon le diff.
4. Effectuer la vérification visuelle responsive et documenter les limites observées.
5. Publier une PR T-130 vers `main`, traiter la revue, puis fusionner après checks verts.

Le retour arrière consiste à revert la PR T-130. Aucun changement de schéma, de migration ou de contrat API n'est prévu.

## Open Questions

- Le libellé et le comportement définitifs de l'action financière du hero doivent-ils rester une navigation vers les cotisations, ou le produit veut-il introduire un sélecteur de cotisation global dans la fiche membre ?
