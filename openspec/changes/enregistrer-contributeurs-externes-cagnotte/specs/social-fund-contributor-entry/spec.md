## ADDED Requirements

### Requirement: Dialogue de contribution aéré et contextualisé

Le système SHALL afficher un dialogue d'enregistrement structuré avec un titre, une aide expliquant qu'il s'agit d'un encaissement déjà constaté, la cagnotte en contexte, les champs de contributeur, montant, date et mode, une information de traçabilité et un pied de formulaire avec annulation et confirmation. Ce dialogue SHALL reprendre le gabarit visuel des dialogues d'enregistrement de règlement : largeur paysage sur desktop, grille à deux colonnes lorsque l'espace le permet, espacements cohérents et retour à une colonne sur mobile.

#### Scenario: Ouverture depuis une cagnotte ouverte

- **WHEN** un Administrateur, un Trésorier ou un Opérateur autorisé ouvre l'action d'enregistrement depuis la fiche d'une cagnotte ouverte
- **THEN** le dialogue affiche le titre de la cagnotte en lecture seule
- **AND** les champs sont espacés et regroupés dans un ordre de saisie cohérent
- **AND** le dialogue conserve une navigation clavier et un nom accessible
- **AND** la composition visuelle est cohérente avec les dialogues d'enregistrement de règlement

#### Scenario: Dialogue affiché sur une petite fenêtre
- **WHEN** le dialogue est affiché dans une fenêtre inférieure au breakpoint desktop
- **THEN** les champs sont empilés sur une colonne
- **AND** aucun contenu ni pied d'actions ne déborde horizontalement

#### Scenario: Cagnotte clôturée ou rôle non autorisé

- **WHEN** un utilisateur consulte une cagnotte clôturée ou ne possède pas le droit d'enregistrer une contribution
- **THEN** l'action d'ouverture du dialogue n'est pas proposée
- **AND** une tentative directe d'envoi ne contourne pas l'autorisation serveur

### Requirement: Choix exclusif du contributeur

Le système SHALL proposer par défaut la sélection d'un membre et une case à cocher « Contributeur externe » ; lorsque cette case est activée, la sélection membre est remplacée par une saisie de prénom et de nom. Le système SHALL soumettre exactement une identité contributrice.

#### Scenario: Sélection d'un membre

- **WHEN** la case « Contributeur externe » est désactivée, que l'utilisateur recherche un nom ou un prénom et sélectionne un membre
- **THEN** le formulaire conserve l'identifiant du membre sélectionné
- **AND** les champs de contributeur externe sont absents ou désactivés
- **AND** la requête contient `memberId` sans `externalContributor`

#### Scenario: Saisie d'un contributeur externe

- **WHEN** l'utilisateur active la case « Contributeur externe » et saisit un prénom et un nom valides
- **THEN** le formulaire conserve ces deux valeurs comme identité de la contribution
- **AND** le champ de sélection membre est absent ou désactivé
- **AND** la requête contient `externalContributor` sans `memberId`
- **AND** aucun membre ni compte utilisateur n'est créé

#### Scenario: Changement de mode avant validation

- **WHEN** l'utilisateur active ou désactive la case « Contributeur externe » avant l'enregistrement
- **THEN** les valeurs du mode abandonné sont vidées ou exclues de la requête
- **AND** une seule variante de contributeur est envoyée

#### Scenario: Identité contributrice incomplète

- **WHEN** aucun membre n'est sélectionné, ou lorsqu'un prénom ou un nom externe est vide ou invalide
- **THEN** le formulaire bloque la soumission
- **AND** une erreur associée au champ concerné est annoncée sans perdre les autres valeurs saisies

### Requirement: Enregistrement des données financières et de traçabilité

Le système SHALL conserver les règles existantes pour le montant positif en GNF, la date, le mode de contribution, l'utilisateur ayant saisi l'opération et l'interdiction d'enregistrer une contribution sur une cagnotte clôturée.

#### Scenario: Contribution membre enregistrée

- **WHEN** le formulaire membre est valide et que `POST /social-funds/{socialFundId}/contributions` accepte la requête
- **THEN** la contribution est créée avec le membre sélectionné, le montant, la date et le mode
- **AND** le bilan de la cagnotte et la première page de l'historique sont rafraîchis
- **AND** le dialogue se ferme après le succès

#### Scenario: Contribution externe enregistrée

- **WHEN** le formulaire externe est valide et que l'API accepte la requête
- **THEN** la contribution est créée avec le prénom et le nom externes comme instantané
- **AND** elle apparaît dans l'historique avec une distinction permettant de ne pas la confondre avec un membre
- **AND** le bilan de la cagnotte est rafraîchi

#### Scenario: Refus serveur ou erreur réseau

- **WHEN** l'API refuse la contribution, notamment pour une cagnotte clôturée, une autorisation insuffisante ou une requête invalide
- **THEN** le dialogue reste ouvert
- **AND** l'erreur est annoncée selon le code contractuel
- **AND** les valeurs saisies sont conservées pour correction ou nouvelle tentative

### Requirement: Gabarit commun des formulaires d'enregistrement

Les dialogues d'enregistrement d'un règlement depuis une fiche membre, d'un règlement depuis une cotisation de campagne et d'une contribution depuis une cagnotte SHALL utiliser un gabarit de présentation commun. Ce gabarit SHALL harmoniser la largeur desktop cible, les espacements, les labels, la grille des champs financiers, l'aide de traçabilité et le pied d'actions, tout en laissant chaque feature conserver ses champs et ses règles métier.

#### Scenario: Formulaires affichés sur desktop
- **WHEN** un utilisateur autorisé ouvre l'un des trois dialogues d'enregistrement
- **THEN** le dialogue utilise une largeur paysage cohérente
- **AND** les champs compatibles sont répartis en deux colonnes
- **AND** les actions d'annulation et de confirmation sont alignées dans un pied distinct

#### Scenario: Différences métier préservées
- **WHEN** le dialogue de règlement ou de contribution est affiché
- **THEN** le résumé dû, déjà payé et reste à payer reste propre au règlement lorsque disponible
- **AND** le choix membre ou contributeur externe reste propre à la contribution
- **AND** aucune règle de validation ou d'autorisation n'est supprimée au profit de l'harmonisation visuelle

### Requirement: Recherche de membre accessible

Le système SHALL permettre de trouver un membre par son nom ou son prénom sans supprimer la pagination contractuelle ni rendre la sélection dépendante d'une seule page chargée.

#### Scenario: Recherche avec plusieurs pages

- **WHEN** l'utilisateur saisit une recherche de membre
- **THEN** la recherche est amortie et repart de la première page
- **AND** la liste affiche uniquement les résultats correspondant à la recherche courante
- **AND** les réponses obsolètes ne remplacent pas la liste la plus récente

#### Scenario: Échec de chargement des membres

- **WHEN** le chargement ou la recherche des membres échoue
- **THEN** le dialogue annonce l'erreur
- **AND** l'enregistrement est bloqué tant qu'une identité membre valide n'est pas disponible
