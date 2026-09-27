# social-fund-contributor-entry Specification

## Purpose
TBD - created by archiving change enregistrer-contributeurs-externes-cagnotte. Update Purpose after archive.
## Requirements

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

- **WHEN** la case « Contributeur externe » est désactivée et que l'utilisateur sélectionne un membre dans le select
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

### Requirement: Contexte du règlement selon le point d'entrée

Le système SHALL conserver un gabarit visuel commun pour l'enregistrement d'un règlement tout en adaptant les champs de contexte au point d'entrée. Un règlement SHALL être associé à une seule cotisation et à son `dueId`.

#### Scenario: Règlement ouvert depuis une campagne

- **WHEN** un utilisateur autorisé ouvre l'enregistrement depuis une ligne de cotisation d'une campagne `OPEN`
- **THEN** le dialogue affiche le membre et la campagne de la cotisation sélectionnée en lecture seule
- **AND** aucun sélecteur de membre ou de campagne n'est proposé
- **AND** le résumé affiche le montant dû, le montant déjà payé et le reste à payer de cette cotisation
- **AND** le montant saisi ne dépasse pas le reste à payer de cette cotisation
- **AND** la requête est envoyée sur `POST /dues/{dueId}/payments` avec le `dueId` de la ligne initiale

#### Scenario: Règlement ouvert depuis une fiche membre

- **WHEN** un utilisateur autorisé ouvre l'enregistrement depuis la fiche d'un membre
- **THEN** le membre de la fiche est affiché en lecture seule
- **AND** le sélecteur de campagne ne propose que les cotisations de ce membre rattachées à une campagne `OPEN` et dont le reste est positif
- **AND** le résumé se met à jour selon la cotisation sélectionnée
- **AND** le montant saisi ne dépasse pas le reste à payer de la cotisation sélectionnée
- **AND** le règlement est enregistré sur une seule cotisation

#### Scenario: Aucune cotisation éligible depuis une fiche membre

- **WHEN** le membre ne possède aucune cotisation d'une campagne `OPEN` avec un reste positif
- **THEN** l'action d'enregistrement est désactivée ou un état explicite indique qu'aucun règlement n'est disponible
- **AND** aucun montant cumulé n'est présenté comme montant imputable

#### Scenario: Ventilation entre plusieurs campagnes hors MVP

- **WHEN** l'utilisateur ouvre un règlement depuis la fiche membre
- **THEN** le formulaire ne permet pas de répartir un montant entre plusieurs cotisations
- **AND** une seule cotisation est envoyée à `POST /dues/{dueId}/payments`

#### Scenario: Préselection depuis une fiche membre

- **WHEN** le membre possède au moins une cotisation d'une campagne `OPEN` avec un reste positif
- **THEN** la première cotisation éligible renvoyée par l'API est sélectionnée à l'ouverture du dialogue
- **AND** le résumé affiche immédiatement son montant dû, son montant déjà payé et son reste à payer
- **AND** le sélecteur permet toujours de choisir une autre cotisation éligible
- **AND** la soumission utilise le `dueId` de la cotisation sélectionnée

### Requirement: Résumé et actions harmonisés entre les points d'entrée

Le dialogue de règlement ouvert depuis une campagne SHALL utiliser le même résumé financier et le même gabarit d'actions que le dialogue ouvert depuis une fiche membre. Le résumé SHALL être calculé à partir de la cotisation fournie par le point d'entrée et ne SHALL jamais agréger plusieurs campagnes. Les boutons SHALL conserver leur intention métier, avec des libellés courts lorsque le contexte est déjà affiché.

#### Scenario: Règlement ouvert depuis une campagne

- **WHEN** l'utilisateur ouvre un règlement depuis une ligne de cotisation d'une campagne ouverte
- **THEN** le dialogue affiche le montant dû, le montant déjà payé et le reste à payer de cette ligne
- **AND** le montant accepté reste borné par le reste à payer de cette ligne
- **AND** le membre, la campagne et le résumé restent cohérents avec le `dueId` envoyé à l'API

#### Scenario: Libellé de confirmation contextualisé

- **WHEN** le dialogue de règlement est déjà identifié par son titre et son contexte
- **THEN** l'action finale utilise « Confirmer » plutôt qu'une répétition comme « Confirmer l'enregistrement »
- **AND** une action de ligne peut conserver un libellé descriptif comme « Enregistrer un règlement »

### Requirement: Recherche intégrée des selects volumineux

Tout `app-custom-select` SHALL afficher une recherche en première ligne de son menu lorsque sa liste contient plus de 20 options. Le select membre SHALL conserver la pagination lorsque l'API renvoie plusieurs pages, afin qu'un membre situé au-delà de la première page reste sélectionnable.

#### Scenario: Recherche avec plus de 20 options

- **WHEN** un select reçoit plus de 20 options et que l'utilisateur ouvre son menu
- **THEN** un champ de recherche est affiché en première ligne du menu
- **AND** la saisie filtre les options sans champ de recherche externe au select
- **AND** une liste de 20 options ou moins n'affiche pas ce champ

#### Scenario: Navigation avec plusieurs pages

- **WHEN** la liste des membres est paginée par l'API
- **THEN** le select affiche la page courante et ses actions de pagination
- **AND** l'utilisateur peut atteindre les pages suivantes sans perdre le filtrage de la page courante
- **AND** une réponse obsolète ne remplace pas la page la plus récente

#### Scenario: Échec de chargement des membres

- **WHEN** le chargement d'une page de membres échoue
- **THEN** le dialogue annonce l'erreur
- **AND** l'enregistrement est bloqué tant qu'une identité membre valide n'est pas disponible

### Requirement: Calendrier de saisie harmonisé

Les champs de date des formulaires de règlement, de contribution, de création de campagne et de création de cagnotte SHALL utiliser un calendrier partagé aux couleurs du thème Contribo. Le contrôle SHALL conserver une valeur de formulaire au format `YYYY-MM-DD` et les validations existantes.

#### Scenario: Ouverture du calendrier

- **WHEN** l'utilisateur active un champ de date
- **THEN** un calendrier sombre et accessible s'ouvre dans le thème Contribo
- **AND** le mois, les jours, la navigation, l'action d'effacement et l'action « Aujourd'hui » sont visibles
- **AND** sans valeur initiale, le jour courant est repéré comme sélection visuelle par défaut sans modifier la valeur du formulaire
- **AND** l'action « Aujourd'hui » est désactivée lorsque le jour courant est sélectionné et réactivée lorsqu'une autre date l'est
- **AND** la date sélectionnée est identifiable avec un contraste lisible dans les thèmes sombre et clair
- **AND** le clavier permet de fermer le calendrier avec Échap

#### Scenario: Date envoyée à l'API

- **WHEN** l'utilisateur sélectionne une date dans le calendrier
- **THEN** le champ affiche la date en `jj/mm/aaaa`
- **AND** la valeur propagée au formulaire reste au format `YYYY-MM-DD`
- **AND** les validateurs requis et les validateurs de plage existants continuent de s'appliquer
