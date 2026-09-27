## ADDED Requirements

### Requirement: Liste des campagnes de cotisation
Le frontend SHALL afficher une liste des campagnes de cotisation pour l'Administrateur, le Trésorier et l'Opérateur, avec recherche et filtres (statut, période).

#### Scenario: Consultation de la liste
- **WHEN** un utilisateur Administrateur, Trésorier ou Opérateur ouvre l'écran des campagnes
- **THEN** le frontend affiche la liste des campagnes avec nom, période et statut (ouverte/clôturée)

#### Scenario: Recherche et filtre
- **WHEN** un utilisateur filtre les campagnes par statut ou recherche par nom
- **THEN** le frontend n'affiche que les campagnes correspondant aux critères sélectionnés

### Requirement: Création d'une campagne
Le frontend SHALL permettre à l'Administrateur et au Trésorier de créer une campagne (Nom, Description, Date de début, Date de fin, Membres concernés), avec la date de fin postérieure ou égale à la date de début (US-COT-001, RG-COT-001 à RG-COT-005).

#### Scenario: Création réussie
- **WHEN** un utilisateur Administrateur ou Trésorier soumet le formulaire de création avec un nom, une date de début et une date de fin valides
- **THEN** le frontend appelle l'API de création et affiche la nouvelle campagne dans la liste

#### Scenario: Date de fin antérieure à la date de début
- **WHEN** un utilisateur saisit une date de fin antérieure à la date de début
- **THEN** le frontend bloque la soumission et affiche une erreur de validation sur les dates (RG-COT-005)

#### Scenario: Action masquée pour Opérateur et Membre
- **WHEN** un utilisateur Opérateur ou Membre consulte la liste des campagnes
- **THEN** le frontend n'affiche aucune action de création de campagne

### Requirement: Configuration des montants par catégorie
Le frontend SHALL permettre à l'Administrateur et au Trésorier de définir, pour chaque catégorie de revenu, le montant applicable dans une campagne donnée, sans jamais modifier le référentiel des catégories ni un montant permanent de membre (US-COT-002, RG-COT-006 à RG-COT-010).

#### Scenario: Saisie du barème
- **WHEN** un utilisateur Administrateur ou Trésorier configure un montant pour chaque catégorie de revenu dans une campagne
- **THEN** le frontend affiche un champ de saisie de montant par catégorie, formaté en GNF pendant la frappe, et appelle l'API de configuration au moment de l'enregistrement

#### Scenario: Catégorie sans montant configuré
- **WHEN** une catégorie de revenu existe mais n'a pas de montant configuré pour la campagne consultée
- **THEN** le frontend signale visuellement que le barème est incomplet pour cette catégorie

### Requirement: Établissement et consultation des cotisations d'une campagne
Le frontend SHALL afficher, pour chaque membre concerné par une campagne, le montant dû, le montant payé, le reste à payer et le statut (À payer / Partiellement payé / Payé / En retard), pour les rôles Administrateur, Trésorier et Opérateur (US-COT-003, US-COT-004).

#### Scenario: Affichage de la situation par membre
- **WHEN** un utilisateur Administrateur, Trésorier ou Opérateur ouvre l'onglet des cotisations d'une campagne
- **THEN** le frontend liste chaque membre concerné avec sa catégorie, le montant dû, le montant payé, le reste à payer et son statut

#### Scenario: Vue limitée pour l'Opérateur
- **WHEN** un utilisateur Opérateur consulte les cotisations d'une campagne
- **THEN** le frontend affiche une vue limitée conforme à la matrice des responsabilités, sans agrégats financiers réservés à l'Administrateur/Trésorier

#### Scenario: Filtrage par statut de cotisation
- **WHEN** un utilisateur filtre les cotisations d'une campagne par statut (À payer, Partiellement payé, Payé, En retard)
- **THEN** le frontend n'affiche que les membres correspondant au statut sélectionné

### Requirement: Enregistrement d'un règlement
Le frontend SHALL permettre au Trésorier et à l'Opérateur autorisé d'enregistrer un règlement sur une cotisation, avec Membre, Campagne, Montant, Date, Mode de règlement (Espèces / Mobile Money / Virement bancaire), et SHALL bloquer côté UI tout montant dépassant le reste à payer (US-COT-005, RG-PAY-001 à RG-PAY-003, RG-PAY-007, RG-PAY-009).

#### Scenario: Enregistrement réussi
- **WHEN** un utilisateur Trésorier ou Opérateur autorisé soumet un règlement dont le montant est inférieur ou égal au reste à payer
- **THEN** le frontend appelle l'API d'enregistrement du règlement et met à jour le montant payé, le reste à payer et le statut de la cotisation affichés

#### Scenario: Montant supérieur au reste à payer
- **WHEN** un utilisateur saisit un montant de règlement supérieur au reste à payer de la cotisation
- **THEN** le frontend bloque la soumission avant l'appel API et affiche un message indiquant le reste à payer maximal autorisé (RG-PAY-007)

#### Scenario: Action indisponible pour un Opérateur non autorisé
- **WHEN** un utilisateur Opérateur dont `peut_enregistrer_paiements` vaut "non" consulte une cotisation
- **THEN** le frontend n'affiche aucune action d'enregistrement de règlement

#### Scenario: Traçabilité affichée
- **WHEN** un utilisateur consulte l'historique des règlements d'une cotisation
- **THEN** le frontend affiche, pour chaque règlement, l'utilisateur qui l'a enregistré et l'horodatage de la saisie (RG-PAY-008)

### Requirement: Suivi des paiements partiels
Le frontend SHALL permettre l'enregistrement de plusieurs règlements successifs pour une même cotisation et afficher le reste à payer recalculé après chaque règlement (US-COT-006, RG-PAY-004 à RG-PAY-006).

#### Scenario: Deuxième règlement partiel
- **WHEN** un utilisateur enregistre un règlement sur une cotisation déjà partiellement payée
- **THEN** le frontend recalcule et affiche le nouveau reste à payer et le statut mis à jour (Partiellement payé ou Payé)

#### Scenario: Cotisation soldée
- **WHEN** la somme des règlements enregistrés atteint le montant dû
- **THEN** le frontend affiche le statut "Payé" et masque l'action d'enregistrement d'un nouveau règlement pour cette cotisation

### Requirement: Bilan financier d'une campagne
Le frontend SHALL afficher, pour l'Administrateur, le Trésorier et l'Opérateur autorisé, le bilan d'une campagne : total attendu, total encaissé, reste à encaisser, et répartition des membres par statut de paiement (US-COT-007, RG-COT-014 à RG-COT-016).

#### Scenario: Consultation du bilan
- **WHEN** un utilisateur Administrateur, Trésorier ou Opérateur autorisé ouvre l'onglet bilan d'une campagne
- **THEN** le frontend affiche le total attendu, le total encaissé, le reste à encaisser et le nombre de membres ayant payé, partiellement payé et n'ayant pas payé

#### Scenario: Montants agrégés en notation condensée
- **WHEN** le bilan d'une campagne affiche des montants agrégés
- **THEN** le frontend applique la notation condensée K/M/Mds (RG-FMT-003) avec accès à la valeur brute complète

### Requirement: Clôture d'une campagne
Le frontend SHALL permettre à l'Administrateur et au Trésorier de clôturer une campagne, après quoi elle reste consultable mais n'est plus modifiable (US-COT-008).

#### Scenario: Clôture réussie
- **WHEN** un utilisateur Administrateur ou Trésorier déclenche l'action de clôture d'une campagne et confirme
- **THEN** le frontend appelle l'API de clôture et affiche la campagne comme clôturée, tout en conservant l'accès à son historique de cotisations et de règlements

#### Scenario: Actions de modification désactivées après clôture
- **WHEN** un utilisateur consulte une campagne clôturée
- **THEN** le frontend désactive toute action de modification du barème, d'ajout de membre concerné ou d'enregistrement de nouveau règlement

#### Scenario: Confirmation requise avant clôture
- **WHEN** un utilisateur Administrateur ou Trésorier déclenche l'action de clôture
- **THEN** le frontend affiche une confirmation explicite avant d'envoyer la requête, rappelant que l'opération est définitive
