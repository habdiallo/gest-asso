## ADDED Requirements

### Requirement: Connexion à l'application
Le frontend SHALL proposer un écran de connexion unique (identifiant + mot de passe) sans aucun lien ni formulaire d'inscription libre, conformément à RG-003 et à l'Annexe A (pas de provisioning automatique des identifiants).

#### Scenario: Connexion réussie
- **WHEN** un utilisateur saisit un identifiant et un mot de passe valides et soumet le formulaire
- **THEN** le frontend appelle `POST /auth/login`, stocke le jeton de session retourné et redirige vers le tableau de bord correspondant au rôle de l'utilisateur

#### Scenario: Connexion refusée
- **WHEN** l'API retourne une erreur d'authentification pour les identifiants saisis
- **THEN** le frontend affiche un message d'erreur explicite sur le formulaire sans révéler si c'est l'identifiant ou le mot de passe qui est invalide, et ne redirige pas l'utilisateur

#### Scenario: Absence d'inscription libre
- **WHEN** un visiteur non authentifié consulte l'écran de connexion
- **THEN** aucun lien ni bouton "créer un compte" ou "s'inscrire" n'est proposé

### Requirement: Session et déconnexion
Le frontend SHALL maintenir l'état de session de l'utilisateur connecté et permettre une déconnexion explicite à tout moment.

#### Scenario: Expiration de session
- **WHEN** une requête API retourne une erreur d'authentification (session expirée ou jeton invalide)
- **THEN** le frontend invalide la session locale et redirige l'utilisateur vers l'écran de connexion

#### Scenario: Déconnexion manuelle
- **WHEN** l'utilisateur connecté déclenche l'action de déconnexion
- **THEN** le frontend supprime la session locale et affiche l'écran de connexion

### Requirement: Navigation adaptée au rôle applicatif
Le frontend SHALL afficher une navigation (menu, tableau de bord, accès aux écrans) déterminée par le rôle applicatif de l'utilisateur connecté (Administrateur, Trésorier, Opérateur, Membre), conformément à la matrice des responsabilités (§3) et sans jamais exposer de rôle "Président" (Annexe A).

#### Scenario: Menu Administrateur
- **WHEN** un utilisateur avec le rôle Administrateur est connecté
- **THEN** le frontend affiche les accès aux membres, catégories de revenu, campagnes, cagnottes, rôles/utilisateurs et son propre espace personnel

#### Scenario: Menu Trésorier
- **WHEN** un utilisateur avec le rôle Trésorier est connecté
- **THEN** le frontend affiche les accès aux membres (sans gestion des rôles ni des catégories), campagnes, cagnottes et son espace personnel, sans accès à la gestion des rôles ni des catégories de revenu

#### Scenario: Menu Opérateur
- **WHEN** un utilisateur avec le rôle Opérateur est connecté
- **THEN** le frontend affiche la consultation des membres et des campagnes/cagnottes autorisées et son espace personnel, sans accès à la gestion des rôles, des catégories, ni à la clôture de campagne/cagnotte

#### Scenario: Menu Membre
- **WHEN** un utilisateur avec le rôle Membre est connecté
- **THEN** le frontend affiche uniquement son espace personnel (profil, cotisations, contributions)

#### Scenario: Tentative d'accès à un écran non autorisé
- **WHEN** un utilisateur navigue (via une URL directe ou un lien) vers un écran non autorisé pour son rôle
- **THEN** le frontend bloque l'accès et affiche un message d'accès refusé, sans exposer les données de l'écran cible

### Requirement: Restriction d'écriture selon l'autorisation de l'Opérateur
Le frontend SHALL adapter dynamiquement les actions proposées à un utilisateur du rôle Opérateur selon l'attribut `peut_enregistrer_paiements` (RG-ROLE-007 à RG-ROLE-009).

#### Scenario: Opérateur non autorisé
- **WHEN** un utilisateur Opérateur dont `peut_enregistrer_paiements` vaut "non" consulte une cotisation ou une cagnotte
- **THEN** le frontend n'affiche aucune action d'enregistrement de règlement ou de contribution, uniquement la consultation

#### Scenario: Opérateur autorisé
- **WHEN** un utilisateur Opérateur dont `peut_enregistrer_paiements` vaut "oui" consulte une cotisation ou une cagnotte
- **THEN** le frontend propose les actions d'enregistrement de règlement ou de contribution

### Requirement: Adaptation responsive de l'interface
Le frontend SHALL fonctionner sur les tailles d'écran desktop, tablette et mobile, avec les formulaires ouverts en dialogue contextuel sur desktop/tablette et en plein écran sur mobile.

#### Scenario: Ouverture d'un formulaire sur desktop
- **WHEN** un utilisateur déclenche un formulaire de création ou modification sur un écran desktop ou tablette
- **THEN** le frontend ouvre le formulaire dans une boîte de dialogue superposée au contenu courant

#### Scenario: Ouverture d'un formulaire sur mobile
- **WHEN** un utilisateur déclenche un formulaire de création ou modification sur un écran mobile
- **THEN** le frontend ouvre le formulaire en plein écran

### Requirement: Formatage des montants en Franc Guinéen
Le frontend SHALL afficher tout montant conformément aux règles RG-FMT-001 à RG-FMT-004 : entiers uniquement, séparateur de milliers en affichage détaillé, notation condensée K/M/Mds en listes et tableaux de bord, avec la valeur brute toujours accessible.

#### Scenario: Affichage détaillé
- **WHEN** un montant est affiché sur une fiche, un historique ou un export
- **THEN** le frontend l'affiche en valeur complète avec séparateur de milliers et suffixe "GNF" (ex. "1 250 000 GNF")

#### Scenario: Affichage condensé en liste
- **WHEN** un montant supérieur ou égal à 1 000 GNF est affiché dans une liste ou un tableau de bord
- **THEN** le frontend applique la notation condensée avec au maximum une décimale (K, M ou Mds selon le seuil) et rend la valeur brute accessible via info-bulle ou clic

#### Scenario: Saisie assistée d'un montant
- **WHEN** un utilisateur saisit un montant dans un champ de formulaire (montant de campagne, règlement, contribution)
- **THEN** le frontend formate automatiquement la saisie avec séparateur de milliers pendant la frappe et n'accepte que des valeurs entières

### Requirement: Sélection de mode de règlement restreinte
Le frontend SHALL restreindre le choix du mode de règlement, pour tout enregistrement de règlement ou de contribution, aux trois valeurs Espèces, Mobile Money et Virement bancaire (RG-PAY-009, RG-016), sans aucun déclenchement de paiement en ligne.

#### Scenario: Choix du mode de règlement
- **WHEN** un utilisateur autorisé ouvre le formulaire d'enregistrement d'un règlement ou d'une contribution
- **THEN** le frontend propose exactement trois options : Espèces, Mobile Money, Virement bancaire, sans intégration de paiement en ligne
