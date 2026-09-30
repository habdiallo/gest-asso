## MODIFIED Requirements

### Requirement: Création d'un membre
Le frontend SHALL permettre à l'Administrateur et au Trésorier de créer un membre via un formulaire (Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie de revenu, Fonction, Statut), et SHALL masquer cette action pour l'Opérateur et le Membre (US-MEM-001, RG-MEM-001). Après une création réussie, il SHALL afficher une confirmation contenant l'identifiant et le mot de passe temporaire retournés une seule fois par l'API, avec une action de copie accessible.

#### Scenario: Création réussie
- **WHEN** un utilisateur Administrateur ou Trésorier soumet le formulaire de création avec les champs obligatoires renseignés, dont une catégorie de revenu (RG-MEM-002)
- **THEN** le frontend appelle l'API de création du membre, affiche le nouveau membre avec le statut Actif par défaut (RG-MEM-003), confirme qu'un compte utilisateur associé a été créé (RG-MEM-004) et affiche une confirmation dédiée avec l'identifiant et le mot de passe temporaire à transmettre

#### Scenario: Copie du mot de passe temporaire
- **WHEN** l'utilisateur active le bouton de copie dans la confirmation de création
- **THEN** le frontend copie le mot de passe temporaire dans le presse-papiers, affiche un retour accessible de copie réussie et ne persiste pas le secret dans `localStorage`, une URL ou un état durable

#### Scenario: Fermeture de la confirmation
- **WHEN** l'utilisateur ferme la confirmation contenant le secret temporaire
- **THEN** le frontend ne propose plus de relire ce secret et indique que l'Administrateur peut déclencher une régénération depuis la gestion des utilisateurs

#### Scenario: Catégorie de revenu manquante
- **WHEN** un utilisateur soumet le formulaire de création sans avoir sélectionné de catégorie de revenu
- **THEN** le frontend bloque la soumission et affiche une erreur de validation sur le champ catégorie

#### Scenario: Action masquée pour un rôle non autorisé
- **WHEN** un utilisateur Opérateur ou Membre consulte la liste des membres
- **THEN** le frontend n'affiche aucune action de création de membre
