# shell-logout-text-resize Specification

## Purpose
TBD - created by archiving change corriger-libelle-deconnexion-200. Update Purpose after archive.
## Requirements
### Requirement: Libellé de déconnexion lisible avec texte agrandi

Le frontend SHALL afficher entièrement le contrôle mobile de déconnexion et son libellé visible « Se déconnecter » à 320 et 375 px de largeur, avec un texte à 100 % et 200 %, dans les thèmes clair et sombre. Le shell SHALL permettre le retour à la ligne sans troncature, chevauchement ou défilement horizontal nécessaire pour lire l'action. Cette exigence concerne T-110 et complète le layout T-14 ainsi que la déconnexion T-7.

#### Scenario: Reproduction du retour de revue à 375 px

- **WHEN** un Administrateur connecté affiche l'application à 375 × 667 px avec une taille racine portée de 16 à 32 px
- **THEN** le bouton et tous les fragments du libellé « Se déconnecter » sont contenus dans la largeur visible de l'en-tête
- **AND** le libellé reste lisible sans défilement horizontal ni réduction de taille du texte

#### Scenario: Petit écran et deux thèmes

- **WHEN** un utilisateur connecté affiche l'application à 320 × 568 px, successivement à 100 % et 200 % de texte et dans chacun des deux thèmes
- **THEN** la marque, le changement de thème et le contrôle de déconnexion sont visibles sans se chevaucher
- **AND** le libellé de déconnexion est affiché en entier, avec retour à la ligne si nécessaire

### Requirement: Hauteur de l'en-tête adaptée au contenu

Le frontend SHALL adapter la hauteur de l'en-tête mobile au texte affiché et placer le début du contenu après cet en-tête sans recouvrement ni réserve supérieure fixe devenue inutile. L'en-tête SHALL rester accessible en haut lors du défilement.

#### Scenario: Retour à la ligne des actions

- **WHEN** l'agrandissement du texte impose plusieurs lignes dans l'en-tête mobile
- **THEN** le premier contenu de la page commence sous la hauteur réellement occupée par l'en-tête
- **AND** le haut du contenu n'est pas masqué par les actions

#### Scenario: Passage au layout tablette ou desktop

- **WHEN** la largeur passe de 820 à 821 px puis à une largeur desktop
- **THEN** l'en-tête mobile cède la place à la barre latérale selon le seuil existant
- **AND** la déconnexion reste lisible et le contenu n'a pas de réserve mobile résiduelle

### Requirement: Déconnexion accessible pour chaque rôle connecté

Le frontend SHALL conserver le nom accessible « Se déconnecter », le focus visible et l'activation clavier du bouton pour les rôles Administrateur, Trésorier, Opérateur et Membre. L'activation SHALL supprimer la session locale et afficher `/login`, conformément au comportement existant de T-7 et à l'accès authentifié US-ACC-001. Le contrat `besoins/openapi.yaml` reste inchangé ; aucun nouvel appel API de déconnexion n'est requis.

#### Scenario: Activation clavier après agrandissement

- **WHEN** un utilisateur connecté atteint le bouton par Tab avec texte à 200 % puis l'active par Entrée ou Espace
- **THEN** le focus est visible et le contrôle possède le nom accessible complet « Se déconnecter »
- **AND** la session locale est supprimée et l'écran de connexion est affiché

#### Scenario: Présentation après déconnexion

- **WHEN** la session locale a été supprimée
- **THEN** l'en-tête authentifié et son action de déconnexion ne sont plus affichés
- **AND** le changement de thème reste accessible sur l'écran de connexion

